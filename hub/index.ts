import { randomUUIDv7, type ServerWebSocket } from "bun";
import type { IncomingMessage, SignupIncomingMessage } from "./types";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";
import { Client } from "pg";

const db = new Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

const availableValidators: { validatorId: string, socket: ServerWebSocket<unknown>, publicKey: string }[] = [];

const CALLBACKS: { [callbackId: string]: (data: IncomingMessage) => void } = {}
const COST_PER_VALIDATION = 100; // in lamports

Bun.serve({
    fetch(req, server) {
        if (server.upgrade(req)) {
            return;
        }
        return new Response("Upgrade failed", { status: 500 });
    },
    port: 8081,
    websocket: {
        async message(ws: ServerWebSocket<unknown>, message: string) {
            const data: IncomingMessage = JSON.parse(message);

            if (data.type === 'signup') {
                const verified = await verifyMessage(
                    `Signed message for ${data.data.callbackId}, ${data.data.publicKey}`,
                    data.data.publicKey,
                    data.data.signedMessage
                );
                if (verified) {
                    await signupHandler(ws, data.data);
                }
            } else if (data.type === 'validate') {
                CALLBACKS[data.data.callbackId](data);
                delete CALLBACKS[data.data.callbackId];
            }
        },
        async close(ws: ServerWebSocket<unknown>) {
            availableValidators.splice(availableValidators.findIndex(v => v.socket === ws), 1);
        }
    },
});

async function signupHandler(ws: ServerWebSocket<unknown>, { ip, publicKey, signedMessage, callbackId }: SignupIncomingMessage) {
    const { rows: validatorRows } = await db.query(
        'SELECT * FROM validator WHERE publicKey = $1 LIMIT 1',
        [publicKey]
    );

    let validatorId: string;
    if (validatorRows.length > 0) {
        const validator = validatorRows[0];
        validatorId = validator.id;
    } else {
        const result = await db.query(
            'INSERT INTO validator (ip, publicKey, location) VALUES ($1, $2, $3) RETURNING *',
            [ip, publicKey, 'unknown']
        );
        validatorId = result.rows[0].id;
    }

    ws.send(JSON.stringify({
        type: 'signup',
        data: {
            validatorId,
            callbackId,
        },
    }));

    availableValidators.push({
        validatorId,
        socket: ws,
        publicKey,
    });
}

async function verifyMessage(message: string, publicKey: string, signature: string) {
    const messageBytes = nacl_util.decodeUTF8(message);
    const result = nacl.sign.detached.verify(
        messageBytes,
        new Uint8Array(JSON.parse(signature)),
        new PublicKey(publicKey).toBytes(),
    );
    return result;
}

setInterval(async () => {
    const { rows: websitesToMonitor } = await db.query('SELECT * FROM website WHERE disabled = false');

    for (const website of websitesToMonitor) {
        availableValidators.forEach(validator => {
            const callbackId = randomUUIDv7();
            console.log(`Sending validate to ${validator.validatorId} ${website.url}`);

            validator.socket.send(JSON.stringify({
                type: 'validate',
                data: {
                    url: website.url,
                    callbackId
                },
            }));

            CALLBACKS[callbackId] = async (data: IncomingMessage) => {
                if (data.type === 'validate') {
                    const { validatorId, status, latency, signedMessage } = data.data;
                    const verified = await verifyMessage(
                        `Replying to ${callbackId}`,
                        validator.publicKey,
                        signedMessage
                    );
                    if (!verified) return;

                    const tx = await db.query('BEGIN');
                    try {
                        await db.query(`
                            INSERT INTO websiteTick (websiteId, validatorId, status, latency, createdAt)
                            VALUES ($1, $2, $3, $4, $5)
                        `, [website.id, validatorId, status, latency, new Date()]);

                        await db.query(`
                            UPDATE validator SET pendingPayouts = pendingPayouts + $1 WHERE id = $2
                        `, [COST_PER_VALIDATION, validatorId]);

                        await db.query('COMMIT');
                    } catch (err) {
                        await db.query('ROLLBACK');
                        console.error("Transaction error:", err);
                    }
                }
            };
        });
    }
}, 60 * 1000);

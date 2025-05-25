use std::{env, str::FromStr};

use axum::{
    extract::Query,
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::{delete, get, post},
    Extension, Router,
};
use chrono::Utc;
use jsonwebtoken::{EncodingKey, Header,encode};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::{postgres::PgRow, PgPool, Postgres, Row, Transaction};
use uuid::Uuid;
use crate::{
    auth::auth_middleware,
    models::{Claims, User, UserIdQuery, UserRegister, Website, WebsiteQuery},
};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{SaltString, rand_core::OsRng};
use argon2::password_hash::Error;
use bs58;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer, read_keypair_file},
    system_instruction,
    transaction::Transaction as SolanaTransaction
};

#[derive(Serialize)]
struct ApiResponse<T> {
    success: bool,
    message: Option<String>,
    data: Option<T>,
}

fn json_success<T: Serialize>(data: T, message: Option<String>) -> Json<Value> {
    Json(json!({
        "success": true,
        "message": message,
        "data": data
    }))
}

fn json_error(message: &str) -> Json<Value> {
    Json(json!({
        "success": false,
        "message": message,
        "data": null
    }))
}

struct ApiJsonResponse(StatusCode, Json<Value>);

impl IntoResponse for ApiJsonResponse {
    fn into_response(self) -> axum::response::Response {
        (self.0, self.1).into_response()
    }
}

async fn hello() -> Json<Value> {
    json_success("Hello from Rust backend!", None)
}

async fn createWebsite(
    Extension(pool): Extension<PgPool>,
    Json(payload): Json<Website>,
) -> ApiJsonResponse {
    println!("Url: {}", payload.url);
    let result = sqlx::query!(
        "INSERT INTO websites (url, user_id, disabled) VALUES ($1, $2, $3)",
        payload.url,
        payload.user_id,
        payload.disabled
    )
    .execute(&pool)
    .await;

    match result {
        Ok(_) => ApiJsonResponse(
            StatusCode::CREATED,
            json_success(
                json!({"url": payload.url, "user_id": payload.user_id}),
                Some("Website created successfully!".to_string()),
            ),
        ),
        Err(e) => {
            println!("DB error: {:?}", e);
            ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Failed to create website"),
            )
        }
    }
}

#[axum::debug_handler]
async fn getWebsiteStatus(
    Extension(pool): Extension<PgPool>,
    Query(query): Query<WebsiteQuery>,
) -> ApiJsonResponse {
    let website_id = query.id;
    let user_id = query.user_id;

    // First, get the website with the disabled condition
    let website_result = sqlx::query(
        "SELECT id, url, user_id, disabled 
         FROM websites 
         WHERE id = $1 AND user_id = $2 AND disabled = false",
    )
    .bind(website_id)
    .bind(user_id)
    .fetch_optional(&pool)
    .await;

    match website_result {
        Ok(Some(website_row)) => {
            // Website found, now get its ticks
            let website_id = website_row.get::<Uuid, _>("id");

            // Get ticks for this website
            let ticks_result = sqlx::query(
                "SELECT wt.id, wt.website_id, wt.validator_id, wt.created_at, wt.status, wt.latency
                 FROM website_ticks wt
                 WHERE wt.website_id = $1",
            )
            .bind(website_id)
            .fetch_all(&pool)
            .await;

            match ticks_result {
                Ok(tick_rows) => {
                    // Convert tick rows to JSON objects
                    let ticks = tick_rows
                        .iter()
                        .map(|row| {
                            json!({
                                "id": row.get::<Uuid, _>("id"),
                                "websiteId": row.get::<Uuid, _>("website_id"),
                                "validatorId": row.get::<Uuid, _>("validator_id"),
                                "status": row.get::<String, _>("status"),
                                "latency": row.get::<f64, _>("latency")
                            })
                        })
                        .collect::<Vec<_>>();

                    // Build complete response with website and ticks
                    let website_data = json!({
                        "id": website_id,
                        "url": website_row.get::<String, _>("url"),
                        "userId": website_row.get::<Uuid, _>("user_id"),
                        "disabled": website_row.get::<bool, _>("disabled"),
                        "ticks": ticks
                    });

                    ApiJsonResponse(StatusCode::OK, json_success(website_data, None))
                }
                Err(e) => {
                    println!("Error fetching ticks: {:?}", e);
                    // Return website without ticks if there was an error fetching ticks
                    let website_data = json!({
                        "id": website_id,
                        "url": website_row.get::<String, _>("url"),
                        "userId": website_row.get::<Uuid, _>("user_id"),
                        "disabled": website_row.get::<bool, _>("disabled"),
                        "ticks": []
                    });

                    ApiJsonResponse(StatusCode::OK, json_success(website_data, None))
                }
            }
        }
        Ok(None) => ApiJsonResponse(StatusCode::NOT_FOUND, json_error("Website not found")),
        Err(e) => {
            println!("Error fetching website: {:?}", e);
            ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Failed to fetch website data"),
            )
        }
    }
}

async fn getWebsites(
    Extension(pool): Extension<PgPool>,
    Query(query): Query<UserIdQuery>,
) -> ApiJsonResponse {
    let user_id = query.user_id;
    let websites_result = sqlx::query(
        "SELECT id, url, user_id, disabled 
         FROM websites 
         WHERE user_id = $1 AND disabled = false"
    )
    .bind(user_id)
    .fetch_all(&pool)
    .await;

    match websites_result {
        Ok(website_rows) => {
            let mut websites_with_ticks = Vec::new();
            
            // For each website, fetch its ticks
            for website_row in website_rows {
                let website_id = website_row.get::<Uuid, _>("id");
                let url = website_row.get::<String, _>("url");
                let user_id = website_row.get::<Uuid, _>("user_id");
                let disabled = website_row.get::<bool, _>("disabled");
                
                // Fetch ticks for this website
                let ticks_result = sqlx::query(
                    "SELECT id, website_id, validator_id, created_at, status, latency
                     FROM website_ticks
                     WHERE website_id = $1"
                )
                .bind(website_id)
                .fetch_all(&pool)
                .await;
                
                let ticks = match ticks_result {
                    Ok(tick_rows) => {
                        tick_rows.iter().map(|row| {
                            json!({
                                "id": row.get::<Uuid, _>("id"),
                                "websiteId": row.get::<Uuid, _>("website_id"),
                                "validatorId": row.get::<Uuid, _>("validator_id"),
                                "status": row.get::<String, _>("status"),
                                "latency": row.get::<f64, _>("latency")
                            })
                        }).collect::<Vec<_>>()
                    },
                    Err(e) => {
                        println!("Error fetching ticks for website {}: {:?}", website_id, e);
                        Vec::new() // Empty ticks array if there was an error
                    }
                };
                
                // Create website JSON with ticks included
                websites_with_ticks.push(json!({
                    "id": website_id,
                    "url": url,
                    "userId": user_id,
                    "disabled": disabled,
                    "ticks": ticks
                }));
            }

            ApiJsonResponse(StatusCode::OK, json_success(
                json!({"websites": websites_with_ticks}), 
                None
            ))
        }
        Err(e) => {
            println!("Error fetching websites: {:?}", e);
            ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Failed to fetch websites"),
            )
        }
    }
}

async fn deleteWebsite(
    Extension(pool): Extension<PgPool>,
    Query(query): Query<WebsiteQuery>,
) -> ApiJsonResponse {
    let website_id = query.id;
    let user_id = query.user_id;

    let result = sqlx::query(
        "UPDATE websites SET disabled = true 
         WHERE id = $1 AND user_id = $2"
    )
    .bind(website_id)
    .bind(user_id)
    .execute(&pool)
    .await;

    match result {
        Ok(result) => {
            if result.rows_affected() > 0 {
                ApiJsonResponse(
                    StatusCode::OK,
                    json_success(
                        json!({"id": website_id}),
                        Some("Website deleted successfully".to_string()),
                    ),
                )
            } else {
                ApiJsonResponse(StatusCode::NOT_FOUND, json_error("Website not found"))
            }
        }
        Err(e) => {
            println!("Error deleting website: {:?}", e);
            ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Failed to delete website"),
            )
        }
    }
}

pub async fn signup_handler(
    Extension(pool): Extension<PgPool>,
    Json(payload): Json<UserRegister>,
) -> ApiJsonResponse {
    let UserRegister {
        username,
        password,
        email,
        id,
    } = payload;

    // Hash the password
    let hashed_password = match hash_password(&password).await {
        Ok(hash) => hash,
        Err(e) => {
            println!("Password hashing failed: {:?}", e);
            return ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Internal error during password processing"),
            );
        }
    };

    let user_id = id.unwrap_or_else(Uuid::new_v4);

    let result = sqlx::query(
        "INSERT INTO users (id, username, email, password)
         VALUES ($1, $2, $3, $4)"
    )
    .bind(user_id)
    .bind(&username)
    .bind(&email)
    .bind(&hashed_password)
    .execute(&pool)
    .await;

    match result {
        Ok(_) => ApiJsonResponse(
            StatusCode::CREATED,
            json_success(
                json!({
                    "id": user_id,
                    "username": username,
                    "email": email
                }),
                Some("User created successfully".to_string()),
            ),
        ),
        Err(e) => {
            println!("Error creating user: {:?}", e);
            ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Failed to create user"),
            )
        }
    }
}

async fn hash_password(password: &str) -> Result<String, Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)?
        .to_string();

    Ok(password_hash)  
}

#[derive(Deserialize)]
pub struct LoginInfo {
    pub email: String,
    pub password: String,
}

pub async fn login_handler(
    Extension(pool): Extension<PgPool>,
    Json(login_info): Json<LoginInfo>,
) -> ApiJsonResponse {
    let LoginInfo { email, password } = login_info;

    match is_valid_user(&email, &password, &pool).await {
        Ok(Some(user_id)) => {
            let claims = Claims {
                sub: email.clone(),
                exp: (Utc::now() + chrono::Duration::hours(8)).timestamp() as usize,
            };

            match encode(&Header::default(), &claims, &EncodingKey::from_secret("secret".as_ref())) {
                Ok(token) => ApiJsonResponse(
                    StatusCode::OK,
                    json_success(
                        json!({
                            "token": token,
                            "user_id": user_id
                        }),
                        Some("Login successful".into()),
                    ),
                ),
                Err(e) => {
                    println!("JWT creation failed: {:?}", e);
                    ApiJsonResponse(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        json_error("Failed to generate authentication token"),
                    )
                }
            }
        }
        Ok(None) => ApiJsonResponse(
            StatusCode::UNAUTHORIZED,
            json_error("Invalid email or password"),
        ),
        Err(e) => {
            println!("Login DB error: {:?}", e);
            ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Login failed due to internal error"),
            )
        }
    }
}
pub async fn is_valid_user(email: &str, password: &str, pool: &PgPool) -> Result<Option<Uuid>, sqlx::Error> {
    let row = sqlx::query("SELECT id, password FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(pool)
        .await?;

    if let Some(row) = row {
        let stored_hash: String = row.get("password");
        let user_id: Uuid = row.get("id");

        match PasswordHash::new(&stored_hash) {
            Ok(parsed_hash) => {
                let argon2 = Argon2::default();
                if argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok() {
                    return Ok(Some(user_id));
                }
            }
            Err(e) => {
                println!("Password hash parse error: {:?}", e);
            }
        }
    }

    Ok(None) // Either user not found or password mismatch
}
#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user_id: Uuid,
}

#[derive(Deserialize)]
pub struct ValidatorPayout {
    validator_id: Uuid,
}

pub async fn validator_payout_handler(
    Extension(pool): Extension<PgPool>,
    Json(payload): Json<ValidatorPayout>,
) -> Result<Json<String>, (axum::http::StatusCode, String)> {
    let mut tx: Transaction<'_, Postgres> = pool.begin().await.map_err(|e| {
        (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to start transaction: {}", e),
        )
    })?;

    // Lock the row to avoid race conditions (FOR UPDATE)
    let validator = sqlx::query!(
        r#"
        SELECT * FROM validators WHERE id = $1 FOR UPDATE
        "#,
        payload.validator_id
    )
    .fetch_one(&mut *tx)
    .await
    .map_err(|_| (axum::http::StatusCode::NOT_FOUND, "Validator not found".to_string()))?;

    if validator.pending_payouts == 0 {
        return Err((
            axum::http::StatusCode::BAD_REQUEST,
            "No pending payouts".to_string(),
        ));
    }

    // Create Solana TX
    let solana_signature =  send_solana_payout(&validator.public_key, validator.pending_payouts)
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;

    // Reset the counter
    sqlx::query!(
        r#"
        UPDATE validators SET pending_payouts = 0 WHERE id = $1
        "#,
        validator.id
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("DB Error: {}", e)))?;

    tx.commit().await.unwrap();

    Ok(Json({solana_signature}))
}

async fn send_solana_payout(pubkey: &str, lamports: i32) -> Result<String, String> {
    if lamports <= 0 {
        return Err("Amount must be positive".to_string());
    }
    
    let lamports = lamports as u64; 
    
    // Get environment variables
    let rpc_url = env::var("SOLANA_RPC_URL")
        .map_err(|_| "SOLANA_RPC_URL not set".to_string())?;
    let private_key = env::var("PRIVATE_KEY")
        .map_err(|_| "PRIVATE_KEY not set".to_string())?;
    
    // Initialize RPC client
    let client = RpcClient::new(rpc_url);
    
    // Parse private key
    let private_key_bytes = bs58::decode(private_key)
        .into_vec()
        .map_err(|e| format!("Failed to decode base58 private key: {}", e))?;
    
    let keypair = Keypair::from_bytes(&private_key_bytes)
        .map_err(|e| format!("Invalid private key bytes: {}", e))?;
    
    // Parse destination pubkey
    let destination_pubkey = Pubkey::from_str(pubkey)
        .map_err(|e| format!("Invalid destination pubkey: {}", e))?;
    
    // Check balance
    let balance = client
        .get_balance(&keypair.pubkey())
        .map_err(|e| format!("Failed to fetch balance: {}", e))?;
    
    if balance < lamports {
        let sol_needed = lamports as f64 / 1_000_000_000.0;
        let sol_available = balance as f64 / 1_000_000_000.0;
        let msg = format!(
            "Insufficient balance. Needed: {:.9} SOL, Available: {:.9} SOL",
            sol_needed, sol_available
        );
        return Err(msg);
    }
    
    // Create transfer instruction
    let instruction = system_instruction::transfer(
        &keypair.pubkey(),
        &destination_pubkey,
        lamports, // Use original lamports amount, not converted SOL
    );
    
    // Get recent blockhash
    let recent_blockhash = client
        .get_latest_blockhash()
        .map_err(|e| format!("Failed to get blockhash: {}", e))?;
    
    // Create and sign transaction
    let transaction = SolanaTransaction::new_signed_with_payer(
        &[instruction],
        Some(&keypair.pubkey()),
        &[&keypair],
        recent_blockhash,
    );
    
    // Send transaction
    let signature = client
        .send_and_confirm_transaction(&transaction)
        .map_err(|e| format!("Failed to send transaction: {}", e))?;
    
    let sol_amount = lamports as f64 / 1_000_000_000.0;
    println!("✅ Transaction sent! Signature: {}", signature);
    println!("💰 Sent {:.9} SOL ({} lamports) to {}", sol_amount, lamports, pubkey);
    
    Ok(signature.to_string())
}

pub fn routes() -> Router {
    Router::new()
        .nest(
            "/api",
            Router::new()
                .route("/hello", get(hello))
                .route("/create-website", post(createWebsite))
                .route("/get-website-status", get(getWebsiteStatus))
                .route("/websites", get(getWebsites))
                .route("/delete-website", delete(deleteWebsite))
                .route("/sign-up", post(signup_handler))
                .route("/login", post(login_handler))
                .route("/validator_payout", post(validator_payout_handler))
                // .layer(middleware::from_fn(auth_middleware))
        )
}
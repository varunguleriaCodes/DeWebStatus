export interface SignupOutgoingMessage {
    validatorId: string;
    callbackId: string;
}

export interface ValidateOutgoingMessage {
    url: string,
    callbackId: string,
    websiteId: string;
}


export type OutgoingMessage = {
    type: 'signup'
    data: SignupOutgoingMessage
} | {
    type: 'validate'
    data: ValidateOutgoingMessage
}
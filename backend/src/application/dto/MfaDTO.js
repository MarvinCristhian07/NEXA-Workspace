/**
 * DTOs para operações de MFA
 */

export class MfaSetupDTO {
    constructor({ userId }) {
        this.userId = userId;
    }

    static fromRequest(req) {
        return new MfaSetupDTO({ userId: req.user.id });
    }
}

export class MfaVerifySetupDTO {
    constructor({ userId, token }) {
        this.userId = userId;
        this.token = token;
    }

    static fromRequest(req) {
        return new MfaVerifySetupDTO({
            userId: req.user.id,
            token: req.validatedBody.token
        });
    }
}

export class MfaValidateDTO {
    constructor({ mfaToken, token }) {
        this.mfaToken = mfaToken;
        this.token = token;
    }

    static fromRequest(body) {
        return new MfaVerifySetupDTO({
            mfaToken: body.mfaToken,
            token: body.token
        });
    }
}
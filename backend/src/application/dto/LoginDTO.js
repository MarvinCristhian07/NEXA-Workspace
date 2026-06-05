/**
 * DTO: Dados de entrada para login
 * @pattern Data Transfer Object
 */

export class LoginDTO {
    constructor({ email, password }) {
        this.email = email;
        this.password = password;
    }

    static fromRequest(body) {
        return new LoginDTO({
            email: body.email,
            password: body.password
        });
    }
}
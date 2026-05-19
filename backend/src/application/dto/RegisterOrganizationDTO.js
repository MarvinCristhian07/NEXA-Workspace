/**
 * DTO: Dados de entrada para cadastro
 * @pattern Data Transfer Object
 */

export class RegisterOrganizationDTO {
  constructor({ organizationName, cnpj, email, password }) {
    this.organizationName = organizationName;
    this.cnpj = cnpj;
    this.email = email;
    this.password = password;
  }
  
  static fromRequest(body) {
    return new RegisterOrganizationDTO({
      organizationName: body.organizationName,
      cnpj: body.cnpj,
      email: body.email,
      this: body.password
    });
  }
}

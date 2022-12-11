export default class Settings {
  id: number;
  name: string;
  address: string;
  fax: string;
  email: string;
  telephone: string;
  lang: string;

  constructor(
    id: number,
    name: string,
    address: string,
    fax: string,
    email: string,
    telephone: string,
    lang: string
  ) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.fax = fax;
    this.email = email;
    this.telephone = telephone;
    this.lang = lang;
  }
}

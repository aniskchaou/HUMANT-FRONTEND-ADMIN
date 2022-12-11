export default class Member {
  id: number;
  name: string;
  user_type: string;
  type_id: string;
  email: string;
  mobile: string;
  password: string;
  address: string;
  status: string;
  /**
   *
   */

  constructor(
    id: number,
    name: string,
    user_type: string,
    type_id: string,
    email: string,
    mobile: string,
    password: string,
    address: string,
    status: string
  ) {
    this.id = id;
    this.name = name;
    this.user_type = user_type;
    this.type_id = type_id;
    this.email = email;
    this.mobile = mobile;
    this.password = password;
    this.address = address;
    this.status = status;
  }
}

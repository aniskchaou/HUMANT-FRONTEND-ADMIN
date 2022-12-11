export default class TypeMember {
  id: number;
  member_type_name: string;

  constructor(id: number, member_type_name: string) {
    this.id = id;
    this.member_type_name = member_type_name;
  }
}

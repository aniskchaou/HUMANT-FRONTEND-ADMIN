export default class Departemnt {
  id: number;
  name: string;
  manager: string;

  constructor(id: number, name: string, manager: string) {
    this.id = id;
    this.name = name;
    this.manager = manager;
  }
}

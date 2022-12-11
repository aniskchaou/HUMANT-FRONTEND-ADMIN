export default class Writer {
  id: number;
  name: string;
  note: string;

  constructor(id: number, name: string, note: string) {
    this.id = id;
    this.name = name;
    this.note = note;
  }
}

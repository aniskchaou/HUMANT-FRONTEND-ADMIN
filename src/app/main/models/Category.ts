export default class Category {
  id: number;
  category_name: string;

  constructor(id: number, category_name: string) {
    this.id = id;
    this.category_name = category_name;
  }
}

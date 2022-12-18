export default class Archive {
  id: number;
  name: string;
  writer: string;
  publication: string;
  category: string;
  code: string;
  ISBN: string;
  edition: string;
  editionYear: string;
  quantity: string;
  issuedQuantity: string;
  RackNo: string;

  constructor(
    id: number,
    name: string,
    writer: string,
    publication: string,
    category: string,
    code: string,
    ISBN: string,
    edition: string,
    editionYear: string,
    quantity: string,
    issuedQuantity: string,
    RackNo: string
  ) {
    this.id = id;
    this.name = name;
    this.writer = writer;
    this.publication = publication;
    this.category = category;
    this.code = code;
    this.ISBN = ISBN;
    this.edition = edition;
    this.editionYear = editionYear;
    this.quantity = quantity;
    this.issuedQuantity = issuedQuantity;
    this.RackNo = RackNo;
  }
}

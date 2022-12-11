export default interface Service {
  getAll(url);
  get(id): Object;
  create(url, data);
  update(old, data);
  remove(id);
}

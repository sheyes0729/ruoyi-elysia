export interface Repository<T, ID = number> {
  findAll(): T[];
  findById(id: ID): T | null;
  create(data: Partial<T>): ID;
  update(id: ID, data: Partial<T>): boolean;
  delete(id: ID): boolean;
  deleteBatch(ids: ID[]): number;
}

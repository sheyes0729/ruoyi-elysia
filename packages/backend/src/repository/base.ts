export interface Repository<T, ID = number> {
  findAll(): Promise<T[]>;
  findById(id: ID): Promise<T | null>;
  create(data: Partial<T>): Promise<ID>;
  update(id: ID, data: Partial<T>): Promise<boolean>;
  delete(id: ID): Promise<boolean>;
  deleteBatch(ids: ID[]): Promise<number>;
}

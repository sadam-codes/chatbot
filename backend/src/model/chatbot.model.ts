import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'documents', timestamps: true })
export class Document extends Model<Document> {
  @Column({ autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column
  declare content: string;

  @Column({
    type: 'vector(768)' as any,
  })
  declare embedding: number[];
}

@Table({ tableName: 'messages', timestamps: true })
export class Messages extends Model<Messages> {
  @Column({ autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column
  declare question: string;

  @Column
  declare answer: string;
}

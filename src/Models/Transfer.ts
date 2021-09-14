import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BaseModel } from "./BaseModel";
import { ITransfer } from "./Interfaces/ITransfer";

@Entity()
export class Transfer extends BaseModel implements ITransfer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  from!: string;

  @Column()
  to!: string;

  @Column("double")
  amount!: number;

  @CreateDateColumn({
    type: "text",
    default: () => "datetime('now')",
  })
  createdAt!: string;

  @UpdateDateColumn({
    type: "text",
    default: () => "datetime('now')",
    onUpdate: "datetime('now')",
  })
  updatedAt!: string;
}

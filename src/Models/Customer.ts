import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BankAccount } from "./BankAccount";
import { BaseModel } from "./BaseModel";
import { ICustomer } from "./Interfaces";

@Entity()
export class Customer extends BaseModel implements ICustomer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

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

  @OneToMany(() => BankAccount, (account) => account.customer)
  bankAccounts!: BankAccount[];
}

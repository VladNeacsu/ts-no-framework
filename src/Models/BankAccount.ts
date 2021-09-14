import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BaseModel } from "./BaseModel";
import { Customer } from "./Customer";
import { IBankAccount } from "./Interfaces";
import { Transfer } from "./Transfer";

@Entity()
export class BankAccount extends BaseModel implements IBankAccount {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  iban!: string;

  @Column("double")
  balance!: number;

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

  @ManyToOne(() => Customer, (customer) => customer.bankAccounts)
  customer!: Customer;

  @ManyToMany(() => Transfer)
  @JoinTable()
  history!: Transfer[];
}

import { IBankAccount } from "./IBankAccount";

export interface ICustomer {
  id: number;
  name: string;
  bankAccounts: IBankAccount[];
}

import { ICustomer } from "./ICustomer";

export interface IBankAccount {
  id: number;
  balance: number;
  customer: ICustomer;
}

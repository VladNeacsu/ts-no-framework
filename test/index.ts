import customersFixtures from "./__fixtures__/customers";
import bankAccountsFixtures from "./__fixtures__/bankAccounts";
import transfersFixtures from "./__fixtures__/transfers";
import { BankAccount, Customer, Transfer } from "../src/Models";
import { getManager } from "typeorm";

interface FixtureOptions {
  bankAccounts?: boolean;
  transfers?: boolean;
}

// TODO: load fixtures dynamically
const loadFixtures = async ({
  bankAccounts,
  transfers,
}: FixtureOptions = {}): Promise<void> => {
  await getManager()
    .createQueryBuilder()
    .insert()
    .into(Customer)
    .values(customersFixtures)
    .execute();

  if (bankAccounts) {
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(BankAccount)
      .values(bankAccountsFixtures)
      .execute();
  }

  if (transfers) {
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(Transfer)
      .values(transfersFixtures)
      .execute();
  }
};

export { loadFixtures };

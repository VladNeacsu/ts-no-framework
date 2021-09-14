import {
  createConnection,
  getConnection,
  getManager,
  Repository,
} from "typeorm";
import { BankAccount, Customer, Transfer } from "../Models";
import {
  bankAccountsFixtures,
  customersFixtures,
} from "../../test/__fixtures__";
import { createBankAccount, getBankAccountByIban } from "./BankAccount";
import { loadFixtures } from "../../test";
import { config } from "node-config-ts";
import { IBAN } from "ibankit";

describe("BankAccountActions > createBankAccount", () => {
  let bankAccountRepo: Repository<BankAccount>;
  let customerRepo: Repository<Customer>;

  beforeAll(async () => {
    await createConnection({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [Customer, BankAccount, Transfer],
      synchronize: true,
      logging: false,
    });

    await loadFixtures();

    bankAccountRepo = getManager().getRepository(BankAccount);
    customerRepo = getManager().getRepository(Customer);
  });

  afterAll(() => {
    return getConnection().close();
  });

  it("Successfully creates a new bank account", async () => {
    const customerId = customersFixtures[0].id; // 1
    const initialDeposit = 123;

    let bankAccounts = await bankAccountRepo.find();

    expect(bankAccounts.length).toBe(0);

    const jsonResult = await createBankAccount({
      bankAccountRepo,
      customerRepo,
      customerId,
      initialDeposit,
    });

    expect(jsonResult.err).toBe(undefined);
    expect(jsonResult.data).toEqual(
      JSON.stringify({
        message: "Successfully created a new bank account for customer.",
      })
    );

    bankAccounts = await bankAccountRepo.find({
      relations: ["customer", "history"],
    });
    expect(bankAccounts.length).toBe(1);

    const newBankAccount = bankAccounts.pop();

    expect(newBankAccount).toMatchObject({
      id: 1,
      balance: initialDeposit,
      history: [],
    });

    expect(newBankAccount?.customer).toMatchObject(customersFixtures[0]);

    expect(IBAN.isValid(newBankAccount?.iban ?? "")).toBe(true);
  });

  it("Should return an error if customer doesn't exist", async () => {
    const jsonResult = await createBankAccount({
      bankAccountRepo,
      customerRepo,
      customerId: 101,
      initialDeposit: 100,
    });

    expect(jsonResult).toMatchObject({
      err: {
        code: 404,
        message: "No customer with id: ${customerId} found.",
      },
    });
  });

  it("Should return an error if initial deposit is below set limit", async () => {
    const jsonResult = await createBankAccount({
      bankAccountRepo,
      customerRepo,
      customerId: customersFixtures[0].id,
      initialDeposit: config.application.minimumAllowedDeposit - 1,
    });

    expect(jsonResult).toMatchObject({
      err: {
        code: 422,
        message: `Minimum initial deposit is ${config.application.minimumAllowedDeposit}.`,
      },
    });
  });
});

describe("BankAccountActions > getBankAccountByIban", () => {
  let bankAccountRepo: Repository<BankAccount>;

  beforeAll(async () => {
    await createConnection({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [Customer, BankAccount, Transfer],
      synchronize: true,
      logging: false,
    });

    await loadFixtures({
      bankAccounts: true,
    });

    bankAccountRepo = getManager().getRepository(BankAccount);
  });

  afterAll(() => {
    return getConnection().close();
  });

  it("Should return a BankAccount Entity", async () => {
    const bankAccountFromDB = await bankAccountRepo.findOne({
      id: bankAccountsFixtures[0].id,
    });

    const jsonResult = await getBankAccountByIban({
      accountIban: bankAccountsFixtures[0].iban,
      bankAccountRepo,
    });
    expect(jsonResult.err).toBe(undefined);

    const data = JSON.parse(jsonResult?.data ?? "");
    expect(data).toMatchObject(JSON.parse(JSON.stringify(bankAccountFromDB)));
    expect(data.history).toBe(undefined);

    const jsonResultWithHistory = await getBankAccountByIban({
      accountIban: bankAccountsFixtures[0].iban,
      bankAccountRepo,
      withHistory: true,
    });

    const dataWithHistory = JSON.parse(jsonResultWithHistory?.data ?? "");
    expect(jsonResult.err).toBe(undefined);
    expect(dataWithHistory.history).toBeInstanceOf(Array);
    expect(dataWithHistory.history.length).toBe(0);
  });

  it("Should return an error if account IBAN is invalid", async () => {
    const invalidIban = "ERROR";
    const jsonResult = await getBankAccountByIban({
      accountIban: invalidIban,
      bankAccountRepo,
    });

    expect(jsonResult?.data).toBe(undefined);

    expect(jsonResult.err).toMatchObject({
      code: 422,
      message: `Parameter ${invalidIban} is not a valid IBAN`,
    });
  });

  it("Should return an error if account is not found", async () => {
    const accountIban = "RO69SXGVESPDVM8916AV7C1Z";
    const jsonResult = await getBankAccountByIban({
      accountIban,
      bankAccountRepo,
    });

    expect(jsonResult?.data).toBe(undefined);

    expect(jsonResult.err).toMatchObject({
      code: 404,
      message: `No Bank Account with the IBAN: ${accountIban} found.`,
    });
  });
});

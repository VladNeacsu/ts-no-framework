import { StatusCodes } from "http-status-codes";
import { IBAN } from "ibankit";
import { config } from "node-config-ts";
import { Repository } from "typeorm";
import { ApiError } from "../../lib/apiError";
import { JsonResponse } from "../../lib/helpers/JsonResponse";
import { BankAccount, Customer } from "../Models";

interface NewBankAccountServiceParameters {
  customerId: number;
  initialDeposit: number;
  bankAccountRepo: Repository<BankAccount>;
  customerRepo: Repository<Customer>;
}

interface GetBankAccountByIbanParameters {
  accountIban: string;
  bankAccountRepo: Repository<BankAccount>;
  withHistory?: boolean;
}

// TODO: Undecided if this would be better encapsulated in a BankAccountService class
const createBankAccount = async ({
  customerId,
  initialDeposit,
  bankAccountRepo,
  customerRepo,
}: NewBankAccountServiceParameters): Promise<JsonResponse> => {
  if (initialDeposit < config.application.minimumAllowedDeposit) {
    return new JsonResponse(
      new ApiError(
        "Minimum initial deposit is 5.",
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  const customer = await customerRepo.findOne(customerId);

  if (!customer) {
    return new JsonResponse(
      new ApiError(
        "No customer with id: ${customerId} found.",
        StatusCodes.NOT_FOUND
      )
    );
  }

  await bankAccountRepo.save({
    iban: IBAN.random().toString(),
    customer: customer,
    balance: initialDeposit,
  });

  return new JsonResponse(
    undefined,
    JSON.stringify({
      message: "Successfully created a new bank account for customer.",
    })
  );
};

const getBankAccountByIban = async ({
  accountIban,
  bankAccountRepo,
  withHistory,
}: GetBankAccountByIbanParameters): Promise<JsonResponse> => {
  if (!IBAN.isValid(accountIban)) {
    return new JsonResponse(
      new ApiError(
        `Parameter ${accountIban} is not a valid IBAN`,
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  // TODO: History should reflect if the balance change is negative or positive
  const bankAccount = await bankAccountRepo.findOne(
    { iban: accountIban },
    {
      relations: withHistory ? ["history"] : [],
    }
  );

  if (bankAccount) {
    return new JsonResponse(undefined, bankAccount.stringify());
  }

  return new JsonResponse(
    new ApiError(
      `No Bank Account with the IBAN: ${accountIban} found.`,
      StatusCodes.NOT_FOUND
    )
  );
};

export { createBankAccount, getBankAccountByIban };

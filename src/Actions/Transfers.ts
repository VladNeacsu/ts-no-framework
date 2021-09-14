import { StatusCodes } from "http-status-codes";
import { getManager } from "typeorm";
import { ApiError } from "../../lib/apiError";
import { JsonResponse } from "../../lib/helpers/JsonResponse";
import { Transfer } from "../Models";
import { BankAccount } from "../Models/BankAccount";

// TODO: Undecided if this would be better encapsulated in a TransferService class
const transferFunds = async (
  from: string,
  to: string,
  amount: number
): Promise<JsonResponse> => {
  const transferRepo = getManager().getRepository(Transfer);
  const bankAccountRepo = getManager().getRepository(BankAccount);

  const fromAccount = await bankAccountRepo.findOne(
    { iban: from },
    { relations: ["history"] }
  );

  const toAccount = await bankAccountRepo.findOne(
    { iban: to },
    { relations: ["history"] }
  );

  if (!fromAccount || !toAccount) {
    return new JsonResponse(
      new ApiError(
        `${!fromAccount ? "From" : "To"} account number not found`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  if (fromAccount.balance < amount) {
    return new JsonResponse(
      new ApiError(
        "Not enough balance in the account",
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  const transfer = await transferRepo.save({
    from,
    to,
    amount,
  });

  fromAccount.balance -= amount;
  fromAccount.history.push(transfer);

  toAccount.balance += amount;
  toAccount.history.push(transfer);

  await bankAccountRepo.save([fromAccount, toAccount]);

  return new JsonResponse(
    undefined,
    JSON.stringify({ message: "Transfer complete." })
  );
};

export { transferFunds };

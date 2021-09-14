import { StatusCodes } from "http-status-codes";
import { getManager } from "typeorm";
import { ApiError } from "../../lib/apiError";
import { Controller } from "../../lib/decorators/Controller";
import { Get, Post } from "../../lib/decorators/HttpMethodDecorators";
import { JsonResponse } from "../../lib/helpers/JsonResponse";
import ServerRequest from "../../lib/helpers/ServerRequest";
import { BankAccount, Customer } from "../Models";
import {
  createBankAccount,
  getBankAccountByIban,
} from "../Actions/BankAccount";

@Controller("/bankAccount")
export class BankAccountController {
  /**
   * @api {get} /bankAccount/:iban Request User information
   * @apiName Get Bank Account By IBAN
   * @apiGroup Bank Account
   *
   * @apiParam {String} IBAN associated with the bank account.
   *
   * @apiSuccess {Number} ID from database.
   * @apiSuccess {String} IBAN for the account.
   * @apiSuccess {Number} Account balance.
   * @apiSuccess {Date} createdAt
   * @apiSuccess {Date} updatedAt
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       {
   *           "id": 1,
   *           "iban": "NI17LJZZ386399823864981640650339",
   *           "balance": 20,
   *           "createdAt": "2021-06-08 11:20:00",
   *           "updatedAt": "2021-06-08 11:20:00"
   *        }
   *     }
   *
   * @apiError MissingParameter No IBAN was received by the server.
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "message": "Missing required parameter "iban""
   *     }
   *
   * @apiError InvalidParameter Supplied IBAN is invalid
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "message": "Parameter <accountIban> is not a valid IBAN"
   *     }
   *
   * @apiError BankAccountNotFound There is no bank account associated with the IBAN
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 404 Unprocessable Entity
   *     {
   *       "message": "No Bank Account with the IBAN: <accountIban> found."
   *     }
   *
   */
  @Get("/:iban")
  public async getByIban(req: ServerRequest): Promise<JsonResponse> {
    const accountIban = req.params[0];

    if (accountIban) {
      const bankAccountRepo = getManager().getRepository(BankAccount);
      return getBankAccountByIban({ accountIban, bankAccountRepo });
    }

    return new JsonResponse(
      new ApiError(
        `Missing required parameter "iban"`,
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  @Get("/:iban/history")
  public async getByIbanWithHistory(req: ServerRequest): Promise<JsonResponse> {
    const accountIban = req.params[0];

    if (accountIban) {
      const bankAccountRepo = getManager().getRepository(BankAccount);
      return getBankAccountByIban({
        accountIban,
        bankAccountRepo,
        withHistory: true,
      });
    }

    return new JsonResponse(
      new ApiError(
        "Missing required parameter for api /bankAccount/:iban",
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  @Post("")
  public async create(req: ServerRequest): Promise<JsonResponse> {
    const bankAccountRepo = getManager().getRepository(BankAccount);
    const customerRepo = getManager().getRepository(Customer);

    if (req.body) {
      const { customerId, initialDeposit } = JSON.parse(req.body);

      return createBankAccount({
        customerId,
        initialDeposit,
        bankAccountRepo,
        customerRepo,
      });
    } else {
      return new JsonResponse(
        new ApiError(
          "Request body requires both customerId and initialDeposit.",
          StatusCodes.UNPROCESSABLE_ENTITY
        )
      );
    }
  }
}

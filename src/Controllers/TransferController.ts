import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../lib/apiError";
import { Controller } from "../../lib/decorators/Controller";
import { Post } from "../../lib/decorators/HttpMethodDecorators";
import { JsonResponse } from "../../lib/helpers/JsonResponse";
import ServerRequest from "../../lib/helpers/ServerRequest";
import { transferFunds } from "../Actions/Transfers";

interface ITransferData {
  from: string;
  to: string;
  amount: number;
}

@Controller("/transfer")
export class TransferController {
  @Post("")
  public async create(req: ServerRequest): Promise<JsonResponse> {
    if (req.body) {
      const { from, to, amount } = JSON.parse(req.body) as ITransferData;
      return transferFunds(from, to, amount);
    }

    return new JsonResponse(
      new ApiError(
        "Request body must contain { from, to, amount } parameters",
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }
}

import { StatusCodes } from "http-status-codes";
import { getManager } from "typeorm";
import { ApiError } from "../../lib/apiError";
import { Controller } from "../../lib/decorators/Controller";
import { Get } from "../../lib/decorators/HttpMethodDecorators";
import { JsonResponse } from "../../lib/helpers/JsonResponse";
import ServerRequest from "../../lib/helpers/ServerRequest";
import { Customer } from "../Models";
import { getCustomerById, listAllCustomers } from "../Actions/Customer";

@Controller("/customer")
export class CustomerController {
  @Get("")
  public async listAll(): Promise<JsonResponse> {
    const customerRepo = getManager().getRepository(Customer);

    return listAllCustomers(customerRepo);
  }

  @Get("/:id")
  public async getById(req: ServerRequest): Promise<JsonResponse> {
    const customerId = req.params[0];

    if (customerId) {
      const customerRepo = getManager().getRepository(Customer);

      return getCustomerById({ customerId, customerRepo });
    }

    return new JsonResponse(
      new ApiError(
        "Missing required parameter for api /customer/:id",
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }
}

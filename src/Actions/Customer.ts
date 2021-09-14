import { StatusCodes } from "http-status-codes";
import { Repository } from "typeorm";
import { ApiError } from "../../lib/apiError";
import { JsonResponse } from "../../lib/helpers/JsonResponse";
import { Customer } from "../Models";

interface GetCustomerByIdParameters {
  customerId: string;
  customerRepo: Repository<Customer>;
}

// TODO: Undecided if this would be better encapsulated in a CustomerService class
const listAllCustomers = async (
  customerRepo: Repository<Customer>
): Promise<JsonResponse> => {
  const allCustomers = await customerRepo.find({
    relations: ["bankAccounts"],
  });

  if (allCustomers.length) {
    return new JsonResponse(undefined, JSON.stringify(allCustomers));
  }

  return new JsonResponse(
    new ApiError(
      "No Customer records fround in the database",
      StatusCodes.NOT_FOUND
    )
  );
};

const getCustomerById = async ({
  customerId,
  customerRepo,
}: GetCustomerByIdParameters): Promise<JsonResponse> => {
  const customer = await customerRepo.findOne(customerId, {
    relations: ["bankAccounts", "bankAccounts.history"],
  });

  if (customer) {
    return new JsonResponse(undefined, customer.stringify());
  }

  return new JsonResponse(
    new ApiError(
      `Customer with id: ${customerId} doesn't exist.`,
      StatusCodes.NOT_FOUND
    )
  );
};

export { listAllCustomers, getCustomerById };

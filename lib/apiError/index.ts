import { StatusCodes } from "http-status-codes";

export class ApiError extends Error {
  code: StatusCodes;
  constructor(message: string, code: StatusCodes) {
    super(message);
    this.code = code;
  }

  getErrorMessage(): string {
    return this.message;
  }
}

import { ApiError } from "../apiError";

export class JsonResponse {
  err?: Error | undefined;
  data?: string;
  constructor(err?: ApiError, data?: string) {
    if (err) {
      this.err = err;
    }
    if (data) {
      this.data = data;
    }
  }

  getResponseObject(): Record<string, unknown> {
    return {
      err: this.err,
      data: this.data,
    };
  }
}

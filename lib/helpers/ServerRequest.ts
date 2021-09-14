import { IncomingMessage } from "http";

export default class ServerRequest {
  params: Record<string, string> = {};
  body?: string;
  message: IncomingMessage;
  constructor(message: IncomingMessage) {
    this.message = message;
  }
}

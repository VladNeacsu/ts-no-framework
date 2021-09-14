import { ServerResponse } from "http";
import { pathToRegexp } from "path-to-regexp";
import { Logger } from "tslog";
import ServerRequest from "../../lib/helpers/ServerRequest";
import { IRouteDefinition } from "../../lib/interfaces/IRouteDefinition";

import {
  TransferController,
  CustomerController,
  BankAccountController,
} from "../Controllers";

const routeRegistry: Map<
  RegExp,
  [string, (req: ServerRequest, res: ServerResponse) => void]
> = new Map();

const registerRoutes = (log: Logger): typeof routeRegistry => {
  log.info("🤔 Registering server routes");
  [TransferController, CustomerController, BankAccountController].forEach(
    (ctrl) => {
      const instance = new ctrl();
      // The prefix saved to our controller
      const prefix = Reflect.getMetadata("prefix", ctrl);
      // Our `routes` array containing all our routes for this controller
      const routes: Array<IRouteDefinition> = Reflect.getMetadata(
        "routes",
        ctrl
      );

      // Iterate over all routes and register them
      routes.forEach((route) => {
        const pathRegex = pathToRegexp(`${prefix}${route.path}`);
        routeRegistry.set(pathRegex, [
          route.requestMethod,
          // TODO: This should not remain like this, route.methodName should be a recognizable key
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          instance[route.methodName],
        ]);
      });
    }
  );

  log.info("✔️  Done registering server routes");

  return routeRegistry;
};
export default registerRoutes;

import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { match } from "path-to-regexp";
import { Logger } from "tslog";
import ServerRequest from "../../lib/helpers/ServerRequest";
import registerRoutes from "./registerRoutes";

export default (log: Logger): Server => {
  const routeRegistry = registerRoutes(log);

  return createServer((req: IncomingMessage, res: ServerResponse): void => {
    try {
      res.setHeader("Content-Type", "application/json");

      req.on("error", (err) => {
        log.error(err);
        res.statusCode = StatusCodes.BAD_REQUEST;
        res.end();
      });

      const body: Uint8Array[] = [];

      req
        .on("data", (chunk) => {
          body.push(chunk);
        })
        .on("end", async () => {
          res.on("error", (err) => {
            log.error(err);
          });

          const data = Buffer.concat(body).toString();

          const extendedReq = new ServerRequest(req);

          if (data) {
            extendedReq.body = data;
          }

          if (req.url) {
            // Iterate through the registry and match the route Regex
            for (const [routeRegex, routeMetadata] of routeRegistry) {
              const matchFn = match(routeRegex);

              const matchedRoute = matchFn(req.url);

              if (matchedRoute) {
                const [routeHttpMethod, controllerMethod] = routeMetadata;

                if (routeHttpMethod === req.method) {
                  if (matchedRoute.params) {
                    extendedReq.params = { ...matchedRoute.params };
                  }

                  // TODO: This should not remain like this.
                  // controllerMethod should return Promise<JsonResponse>
                  const JsonResponse = await controllerMethod(extendedReq, res);
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  const responseObject = JsonResponse.getResponseObject();

                  if (responseObject.err) {
                    // TODO: Api needs better error handling
                    res.statusCode = responseObject.err.code;
                    return res.end(
                      JSON.stringify({ message: responseObject.err.message })
                    );
                  } else {
                    return res.end(responseObject.data);
                  }
                }
              }
            }

            // If we don't match any registered routes we return 404
            res.statusCode = StatusCodes.NOT_FOUND;
            return res.end(ReasonPhrases.NOT_FOUND);
          }
        });
    } catch (ex) {
      log.error(ex);
      res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      res.end(JSON.stringify(ex));
    }
  });
};

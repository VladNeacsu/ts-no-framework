import { config } from "node-config-ts";
import initServer from "./Services/initServer";
import { Logger } from "tslog";
import { createConnection } from "typeorm";
import { loadFixtures } from "../test";

const log: Logger = new Logger();

const server = initServer(log);

// Initialize TypeORM

createConnection()
  .then(async () => {
    await loadFixtures();

    server.listen(config.serverPort, (): void => {
      log.info(`🚀 Server started on port ${config.serverPort}`);
    });
  })
  .catch((error) => log.error("TypeORM connection error: ", error));

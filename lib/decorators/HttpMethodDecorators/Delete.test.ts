import "reflect-metadata";
import { IRouteDefinition } from "../../interfaces/IRouteDefinition";
import { Delete } from "./Delete";

describe("Delete decorator test", () => {
  it("should properly attach routes", () => {
    class MyController {
      @Delete("/:id")
      public index() {
        return undefined;
      }
    }

    expect(Reflect.getMetadata("prefix", MyController)).toBe(undefined);

    const routes: Array<IRouteDefinition> = Reflect.getMetadata(
      "routes",
      MyController
    );

    expect(routes).toBeInstanceOf(Array);
    expect(routes.length).toBe(1);
    expect(routes[0].methodName).toBe("index");
    expect(routes[0].path).toBe("/:id");
    expect(routes[0].requestMethod).toBe("DELETE");
  });
});

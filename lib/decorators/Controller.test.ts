import "reflect-metadata";
import { Controller } from "./Controller";

describe("Controller Decorator", () => {
  it("Controller without decorators should not have metadata", () => {
    class MyController {}

    expect(Reflect.getMetadata("prefix", MyController)).toBe(undefined);
    expect(Reflect.getMetadata("routes", MyController)).toBe(undefined);
  });

  it("Controller with decorators should have metadata", () => {
    @Controller("controllerDecorator")
    class MyController {}

    expect(Reflect.getMetadata("prefix", MyController)).toBe(
      "controllerDecorator"
    );

    expect(Reflect.getMetadata("routes", MyController)).toBeInstanceOf(Array);
    expect(Reflect.getMetadata("routes", MyController).length).toBe(0);
  });
});

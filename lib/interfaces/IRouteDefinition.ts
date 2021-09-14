export interface IRouteDefinition {
  // Path to our route
  path: string;
  // HTTP Request CRUD methods
  requestMethod: "GET" | "POST" | "DELETE" | "PUT";
  // Method name within our controller responsible for this route
  methodName: string;
}

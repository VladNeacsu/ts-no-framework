export class BaseModel {
  stringify(): string {
    return JSON.stringify(this);
  }
}

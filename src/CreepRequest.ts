export enum RequestPriority
{
  Emergency,
  Routine,
  Discretionary,
  Deferral,
}

export class CreepRequest
{
  readonly RequiredBodyParts:string[];
  readonly OptionalBodyParts:string[];
  readonly Priority:RequestPriority;
  readonly Role:string;

  constructor (requiredBodyParts:string[],
               optionalBodyParts:string[],
               priority:RequestPriority,
               role:string)
  {
    this.RequiredBodyParts = requiredBodyParts;
    this.RequiredBodyParts = optionalBodyParts;
    this.Priority = priority;
    this.Role = role;
  }
}

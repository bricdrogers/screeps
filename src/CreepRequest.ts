import { EntityType } from "Prototypes/EntityTypes"

export enum RequestPriority
{
  Emergency = 3,
  Routine = 2,
  Discretionary = 1,
  Deferral = 0,
}

export enum RequestStatus
{
  Unacknowledged,
  Queued,
  Processing,
  Complete,
  Failed,
}

export class CreepRequest
{
  readonly RequiredBodyParts:string[];
  readonly OptionalBodyParts:string[];
  readonly Priority:RequestPriority;
  readonly Role:string;
  readonly Id:string;
  readonly creepName:string;
  Owner:[EntityType, string];


  // If the creepId is populated, the request has
  // been fulfilled.
  Status:RequestStatus;

  actualBodyParts:string[];

  constructor (requiredBodyParts:string[],
               optionalBodyParts:string[],
               priority:RequestPriority,
               role:string,
               owner:[EntityType, string])
  {
    this.RequiredBodyParts = requiredBodyParts;
    this.OptionalBodyParts = optionalBodyParts;
    this.Priority = priority;
    this.Role = role;
    this.Status = RequestStatus.Unacknowledged;
    this.Owner = owner;
    this.Id = Game.time + (Math.floor(Math.random() * 65534) + 1).toString();
    this.creepName = role + Game.time;
  }
}

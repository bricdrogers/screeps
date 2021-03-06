import { EntityType } from "Prototypes/EntityTypes"

export enum RequestPriority {
  Emergency = 3,
  Routine = 2,
  Discretionary = 1,
  Deferral = 0,
}

export enum RequestStatus {
  Unacknowledged,
  Queued,
  Processing,
  Complete,
  Failed,
}

export class CreepRequest {
  readonly RequiredBodyParts: BodyPartConstant[];
  readonly OptionalBodyParts: BodyPartConstant[];
  readonly Priority: RequestPriority;
  readonly Role: string;
  readonly Id: string;
  creepName: string;
  Owners: [EntityType, string][];

  // All new requests are valid. A entity may invalidate a existing
  // request depending on the circumstances. An invalid request will
  // not get processed.
  isValid: boolean;

  // If the creepId is populated, the request has
  // been fulfilled.
  Status: RequestStatus;
  actualBodyParts: BodyPartConstant[];
  completeTime: number;

  constructor(requiredBodyParts: BodyPartConstant[],
    optionalBodyParts: BodyPartConstant[],
    priority: RequestPriority,
    role: string,
    owner: [EntityType, string]) {
    this.RequiredBodyParts = requiredBodyParts;
    this.OptionalBodyParts = optionalBodyParts;
    this.Priority = priority;
    this.Role = role;
    this.Status = RequestStatus.Unacknowledged;
    this.Owners = [owner];
    this.isValid = true;
    this.Id = Game.time + (Math.floor(Math.random() * 65534) + 1).toString();
    this.creepName = role + "-" + Game.time + (Math.floor(Math.random() * 65534) + 1).toString();
  }
}

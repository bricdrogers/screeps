import { ROLE_HARVESTER, ROLE_ROOMBA, ROLE_UPGRADER } from "Globals";
import { harvestTick } from "Creeps/Harvester";
import { roombaTick, roombaAddOwner } from "Creeps/Roomba";
import { upgraderTick } from "Creeps/Upgrader";
import { CreepRequest } from "CreepRequest";
import { EntityType } from "Prototypes/EntityTypes"

export function creepPrototype()
{
  // ***************
  // Creep.role
  // ***************
  Object.defineProperty(Creep.prototype, 'role',
  {
    get:function():string { return Memory.creeps[this.name].role; },
    set: function(value) { Memory.creeps[this.name].role = value; }
  });

  // ***************
  // Creep.bodyParts
  // ***************
  Object.defineProperty(Creep.prototype, 'bodyParts',
  {
    get:function():string[] { return Memory.creeps[this.name].bodyParts; },
    set: function(value) { Memory.creeps[this.name].bodyParts = value; }
  });

  // ***************
  // Creep.hasMultipleOwners
  // ***************
  Object.defineProperty(Creep.prototype, 'hasMultipleOwners',
  {
    get:function():boolean { return Memory.creeps[this.name].hasMultipleOwners; },
    set: function(value) { Memory.creeps[this.name].hasMultipleOwners = value; }
  });

  // ***************
  // Creep.canFulfillRequest(CreepRequest)
  // ***************
  Creep.prototype.canFulfillRequest = function(request:CreepRequest)
  {
    switch(request.Role)
    {
      case ROLE_ROOMBA:
      {
        roombaAddOwner(this, request.Owners);
        return true;
      }
      default:
      {
        console.log("Cannot check request fulfillment. Unsupported Type", request.Role);
        return false;
      }
    }

    return false;
  }

  // ***************
  // Creep.releaseFromDuty([EntityType, string])
  // ***************
  Creep.prototype.releaseFromDuty = function(_owner:[EntityType, string])
  {
    console.log("Release From Duty", this.name);
  }

  // ***************
  // Creep.tick(Source[], Structure[], {[id:string]: Resource})
  // ***************
  Creep.prototype.tick = function(sources:Source[], structures:Structure[], spawns:Spawn[], resources:{[id:string]: Resource})
  {
    switch(this.role)
    {
      case ROLE_HARVESTER:
      {
        harvestTick(this, sources, structures);
        break;
      }
      case ROLE_ROOMBA:
      {
        roombaTick(this, spawns, resources);
        break;
      }
      case ROLE_UPGRADER:
      {
        upgraderTick(this);
        break;
      }
      default:
      {
        console.log("Unknown creep role for", this.name + ".", "Cannot Update.");
        break;
      }
    }
  }
}

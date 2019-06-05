import { ROLE_HARVESTER, ROLE_ROOMBA, ROLE_UPGRADER, ROLE_BUILDER } from "Globals";
import { harvestTick } from "Creeps/Harvester";
import { roombaTick, roombaTryAddOwner } from "Creeps/Roomba";
import { upgraderTick } from "Creeps/Upgrader";
import { builderTick, builderAddOwner } from "Creeps/Builder";
import { CreepRequest } from "CreepRequest";

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
  // Creep.energyPerTick
  // The energy per this this creep will consume from the resource dump. if this is undefined
  // then this creep does not require energy consumption
  // ***************
  Object.defineProperty(Creep.prototype, 'energyPerTick',
  {
    get:function():number { return Memory.creeps[this.name].energyPerTick; },
    set: function(value) { Memory.creeps[this.name].energyPerTick = value; }
  });


  // ***************
  // Creep.canFulfillRequest(CreepRequest)
  // ***************
  Creep.prototype.canFulfillRequest = function(request:CreepRequest):boolean
  {
    switch(request.Role)
    {
      case ROLE_ROOMBA:
      {
        return roombaTryAddOwner(this, request.Owners);
      }
      case ROLE_BUILDER:
      {
        return builderAddOwner(this, request.Owners);
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
  // Creep.tick()
  // ***************
  Creep.prototype.tick = function()
  {
    switch(this.role)
    {
      case ROLE_HARVESTER:
      {
        harvestTick(this);
        break;
      }
      case ROLE_ROOMBA:
      {
        roombaTick(this);
        break;
      }
      case ROLE_UPGRADER:
      {
        upgraderTick(this);
        break;
      }
      case ROLE_BUILDER:
      {
        builderTick(this);
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

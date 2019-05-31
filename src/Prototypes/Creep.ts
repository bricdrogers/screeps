import { ROLE_HARVESTER, ROLE_ROOMBA, ROLE_UPGRADER, Globals } from "Globals";
import { harvestTick } from "Creeps/Harvester";
import { roombaTick, roombaTryAddOwner } from "Creeps/Roomba";
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
        return roombaTryAddOwner(this, request.Owners);;
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
  // Creep.getResourceFromStorage()
  // ***************
  Creep.prototype.getResourceFromStorage = function(resourceType:string)
  {
    var creep:Creep = this;
    var resourceDump:[EntityType, string] = creep.room.resourceDump;
    if(_.isUndefined(resourceDump))
    {
      return ERR_NOT_ENOUGH_RESOURCES;
    }

    switch(resourceDump[0])
    {
      case EntityType.Resource:
      {
        var resource:Resource = Globals.roomGlobals[creep.room.name].Resources[resourceDump[1]];
        if(_.isUndefined(resource) || resource == null)
        {
          console.log(creep.name, "Unable to get resource from dump. Resource not found.");
          return ERR_INVALID_TARGET;
        }

        // If the resource type is different, the resource does not exist
        if(resource.resourceType != resourceType)
        {
          return ERR_NOT_ENOUGH_RESOURCES;
        }

        return creep.pickup(resource);
      }
    }

    console.log(creep.name, "Unable to get resource from dump. Unsupported dump entity.");
    return ERR_INVALID_TARGET;
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
      default:
      {
        console.log("Unknown creep role for", this.name + ".", "Cannot Update.");
        break;
      }
    }
  }
}

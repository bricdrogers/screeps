import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"
import { CreepRequest, RequestPriority, RequestStatus } from "CreepRequest";
import { ROLE_ROOMBA } from "Globals";
import { EntityType } from "./EntityTypes";

const _updateTickRate:number = 6;

export function resourcePrototype()
{
  // ***************
  // Resource.Memory
  // ***************
  Object.defineProperty(Resource.prototype, 'memory',
  {
    get:function()
    {
      if(_.isUndefined(Memory.resources))
      {
        Memory.resources = {};
      }

      if(!_.isObject(Memory.resources))
      {
        return undefined;
      }

      return Memory.resources[this.id] =
            Memory.resources[this.id] || {};
    },
    set: function(value)
    {
      if(_.isUndefined(Memory.resources))
      {
          Memory.resources = {};
      }

      if(!_.isObject(Memory.resources))
      {
          throw new Error('Could not set resources memory');
      }
      Memory.resources[this.id] = value;
    }
  });

  // ***************
  // Resource.ticksSinceLastUpdate
  //  - Amount of game ticks since the last resource update tick
  // ***************
  Object.defineProperty(Resource.prototype, 'ticksSinceLastUpdate',
  {
    get:function():number
    {
      if(_.isUndefined(this.memory.ticksSinceLastUpdate))
      {
        this.memory.ticksSinceLastUpdate = 0;
      }
      return this.memory.ticksSinceLastUpdate;
    },
    set: function(value)
    {
      this.memory.ticksSinceLastUpdate = value;
    }
  });

  // ***************
  // Resource.requestId
  //  - The Id of the creep request that this resource has submitted. If undefined, this source
  //    has no current active request
  // ***************
  Object.defineProperty(Resource.prototype, 'requestId',
  {
    get:function():string
    {
      if(_.isUndefined(this.memory.requestId))
      {
        this.memory.requestId = null;;
      }
      return this.memory.requestId;
    },
    set: function(value)
    {
      this.memory.requestId = value;
    }
  });

  // ***************
  // Resource.creepId
  // Id of the creep assigned to pick up this resource
  // ***************
  Object.defineProperty(Resource.prototype, 'creepId',
  {
    get:function():string
    {
      return this.memory.creepId;
    },
    set: function(value)
    {
      this.memory.creepId = value;
    }
  });

  // ***************
  // Resource.releaseCreepLease(string)
  // ***************
  Resource.prototype.releaseCreepLease = function(_creepId:string)
  {
    this.creepId = null;
  }

  // ***************
  // Resource.tick(Room)
  // ***************
  Resource.prototype.tick = function(room:Room)
  {
    if(!checkCanUpdate(this)) return;
    var resource:Resource = this;

    if(resource.pos.isEqualTo(room.resourceDump)) return;
    if(resource.resourceType != RESOURCE_ENERGY)
    {
      console.log("No Resource Support for", resource.resourceType);
      return;
    }

    var requestId:string = resource.requestId;
    var owner:[EntityType, string] = [EntityType.Resource, resource.id];
    if(requestId != null)
    {
      var request:CreepRequest = CreepSpawnQueue.FindCreepRequest(room, requestId);

      // If the request is undefined, our heap memory has been reset and was reinitialzed.
      // This source will have to put in a new request.
      if(_.isUndefined(request))
      {
        resource.requestId = null;
        return;
      }

      // If the request is complete, we can release the requestId and add the
      // assigned body parts
      if(request.Status == RequestStatus.Complete)
      {
        resource.creepId = request.creepName;

        CreepSpawnQueue.RemoveCreepRequest(room, requestId, owner);
        resource.requestId = null;
      }
      else if(request.Status == RequestStatus.Failed)
      {
        CreepSpawnQueue.RemoveCreepRequest(room, requestId, owner);
        resource.requestId = null;
      }

      return;
    }

    if(resource.creepId == null)
    {
      resource.requestId = CreepSpawnQueue.CreateSharedRequest([MOVE, MOVE, CARRY, CARRY],
                                                               [],
                                                               RequestPriority.Discretionary,
                                                               ROLE_ROOMBA,
                                                               owner,
                                                               (resource.amount <= 500),
                                                               room);
    }
  }
}

function checkCanUpdate(resource:Resource)
{
  if(resource.ticksSinceLastUpdate >= _updateTickRate)
   {
      resource.ticksSinceLastUpdate = 0;
      return true;
   }
   else
   {
     ++resource.ticksSinceLastUpdate;
     return false;
   }
}

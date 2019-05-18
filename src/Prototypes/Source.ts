import { CreepRequest, RequestStatus, RequestPriority } from "CreepRequest";
import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"
import { EntityType } from "./EntityTypes";

const _updateTickRate:number = 5;
const _maxWorkParts:number = 5;

export function sourcePrototype()
{
  // ***************
  // Source.Memory
  // ***************
  Object.defineProperty(Source.prototype, 'memory',
  {
    get:function()
    {
      if(_.isUndefined(Memory.sources))
      {
        Memory.sources = {};
      }

      if(!_.isObject(Memory.sources))
      {
        return undefined;
      }

      return Memory.sources[this.id] =
            Memory.sources[this.id] || {};
    },
    set: function(value)
    {
      if(_.isUndefined(Memory.sources))
      {
          Memory.sources = {};
      }

      if(!_.isObject(Memory.sources))
      {
          throw new Error('Could not set source memory');
      }
      Memory.sources[this.id] = value;
    }
  });

  // ***************
  // Source.ticksSinceLastUpdate
  // ***************
  Object.defineProperty(Source.prototype, 'ticksSinceLastUpdate',
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
  // Source.workParts
  // ***************
  Object.defineProperty(Source.prototype, 'workParts',
  {
    get:function():number
    {
      if(_.isUndefined(this.memory.workParts))
      {
        this.memory.workParts = 0;
      }
      return this.memory.workParts;
    },
    set: function(value)
    {
      this.memory.workParts = value;
    }
  });

  // ***************
  // Source.requestId
  // ***************
  Object.defineProperty(Source.prototype, 'requestId',
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
  // Source.releaseCreepLease(Room)
  // ***************
  Source.prototype.releaseCreepLease = function(creepId:string)
  {
    var bodyParts:string[] = Memory.creeps[creepId].BodyParts;
    this.workParts -= bodyParts.filter(function(bodyPart:string) { return bodyPart == WORK; }).length;
  }

  // ***************
  // Source.tick(Room)
  // ***************
  Source.prototype.tick = function(room:Room)
  {
    if(!checkCanUpdate(this)) return;

    var requestId:string = this.requestId;
    // If the source has a requestId, we need to wait for it to be complete.
    if(requestId != null)
    {
      var request:CreepRequest = CreepSpawnQueue.FindCreepRequest(room, requestId);

      // If the request is undefined, our heap memory has been reset and was reinitialzed.
      // This source will have to put in a new request.
      if(_.isUndefined(request))
      {
        this.requestId = null;
        return;
      }

      // If the request is complete, we can release the requestId and add the
      // assigned body parts
      if(request.Status == RequestStatus.Complete)
      {
        this.workParts += request.actualBodyParts.filter(function(bodyPart:string) { return bodyPart == WORK; }).length;

        CreepSpawnQueue.RemoveCreepRequest(room, requestId);
        this.requestId = null;
      }
      else if(request.Status == RequestStatus.Failed)
      {
        CreepSpawnQueue.RemoveCreepRequest(room, requestId);
        this.requestId = null;
      }

      return;
    }

    if(this.workParts < _maxWorkParts)
    {
      var request:CreepRequest = new CreepRequest([WORK, MOVE, CARRY],
                                                  [WORK, WORK, WORK, WORK],
                                                  RequestPriority.Routine,
                                                  "harvester",
                                                  [EntityType.Source, this.id]);
      CreepSpawnQueue.AddCreepRequest(room, request);
      this.requestId = request.Id;
    }

    // TODO: How to remove dead harvesters?
  }
}

function checkCanUpdate(source:Source)
{
  if(source.ticksSinceLastUpdate >= _updateTickRate)
   {
      source.ticksSinceLastUpdate = 0;
      return true;
   }
   else
   {
     ++source.ticksSinceLastUpdate;
     return false;
   }
}

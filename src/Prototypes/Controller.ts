import { CreepRequest, RequestPriority, RequestStatus } from "CreepRequest";
import { EntityType } from "Prototypes/EntityTypes"
import { ROLE_UPGRADER } from "Globals";
import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"

const _updateTickRate:number = 50;

export function controllerPrototype()
{
  // ***************
  // StructureController.Memory
  // ***************
  Object.defineProperty(StructureController.prototype, 'memory',
  {
    get:function()
    {
      if(_.isUndefined(Memory.controllers))
      {
        Memory.controllers = {};
      }

      if(!_.isObject(Memory.controllers))
      {
        return undefined;
      }

      return Memory.controllers[this.id] =
            Memory.controllers[this.id] || {};
    },
    set: function(value)
    {
      if(_.isUndefined(Memory.controllers))
      {
          Memory.controllers = {};
      }

      if(!_.isObject(Memory.controllers))
      {
          throw new Error('Could not set controllers memory');
      }
      Memory.controllers[this.id] = value;
    }
  });

  // ***************
  // StructureController.ticksSinceLastUpdate
  //  - Amount of game ticks since the last controller update tick
  // ***************
  Object.defineProperty(StructureController.prototype, 'ticksSinceLastUpdate',
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
  // StructureController.requestId
  //  - The Id of the creep request that this controller has submitted. If undefined, this source
  //    has no current active request
  // ***************
  Object.defineProperty(StructureController.prototype, 'requestId',
  {
    get:function():string
    {
      if(_.isUndefined(this.memory.requestId))
      {
        this.memory.requestId = null;
      }
      return this.memory.requestId;
    },
    set: function(value)
    {
      this.memory.requestId = value;
    }
  });

  // ***************
  // StructureController.creeps
  //  - List of creeps currently assigned to upgrade this controller
  // ***************
  Object.defineProperty(StructureController.prototype, 'creeps',
  {
    get:function():string[]
    {
      if(_.isUndefined(this.memory.creeps))
      {
        this.memory.creeps = [];
      }
      return this.memory.creeps;
    },
    set: function(value)
    {
      this.memory.creeps = value;
    }
  });

  // ***************
  // StructureController.releaseCreepLease(string)
  // ***************
  StructureController.prototype.releaseCreepLease = function(creepId:string)
  {
    // Remove the creep from the know creep list
    const removeIndex = this.creeps.findIndex(id => id == creepId);
    if(removeIndex > -1) this.creeps.splice(removeIndex, 1);
  }

  // ***************
  // StructureController.tick(Room)
  // ***************
  StructureController.prototype.tick = function()
  {
    if(!checkCanUpdate(this)) return;
    var controller:StructureController = this;
    var requestId:string = this.requestId;
    var owner:[EntityType, string] = [EntityType.Controller, controller.id];

    if(requestId != null)
    {
      var request:CreepRequest = CreepSpawnQueue.FindCreepRequest(controller.room, requestId);

      // If the request is undefined, our heap memory has been reset and was reinitialzed.
      // This source will have to put in a new request.
      if(_.isUndefined(request))
      {
        controller.requestId = null;
        return;
      }

      if(request.Status == RequestStatus.Complete)
      {
        controller.creeps.push(request.Owners[0][1]);

        CreepSpawnQueue.RemoveCreepRequest(controller.room, requestId, owner);
        controller.requestId = null;
      }
      else if(request.Status == RequestStatus.Failed)
      {
        CreepSpawnQueue.RemoveCreepRequest(controller.room, requestId, owner);
        controller.requestId = null;
      }

      return;
    }

    // The controller wants as many creeps as possible. Constantly request more creeps
    // at the lowest priority.
    if(controller.level < 8)
    {
      var request:CreepRequest = new CreepRequest([WORK, WORK, MOVE, CARRY],
                                                  [MOVE, MOVE, CARRY, WORK, WORK],
                                                  RequestPriority.Deferral,
                                                  ROLE_UPGRADER,
                                                  owner);
      CreepSpawnQueue.AddCreepRequest(controller.room, request);
      this.requestId = request.Id;
    }
  }
}

function checkCanUpdate(controller:Controller)
{
  if(controller.ticksSinceLastUpdate >= _updateTickRate)
   {
      controller.ticksSinceLastUpdate = 0;
      return true;
   }
   else
   {
     ++controller.ticksSinceLastUpdate;
     return false;
   }
}

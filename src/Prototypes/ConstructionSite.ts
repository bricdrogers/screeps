import { FindPath } from "Utils/PathFinding"
import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"
import { CreepRequest, RequestPriority, RequestStatus } from "CreepRequest";
import { ROLE_BUILDER } from "Globals";
import { EntityType } from "./EntityTypes";

const _updateTickRate:number = 26;

export function constructionSitePrototype()
{
  // ***************
  // ConstructionSite.Memory
  // ***************
  Object.defineProperty(ConstructionSite.prototype, 'memory',
  {
    get:function()
    {
      if(_.isUndefined(Memory.constructionSites))
      {
        Memory.constructionSites = {};
      }

      if(!_.isObject(Memory.constructionSites))
      {
        return undefined;
      }

      return Memory.constructionSites[this.id] =
            Memory.constructionSites[this.id] || {};
    },
    set: function(value)
    {
      if(_.isUndefined(Memory.constructionSites))
      {
          Memory.constructionSites = {};
      }

      if(!_.isObject(Memory.constructionSites))
      {
          throw new Error('Could not set constructionSites memory');
      }
      Memory.constructionSites[this.id] = value;
    }
  });

  // ***************
  // ConstructionSite.ticksSinceLastUpdate
  //  - Amount of game ticks since the last resource update tick
  // ***************
  Object.defineProperty(ConstructionSite.prototype, 'ticksSinceLastUpdate',
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
  // ConstructionSite.pathToDump
  // ***************
  Object.defineProperty(ConstructionSite.prototype, 'pathToDump',
  {
    get:function():PathFinderPath
    {
      if(_.isUndefined(this.memory.pathToDump))
      {
        this.memory.pathToDump = FindPath(this.pos, this.room.resourceDumpPos);
      }

      return <PathFinderPath>this.memory.pathToDump;
    }
  });

  // ***************
  // ConstructionSite.requestId
  //  - The Id of the creep request that this constructionSite has submitted. If undefined, this source
  //    has no current active request
  // ***************
  Object.defineProperty(ConstructionSite.prototype, 'requestId',
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
  // ConstructionSite.creepId
  // Id of the creep assigned to pick up this resource
  // ***************
  Object.defineProperty(ConstructionSite.prototype, 'creepId',
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
  // ConstructionSite.releaseCreepLease(string)
  // ***************
  ConstructionSite.prototype.releaseCreepLease = function(_creepId:string)
  {
    this.creepId = null;
  }

  // ***************
  // ConstructionSite.tick()
  // ***************
  ConstructionSite.prototype.tick = function(room:Room)
  {
    if(!checkCanUpdate(this)) return;
    checkUndefinedMemory(this);

    var constructionSite:ConstructionSite = this;
    var owner:[EntityType, string] = [EntityType.ConstructionSite, constructionSite.id];

    var requestId:string = constructionSite.requestId;
    if(requestId != null)
    {
      var request:CreepRequest = CreepSpawnQueue.FindCreepRequest(room, requestId);

      // If the request is undefined, our heap memory has been reset and was reinitialzed.
      // This source will have to put in a new request.
      if(_.isUndefined(request))
      {
        constructionSite.requestId = null;
        return;
      }

      // If the request is complete, we can release the requestId and add the
      // assigned body parts
      if(request.Status == RequestStatus.Complete)
      {
        constructionSite.creepId = request.creepName;

        CreepSpawnQueue.RemoveCreepRequest(room, requestId, owner);
        constructionSite.requestId = null;
      }
      else if(request.Status == RequestStatus.Failed)
      {
        CreepSpawnQueue.RemoveCreepRequest(room, requestId, owner);
        constructionSite.requestId = null;
      }

      return;
    }

    if(constructionSite.creepId == null)
    {
      //Builds a structure for 5 energy units per tick.
      constructionSite.requestId =
            CreepSpawnQueue.CreateSharedRequest([WORK, WORK, MOVE, CARRY],
                                                [MOVE, MOVE, CARRY, WORK, WORK],
                                                RequestPriority.Discretionary,
                                                ROLE_BUILDER,
                                                owner,
                                                true,
                                                room);
    }

  }
}

function checkUndefinedMemory(site:ConstructionSite)
{
  if(_.isUndefined(site.memory.pathToDump)) site.pathToDump;
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

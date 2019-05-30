import { CreepRequest, RequestStatus, RequestPriority } from "CreepRequest";
import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"
import { EntityType } from "./EntityTypes";
import { ROLE_HARVESTER, RoomGlobalData, Globals } from "Globals";

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
  //  - Amount of game ticks since the last source update tick
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
  //  - Total amount of work parts on creeps that are assigned to this source
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
  //  - The Id of the creep request that this source has submitted. If undefined, this source
  //    has no current active request
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
  // Source.containerId
  // Id of the container storage of the source
  // ***************
  Object.defineProperty(Source.prototype, 'containerId',
  {
    get:function():string
    {
      return this.memory.containerId;
    },
    set: function(value)
    {
      this.memory.containerId = value;
    }
  });

  // ***************
  // Source.energyPerTick
  //  - The max amount of energy per tick that is available to harvest given the amount of workparts
  //    assigned to this source
  // ***************
  Object.defineProperty(Source.prototype, 'energyPerTick',
  {
    get:function():number
    {
      return Math.max(this.workParts * 2, this.energyCapacity);
    }
  });

  // ***************
  // Source.harvestSlots
  //  - Array of spots that can be harvested from this source
  //    {
  //      x: x position of the spot
  //      y: y position of the spot
  //      creep: name of the creep assigned to this spot. if undefined, the spot is available
  //      containerId: id of the container in this slot. If undefined, no container in this slow
  //    }
  }
  // ***************
  Object.defineProperty(Source.prototype, 'harvestSlots',
  {
    get:function():any
    {
      return this.memory.harvestSlots;
    },
    set: function(value)
    {
      this.memory.harvestSlots = value;
    }
  });

  // ***************
  // Source.releaseCreepLease(string)
  // ***************
  Source.prototype.releaseCreepLease = function(creepId:string)
  {
    if(!removeCreepFromSlot(this, creepId)) return;

    var bodyParts:string[] = Memory.creeps[creepId].bodyParts;
    this.workParts -= bodyParts.filter(function(bodyPart:string) { return bodyPart == WORK; }).length;
  }

  // ***************
  // Source.getHarvestSlot(string)
  // ***************
  Source.prototype.findHarvestSlot = function(creepId:string)
  {
    if(creepId == undefined) return undefined;
    return getHarvestSlot(this, creepId);
  }

  // ***************
  // Source.tick(Room)
  // ***************
  Source.prototype.tick = function(room:Room)
  {
    if(!checkCanUpdate(this)) return;
    var roomGlobals:RoomGlobalData = Globals.roomGlobals[room.name];

    // Init Memory
    if(_.isUndefined(this.harvestSlots))
    {
      initHarvestSlots(this, room);
      createContainer(this, room, roomGlobals.Spawns);
    }
    else
    {
      // Resolve constructionSite id's if needed
      if(!_.isUndefined(this.memory.needsNextTickResolve)) { resolveContainerId(this, roomGlobals.ConstructionSites); }
    }

    var requestId:string = this.requestId;
    var owner:[EntityType, string] = [EntityType.Source, this.id];
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

      switch(request.Status)
      {
        case RequestStatus.Complete:
        {
          // If the request is complete, we can release the requestId and add the
          // assigned body parts
          this.workParts += request.actualBodyParts.filter(function(bodyPart:string) { return bodyPart == WORK; }).length;
          assignCreepToSlot(this, request.creepName);

          CreepSpawnQueue.RemoveCreepRequest(room, requestId, owner);
          this.requestId = null;

          break;
        }
        case RequestStatus.Failed:
        {
          CreepSpawnQueue.RemoveCreepRequest(room, requestId, owner);
          this.requestId = null;
          break;
        }
        case RequestStatus.Processing:
        case RequestStatus.Queued:
        {
          // If our request is discretionary, we need to invalidate the request in order
          // to spawn a new creep
          if(request.Priority == RequestPriority.Discretionary &&
             this.workParts <= 2)
          {
            console.log("Source:", this.id, "is resubmitting creep request under higher priority.");
            request.isValid = false;
            CreepSpawnQueue.RemoveCreepRequest(room, request.Id, owner);
            this.requestId = null;
          }
          break;
        }
      }

      return;
    }

    if(!_.isUndefined(getHarvestSlot(this, undefined)) && this.workParts < _maxWorkParts)
    {
      // If we have 4 or more workparts, we can reduce to priority of the request
      var priority:RequestPriority = RequestPriority.Discretionary;
      if(this.workParts < 4) priority = RequestPriority.Routine;

      var request:CreepRequest = new CreepRequest([WORK, MOVE, CARRY],
                                                  [WORK, WORK, WORK, WORK],
                                                  priority,
                                                  ROLE_HARVESTER,
                                                  owner);
      CreepSpawnQueue.AddCreepRequest(room, request);
      this.requestId = request.Id;
    }
  }

function resolveContainerId(source:Source, constructionSites:ConstructionSite[])
{
  var containerIdResolve:any = source.harvestSlots.find(function(value:any)
  {
      return !_.isUndefined(value.needsContainerId);
  });

  if(!_.isUndefined(containerIdResolve))
  {
    // check the construction sites
    var containerSite:ConstructionSite = constructionSites.find(function(site:ConstructionSite)
    {
      if(site.pos.x == containerIdResolve.x &&
         site.pos.y == containerIdResolve.y &&
         site.structureType == STRUCTURE_CONTAINER)
      {
        return true;
      }
      return false;
    });

    if(!_.isUndefined(containerSite))
    {
      containerIdResolve.containerId = containerSite.id;
      delete containerIdResolve.needsContainerId;
    }
    else
    {
      // TODO: Check Structures
    }
  }

  delete source.memory.needsNextTickResolve;
}

function createContainer(source:Source, room:Room, spawns:Spawn[])
{
  // The best container position is the closest spot to the spawn
  var pathToSource:PathFinderPath = PathFinder.search(spawns[0].pos, {pos: source.pos, range:1});
  var containerPos:RoomPosition = pathToSource.path[pathToSource.path.length - 1];

  var containerSlot:any = source.harvestSlots.find(function(value:any)
    {
        return (containerPos.x == value.x && containerPos.y == value.y)
    });

  if(_.isUndefined(containerSlot))
  {
    console.log("Failed to create container for source", source.id);
    return;
  }

  if(room.createConstructionSite(containerPos.x, containerPos.y, STRUCTURE_CONTAINER) == OK)
  {
    containerSlot.needsContainerId = true;
    source.memory.needsNextTickResolve = true;
  }
}

function initHarvestSlots(source:Source, room:Room)
{
  if(_.isUndefined(source.memory.harvestSlots))
  {
    var areaList:LookAtResultWithPos[] = <LookAtResultWithPos[]>room
              .lookForAtArea(LOOK_TERRAIN, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);

    var slots = [];
    areaList.forEach(function(area)
    {
        if(area.terrain == "plain" || area.terrain == "swamp")
        {
          let slot =
          {
            x: area.x,
            y: area.y,
            creep: undefined,
          }

          slots.push(slot);
        }
    });

    source.harvestSlots = slots;
  }
}

function removeCreepFromSlot(source:Source, creepName:string)
{
  var slots = source.harvestSlots;
  for(let slot of slots)
  {
    if(slot.creep == creepName)
    {
      slot.creep = undefined;

      // If the creep died on the container, we need to try and move
      // another creep to the container slot
      if(!_.isUndefined(slot.containerId))
      {
        var moveSlot = slots.find(function(slot) { return !_.isUndefined(slot.creep) });
        if(!_.isUndefined(moveSlot))
        {
          slot.creep = moveSlot.creep;
          moveSlot.creep = undefined;
        }
      }

      return true;
    }
  }

  return false;
}

function assignCreepToSlot(source:Source, creepName:string)
{
  var assignedSlot:any = undefined;
  for(let slot of source.harvestSlots)
  {
    if(slot.creep == undefined)
    {
      assignedSlot= slot;
      if(!_.isUndefined(slot.containerId)) break;
    }
  }
  assignedSlot.creep = creepName;
}

function getHarvestSlot(source:Source, creepName:string)
{
  for(let slot of source.harvestSlots)
  {
    if(slot.creep == creepName) return slot
  }

  return undefined;
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

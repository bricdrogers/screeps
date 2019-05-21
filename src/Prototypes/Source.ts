import { CreepRequest, RequestStatus, RequestPriority } from "CreepRequest";
import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"
import { EntityType } from "./EntityTypes";
import { ROLE_HARVESTER } from "Globals";

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
  // Source.energyPerTick
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
  // Source.hasContainer
  // ***************
  Object.defineProperty(Source.prototype, 'hasContainer',
  {
    get:function():boolean
    {
      return this.memory.hasContainer;
    },
    set: function(value)
    {
      this.memory.hasContainer = value;
    }
  });

  // ***************
  // Source.releaseCreepLease(Room)
  // ***************
  Source.prototype.releaseCreepLease = function(creepId:string)
  {
    var bodyParts:string[] = Memory.creeps[creepId].bodyParts;
    this.workParts -= bodyParts.filter(function(bodyPart:string) { return bodyPart == WORK; }).length;
    updateCreepInSlot(this, creepId, undefined);
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

    // Init Memory
    if(_.isUndefined(this.harvestSlots)) initHarvestSlots(this, room);
    if(_.isUndefined(this.hasContainer)) createContainer(this, room);

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
        updateCreepInSlot(this, undefined, request.creepName);

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

    if(!_.isUndefined(getHarvestSlot(this, undefined)) && this.workParts < _maxWorkParts)
    {
      var request:CreepRequest = new CreepRequest([WORK, MOVE, CARRY],
                                                  [WORK, WORK, WORK, WORK],
                                                  RequestPriority.Routine,
                                                  ROLE_HARVESTER,
                                                  [EntityType.Source, this.id]);
      CreepSpawnQueue.AddCreepRequest(room, request);
      this.requestId = request.Id;
    }
  }
}


function createContainer(source:Source, room:Room)
{
  var slots = source.harvestSlots;

  // if the source has more than one slot, we just use one
  // of the available slots
  if(slots.length > 1)
  {
    var slot = slots.pop();
    room.createConstructionSite(slot.x, slot.y, STRUCTURE_CONTAINER);
  }
  else(slot.length == 1)
  {
    var slot = slots[0];
    var areaList:LookAtResultWithPos[] = <LookAtResultWithPos[]>room
              .lookForAtArea(LOOK_TERRAIN, slot.y - 1, slot.x - 1, slot.y + 1, slot.x + 1, true);
  }

  source.hasContainer = true;
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

function updateCreepInSlot(source:Source, findCreepName:string, newCreepName:string)
{
  var slots = source.harvestSlots;
  for(let slot of slots)
  {
    if(slot.creep == findCreepName)
    {
      slot.creep = newCreepName;
      break;
    }
  }
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

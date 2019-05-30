import { EntityType } from "./EntityTypes";
import { OverseerVenture } from "Managers/OverseerVenture"

const _updateTickRate:number = 50;

export function roomPrototype()
{

  // ***************
  // Room.ticksSinceLastUpdate
  // ***************
  Object.defineProperty(Room.prototype, 'ticksSinceLastUpdate',
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
  // Room.resourceDumpPos
  // ***************
  Object.defineProperty(Room.prototype, 'resourceDumpPos',
  {
    get:function():RoomPosition
    {
      if(_.isUndefined(this.memory.resourceDumpPos))
      {
        var spawns:Spawn[] = this.find(FIND_MY_SPAWNS);
        this.memory.resourceDumpPos = new RoomPosition(spawns[0].pos.x, spawns[0].pos.y - 2, this.name);
      }

      var pos:any = this.memory.resourceDumpPos;
      return new RoomPosition(pos.x, pos.y, this.name);
    }
  });

  // ***************
  // Room.resourceDump
  //  The Entity type is the entity of the dump (container, storage, resource, etc..)
  //  The string is the id of the entity
  // ***************
  Object.defineProperty(Room.prototype, 'resourceDump',
  {
    get:function():[EntityType, string]
    {
      return this.memory.resourceDump;
    },
    set: function(value)
    {
      this.memory.resourceDump = value;
    }
  });

  // ***************
  // Room.getResourceDumpEnergy()
  // ***************
  Room.prototype.getResourceDumpEnergy = function()
  {
    var room:Room = this;

    var resourceDump:[EntityType, string] = room.resourceDump;
    if(_.isUndefined(resourceDump)) return 0;

    switch(resourceDump[0])
    {
      case EntityType.Resource:
      {
        var resource:Resource = OverseerVenture.Resources[resourceDump[1]];
        if(_.isUndefined(resource)) return 0;
        return resource.amount;
      }
    }

    return 0;
  }

  // ***************
  // Room.tick()
  // ***************
  Room.prototype.tick = function(_spawns:Spawn[])
  {
    if(!checkCanUpdate(this)) return;
  }
}

function checkCanUpdate(room:Room)
{
  if(room.ticksSinceLastUpdate >= _updateTickRate)
   {
    room.ticksSinceLastUpdate = 0;
      return true;
   }
   else
   {
     ++room.ticksSinceLastUpdate;
     return false;
   }
}

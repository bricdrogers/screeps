import { EntityType } from "./EntityTypes";

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
      return this.memory.resourceDumpPos;
    },
    set: function(value)
    {
      this.memory.resourceDumpPos = value;
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
  // Room.tick()
  // ***************
  Room.prototype.tick = function(spawns:Spawn[])
  {
    if(!checkCanUpdate(this)) return;
    var room:Room = this;

    if(_.isUndefined(room.resourceDumpPos))
    {
      var spawn:Spawn = spawns[0];
      room.resourceDumpPos = new RoomPosition(spawn.pos.x, spawn.pos.y - 2, room.name);
    }
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

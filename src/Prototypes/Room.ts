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
  // Room.resourceDump
  // ***************
  Object.defineProperty(Room.prototype, 'resourceDump',
  {
    get:function():RoomPosition
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

    if(_.isUndefined(room.resourceDump))
    {
      var spawn:Spawn = spawns[0];
      room.resourceDump = new RoomPosition(spawn.pos.x, spawn.pos.y - 2, room.name);
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

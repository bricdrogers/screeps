const _updateTickRate:number = 1;

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
  // Room.tick()
  // ***************
  Room.prototype.tick = function(_sources:Source[])
  {
    if(!checkCanUpdate(this)) return;

    // var roomEnergyPerTick:number = 0;
    // sources.forEach(function(source)
    // {
    //   roomEnergyPerTick += source.energyPerTick;
    // });
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

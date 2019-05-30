export function spawnPrototype()
{
  // ***************
  // Spawn.ticksSinceLastUpdate
  //  - Amount of game ticks since the last spawn update tick
  // ***************
  Object.defineProperty(Spawn.prototype, 'ticksSinceLastUpdate',
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
  // Spawn.tick(Room)
  // ***************
  Spawn.prototype.tick = function()
  {
  }
}

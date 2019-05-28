export function spawnPrototype()
{
  // ***************
  // Spawn.Memory
  // ***************
  Object.defineProperty(Spawn.prototype, 'memory',
  {
    get:function()
    {
      if(_.isUndefined(Memory.spawns))
      {
        Memory.spawns = {};
      }

      if(!_.isObject(Memory.spawns))
      {
        return undefined;
      }

      return Memory.spawns[this.id] =
            Memory.spawns[this.id] || {};
    },
    set: function(value)
    {
      if(_.isUndefined(Memory.spawns))
      {
          Memory.spawns = {};
      }

      if(!_.isObject(Memory.spawns))
      {
          throw new Error('Could not set spawns memory');
      }
      Memory.spawns[this.id] = value;
    }
  });

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

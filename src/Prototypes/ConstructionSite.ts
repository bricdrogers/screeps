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
  // ConstructionSite.tick()
  // ***************
  ConstructionSite.prototype.tick = function(_room:Room)
  {
    if(!checkCanUpdate(this)) return;
  }
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

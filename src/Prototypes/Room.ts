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
  Room.prototype.tick = function(_spawns:Spawn[])
  {
    if(!checkCanUpdate(this)) return;

    // var room:Room = this;

    // var droppedResources:Resource[] = room.find(FIND_DROPPED_RESOURCES);
    // var totalEnergy:number = 0;
    // for(let resource of droppedResources)
    // {
    //   if(resource.resourceType == RESOURCE_ENERGY)
    //   {
    //     console.log("Resource id", resource.id);
    //     // Estimate
    //     //var range = resource.pos.getRangeTo(spawns[0]) * 2;

    //     totalEnergy += resource.amount;
    //   }
    // }
    // console.log("Total Energy:", totalEnergy);
    //MOVE, MOVE, CARRY, CARRY

    // var request:CreepRequest = new CreepRequest([WORK, MOVE, CARRY],
    //   [WORK, WORK, WORK, WORK],
    //   RequestPriority.Routine,
    //   ROLE_HARVESTER,
    //   [EntityType.Source, this.id]);
    // TOOD: Check Tombstones

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

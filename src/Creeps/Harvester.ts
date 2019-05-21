import { EntityType } from "Prototypes/EntityTypes"

export function harvestTick(creep:Creep, sources:Source[])
{
  // TODO: handle deposit into container
  // TODO: Handle source available positions

  var owner:[EntityType, string] = Memory.creeps[creep.name].owner;
  var source:Source = sources.find(function(source) { return source.id == owner[1]; });

  var result:number = creep.harvest(source);
  if(result == ERR_NOT_IN_RANGE)
  {

    var harvestSlot = source.findHarvestSlot(creep.name);
    creep.moveTo(harvestSlot.x, harvestSlot.y, {visualizePathStyle: {stroke: '#ffffff'}});
  }
}

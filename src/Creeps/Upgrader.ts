import { EntityType } from "Prototypes/EntityTypes"

export enum UpgraderState
{
  Gathering,    // The creep is moving to and gathering energy for upgrading
  Upgrading,    // The creep moving into position to upgrade the controller
}

export function upgraderTick(creep:Creep)
{
  var memory:any = Memory.creeps[creep.name];

  if(memory.hasMultipleOwners)
  {
    console.log("Upgraders currently do not support multiple owners. Skipping update.");
    return;
  }

  // Initialize memory
  if(_.isUndefined(memory.state))
  {
    creep.say("🌾" + UpgraderState[UpgraderState.Gathering]);
    memory.state = UpgraderState.Gathering;
  }

  var owner:[EntityType, string] = memory.owners[0];
  if(owner[0] != EntityType.Controller)
  {
    console.log("Upgraders only support controller owners.");
    return;
  }

  switch(memory.state)
  {
    case UpgraderState.Gathering:
    {
      if(creep.carry.energy == creep.carryCapacity)
      {
        creep.say("🏷️" + UpgraderState[UpgraderState.Upgrading]);
        creep.memory.state = UpgraderState.Upgrading;
        break;
      }

      // Load up from the resource dump
      if(creep.getResourceFromStorage(RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
      {
        creep.moveTo(creep.room.resourceDumpPos);
      }

      break;
    }
    case UpgraderState.Upgrading:
    {
      if(creep.carry.energy == 0)
      {
        creep.say("🌾" + UpgraderState[UpgraderState.Gathering]);
        creep.memory.state = UpgraderState.Gathering;
        break;
      }

      if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE)
      {
          creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
      }

      break;
    }
  }
}

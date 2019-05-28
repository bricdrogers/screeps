import { EntityType } from "Prototypes/EntityTypes"
import { roomPrototype } from "Prototypes/Room";

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
      break;
    }
    case UpgraderState.Upgrading:
    {
      break;
    }
  }
}

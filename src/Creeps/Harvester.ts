import { EntityType } from "Prototypes/EntityTypes"
import { RoomGlobalData, Globals } from "Globals";

export enum HarvesterState
{
  Parked, // The creep is parked over the container, harvest until death
  Gathering, // The creep is currently gathering energy
  Transferring, // The creep is moving to or tranferring energy into an energy dump
  Traveling, // The creep is moving to its spot
}

export function harvestTick(creep:Creep)
{
  var roomGlobals:RoomGlobalData = Globals.roomGlobals[creep.room.name];

  var memory:any = Memory.creeps[creep.name];

  if(memory.hasMultipleOwners)
  {
    console.log("Harvesters currently do not support multiple owners. Skipping update.");
    return;
  }

  // Initialize memory
  if(_.isUndefined(memory.state))
  {
    creep.say("🚐" + HarvesterState[HarvesterState.Traveling]);
    memory.state = HarvesterState.Traveling;
  }

  var owner:[EntityType, string] = memory.owners[0];
  var source:Source = roomGlobals.Sources.find(function(source) { return source.id == owner[1]; });
  var harvestSlot = source.findHarvestSlot(creep.name);

  if(_.isUndefined(harvestSlot)) return;

  switch(memory.state)
  {
    case HarvesterState.Traveling:
    {
      // If we are at our destination, we can move to the next case
      if(creep.pos.x == harvestSlot.x && creep.pos.y == harvestSlot.y)
      {
        if(_.isUndefined(harvestSlot.containerId))
        {
          creep.say("🌾" + HarvesterState[HarvesterState.Gathering]);
          creep.memory.state = HarvesterState.Gathering;
        }
        else
        {
          creep.say("🎢" + HarvesterState[HarvesterState.Parked]);
          creep.memory.state = HarvesterState.Parked;
        }
        break;
      }

      creep.moveTo(harvestSlot.x, harvestSlot.y, {visualizePathStyle: {stroke: '#ffffff'}});
      break;
    }
    case HarvesterState.Parked:
    {
      creep.harvest(source);
      break;
    }
    case HarvesterState.Gathering:
    {
      if(creep.carry.energy == creep.carryCapacity)
      {
        creep.say("🙌" + HarvesterState[HarvesterState.Transferring]);
        creep.memory.state = HarvesterState.Transferring;

        break;
      }

      creep.harvest(source);
      break;
    }
    case HarvesterState.Transferring:
    {
      if(creep.carry.energy == 0)
      {
        creep.say("🚐" + HarvesterState[HarvesterState.Traveling]);
        memory.state = HarvesterState.Traveling;

        break;
      }

      // If the transfer target is undefined, it could be a constructionSite or invalid
      // just drop it on the ground
      if(_.isUndefined(source.containerId))
      {
        creep.drop(RESOURCE_ENERGY);
        break;
      }

      var transferTarget = roomGlobals.Structures.find(function(structure)
      {
        if(structure.id == source.containerId) return true;
        return false;
      });

      if(creep.transfer(transferTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
      {
        creep.moveTo(transferTarget);
      }
      break;
    }
    default:
    {
      console.log("Unknown Harvester State");
      return;
    }
  };
}

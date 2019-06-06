import { EntityType } from "Prototypes/EntityTypes"
import { RoomGlobalData, Globals } from "Globals";

export enum BuilderState
{
  Gathering,    // The creep is moving to and gathering energy for upgrading
  Building,     // The creep moving into position or is building on a construction site
  Idle,         // The creep is waiting for commands
  Calculating,  // The creep performing required but higher cost calculations and will not perform actions this tick
}

// We only want one builder at a time. A builder will accept all owner request and release the requests
// upon death
export function builderAddOwner(creep:Creep, owners:[EntityType, string][]):boolean
{
  var memory:any = Memory.creeps[creep.name];
  for(let owner of owners)
  {
    memory.owners.push(owner);
  }

  return true;
}

export function builderTick(creep:Creep)
{
  var roomGlobals:RoomGlobalData = Globals.roomGlobals[creep.room.name];
  var memory:any = Memory.creeps[creep.name];

  // Initialize memory
  if(_.isUndefined(memory.state))
  {
    creep.say("💤");
    memory.state = BuilderState.Idle;
  }

  var owners:[EntityType, string][] = memory.owners;
  switch(memory.state)
  {
    case BuilderState.Idle:
    {
      if(owners.length > 0)
      {
        creep.say("⚗️");
        memory.state = BuilderState.Calculating;
      }

      break;
    }
    case BuilderState.Calculating:
    {
      // TODO: smart choose build site. for now, choose the first one
      memory.siteId = owners[0][1];

      creep.say("🌾");
      memory.state = BuilderState.Gathering;
      break;
    }
    case BuilderState.Gathering:
    {
      if(creep.carry.energy == creep.carryCapacity)
      {
        creep.say("🔨");
        creep.memory.state = BuilderState.Building;
        break;
      }

      // Load up from the resource dump
      if(creep.room.getResourceFromDump(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
      {
        creep.moveTo(creep.room.resourceDumpPos);
      }

      break;
    }
    case BuilderState.Building:
    {
      if(creep.carry.energy == 0)
      {
        creep.say("🌾");
        creep.memory.state = BuilderState.Gathering;
        break;
      }

      var siteId:string = memory.siteId;
      if(_.isUndefined(siteId))
      {
        creep.say("💤");
        memory.state = BuilderState.Idle;
        break;
      }

      var site:ConstructionSite =  roomGlobals.ConstructionSites[siteId];
      if(_.isUndefined(site) || site == null)
      {
        creep.say("💤");
        memory.state = BuilderState.Idle;
        break;
      }

      if(creep.build(site) == ERR_NOT_IN_RANGE)
      {
        creep.moveTo(site, {visualizePathStyle: {stroke: '#ffffff'}});
      }

      break;
    }
  }
}

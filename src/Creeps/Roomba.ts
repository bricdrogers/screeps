import { EntityType } from "Prototypes/EntityTypes"
import { RoomGlobalData, Globals } from "Globals";

export enum RoombaState
{
  Transferring, // The creep is moving to or tranferring energy into an energy dump
  Gathering,    // The creep is moving to and gathering resources in the map
  Idle,         // The creep is waiting for commands
  Calculating,  // The creep is calculating its next collection
}

export function roombaTryAddOwner(creep:Creep, owners:[EntityType, string][]):boolean
{
  let ticksToComplete:number = 0;
  var memory:any = Memory.creeps[creep.name];
  for(let creepOwner of memory.owners)
  {
    var ownerTicks = getTicksToComplete(creep, creepOwner);
    if(_.isUndefined(ownerTicks)) continue;

    ticksToComplete += ownerTicks;

    // If the ticks to complete picking up all owned resources is larger than the amount
    // of time this creep has left to live, then we deny adding the new owner.
    if(ticksToComplete > creep.ticksToLive)
    {
      return false;
    }
  }

  for(let owner of owners)
  {
    var ownerTicks = getTicksToComplete(creep, owner);
    if(_.isUndefined(ownerTicks)) continue;

    ticksToComplete += ownerTicks;
    if(ticksToComplete <= creep.ticksToLive)
    {
      memory.owners.push(owner);
    }
    else
    {
      return false;
    }
  }

  return true;
}

export function roombaTick(creep:Creep)
{
  var roomGlobals:RoomGlobalData = Globals.roomGlobals[creep.room.name];
  var memory:any = Memory.creeps[creep.name];

  // Initialize memory
  if(_.isUndefined(memory.state))
  {
    creep.say("💤" + RoombaState[RoombaState.Idle]);
    memory.state = RoombaState.Idle;
  }

  var owners:[EntityType, string][] = memory.owners;

  switch(memory.state)
  {
    case RoombaState.Transferring:
    {
      if(creep.carry.energy == 0)
      {
        creep.say("⚗️" + RoombaState[RoombaState.Calculating]);
        memory.state = RoombaState.Calculating;
        break;
      }

      for(let spawn of roomGlobals.Spawns)
      {
        if(spawn.energy == spawn.energyCapacity)
        {
          continue;
        }

        if(creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        {
          creep.moveTo(spawn, {visualizePathStyle: {stroke: '#ffffff'}});
        }

        return;
      }

       // If we get here, all spawns are at max energy capacity.
      if(creep.room.addResourceToDump(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
      {
        creep.moveTo(creep.room.resourceDumpPos, {visualizePathStyle: {stroke: '#ffffff'}});
      }

      break;
    }
    case RoombaState.Gathering:
    {
      if(creep.carry.energy == creep.carryCapacity)
      {
        creep.say("🙌" + RoombaState[RoombaState.Transferring]);
        creep.memory.state = RoombaState.Transferring;
        break;
      }

      var resourceId:string = memory.resourceId;
      if(_.isUndefined(resourceId))
      {
        creep.say("💤" + RoombaState[RoombaState.Idle]);
        memory.state = RoombaState.Idle;
        break;
      }

      var resource:Resource =  roomGlobals.Resources[resourceId];
      if(_.isUndefined(resource) || resource == null)
      {
        creep.say("💤" + RoombaState[RoombaState.Idle]);
        memory.state = RoombaState.Idle;
        break;
      }

      if(creep.pickup(resource) == ERR_NOT_IN_RANGE)
      {
        creep.moveTo(resource, {visualizePathStyle: {stroke: '#ffffff'}});
      }

      break;
    }
    case RoombaState.Idle:
    {
      if(owners.length > 0)
      {
        creep.say("⚗️" + RoombaState[RoombaState.Calculating]);
        memory.state = RoombaState.Calculating;
      }

      break;
    }
    case RoombaState.Calculating:
    {
      // Need to evaluate owners to remove the ones we will not be able to get to
      // and the dead ones
      evaluateOwners(creep, memory.owners);

      // Prioritize owners
      var priorityResource:Resource = null;
      owners.forEach(function(owner)
      {
        if(owner[0] != EntityType.Resource)
        {
          console.log("Roomba creep does not support owner entity type:", EntityType[owner[0]]);
          return;
        }

        var resource:Resource = roomGlobals.Resources[owner[1]];
        if(priorityResource == null || resource.amount > priorityResource.amount)
        {
          priorityResource = resource;
        }
      });

      if(priorityResource != null)
      {
        creep.say("🌾" + RoombaState[RoombaState.Gathering]);
        memory.state = RoombaState.Gathering;
        memory.resourceId = priorityResource.id;
      }
      else
      {
        // Unable to find a priority resource go back to idle
        creep.say("💤" + RoombaState[RoombaState.Idle]);
        memory.state = RoombaState.Idle;
      }

      break;
    }
  }
}

function evaluateOwners(creep:Creep, owners:[EntityType, string][])
{
  let ticksToComplete:number = 0;
  let invalidOwners:[EntityType, string][] = [];

  if(_.isUndefined(creep.ticksToLive)) return;

  for(let creepOwner of owners)
  {
    var ownerTicks = getTicksToComplete(creep, creepOwner);

    // The resource is undefined and has probably died out before
    // the rumba was spawned.
    if(_.isUndefined(ownerTicks))
    {
      invalidOwners.push(creepOwner);
      continue;
    }

    ticksToComplete += ownerTicks;
    if(ticksToComplete > creep.ticksToLive)
    {
      var resource:Resource = Globals.roomGlobals[creep.room.name].Resources[creepOwner[1]];
      console.log(creep.name, "is overburdened and is releasing owner:", resource.id);
      resource.releaseCreepLease(creep.id);

      // If this creep only has a single owner left, we will release the resource but keep it as
      // a owner of this creep. This allows the resource to request another creep (since this creep)
      // will not be able to transport all of the resources, but still work on transporting it until
      // we die. Otherwise the creep will just sit idle until it does
      if(owners.length - invalidOwners.length > 1)
      {
        invalidOwners.push(creepOwner);
      }
    }
  }
  //console.log(creep.name, ":", ticksToComplete, ":", creep.ticksToLive);
  deleteInvalidOwners(invalidOwners, owners);
}

function getTicksToComplete(creep:Creep, owner:[EntityType, string]):number
{
    // Assume that all owners are resources
    var resource:Resource = Globals.roomGlobals[creep.room.name].Resources[owner[1]];
    if(_.isUndefined(resource)) return undefined;

    var moveParts:number = 0;
    var carryParts:number = 0;
    var otherParts:number = 0;
    creep.bodyParts.forEach(function(bodyPart)
    {
      if(bodyPart == MOVE) moveParts += 1;
      else if(bodyPart == CARRY) carryParts += 1;
      else otherParts += 1;

    });
    // pathFatigue is the total fatigue cost of a one way trip for the creep to get from the
    // resource to the dump. Note: We use half cost for the carry parts since they
    // only cost fatigue when they are full.
    var pathFatigue:number = (resource.pathToDump.cost * otherParts) +
                             (Math.ceil(resource.pathToDump.cost / 2)) * carryParts;
    var moveReduction:number = (moveParts * 2)

    // We multiply the total pathFatigue by two to count for a path to the dump and back
    // to the resource. NOTE: In some cases we will be able to grab the entire resource in
    // one trip. This is just an estimate
    var ticksToTraverse:number = Math.ceil((pathFatigue * 2) / moveReduction);
    var totalTripsRequired:number = Math.ceil(resource.amount / (carryParts * 50));
    return ticksToTraverse * totalTripsRequired;
}

// Delete invalid owners from memory
function deleteInvalidOwners(invalidOwners:[EntityType, string][], owners:[EntityType, string][])
{
    invalidOwners.forEach(function(invalidOwner)
    {
      const removeIndex = owners.findIndex(owner => owner[0] == invalidOwner[0] && owner[1] == invalidOwner[1]);
      if(removeIndex > -1) owners.splice(removeIndex, 1);
    });
}

import { EntityType } from "Prototypes/EntityTypes"

export enum RoombaState
{
  Transferring, // The creep is moving to or tranferring energy into an energy dump
  Gathering,    // The creep is moving to and gathering resources in the map
  Idle,         // The creep is waiting for commands
  Calculating,  // The creep is calculating its next collection
}

export function roombaAddOwner(creep:Creep, owners:[EntityType, string][])
{
  var memory:any = Memory.creeps[creep.name];
  owners.forEach(function(owner)
  {
    memory.owners.push(owner);
  });
}

export function roombaTick(creep:Creep, spawns:Spawn[], resources:{[id:string]: Resource})
{
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

      if(creep.transfer(spawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
      {
        creep.moveTo(spawns[0], {visualizePathStyle: {stroke: '#ffffff'}});
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

      var resource:Resource = resources[resourceId];
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
      // Prioritize owners
      var invalidOwners:[EntityType, string][] = [];
      var priorityResource:Resource = null;
      owners.forEach(function(owner)
      {
        if(owner[0] != EntityType.Resource)
        {
          console.log("Roomba creep does not support owner entity type:", EntityType[owner[0]]);
          return;
        }

        var resource:Resource = resources[owner[1]];

        // If the resource is undefined, we need to remove the resource
        // as a owner of this creep
        if(_.isUndefined(resource) || resource == null)
        {
          invalidOwners.push(owner);
          return;
        }

        if(priorityResource == null || resource.amount > priorityResource.amount)
        {
          priorityResource = resource;
        }
      });

      // Delete invalid owners
      invalidOwners.forEach(function(invalidOwner)
      {
        const removeIndex = owners.findIndex(owner => owner[0] == invalidOwner[0] && owner[1] == invalidOwner[1]);
        if(removeIndex > -1) owners.splice(removeIndex, 1);
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

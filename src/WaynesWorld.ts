import { OverseerVenture } from "Managers/OverseerVenture";
import { BloomingBetty } from "Managers/BloomingBetty";
import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"
import { Globals, RoomGlobalData } from "Globals";

// Prototypes
import { sourcePrototype } from "Prototypes/Source";
import { creepPrototype } from "Prototypes/Creep";
import { spawnPrototype } from "Prototypes/Spawns";
import { roomPrototype } from "Prototypes/Room";
import { resourcePrototype } from "Prototypes/Resource";
import { controllerPrototype } from "Prototypes/Controller";

export namespace WaynesWorld
{
  var bloomingBetty:BloomingBetty = new BloomingBetty();
  var overseerVenture:OverseerVenture = new OverseerVenture();

  sourcePrototype();
  creepPrototype();
  spawnPrototype();
  roomPrototype();
  resourcePrototype();
  controllerPrototype();

  // Screeps gameplay loop entry point
  export function WaynesPowerMinute()
  {
    GetOwnedRooms().forEach(function(room)
    {
      if(_.isUndefined(Globals.roomGlobals[room.name]))
      {
        console.log("Initializing heap for room", room.name, ".");
        Globals.roomGlobals[room.name] = new RoomGlobalData();

        CreepSpawnQueue.Initialize(room);
      }

      var roomHeapData:RoomGlobalData = Globals.roomGlobals[room.name];
      roomHeapData.Sources = room.find(FIND_SOURCES)
      roomHeapData.Spawns = room.find(FIND_MY_SPAWNS);
      roomHeapData.ConstructionSites = room.find(FIND_CONSTRUCTION_SITES);
      roomHeapData.Structures = room.find(FIND_STRUCTURES);
      roomHeapData.Resources = getResourceDict(room);

      var creeps:Creep[] = room.find(FIND_MY_CREEPS);
      creeps.forEach(function(creep) { roomHeapData.Creeps[creep.name] = creep; });

      // Update Managers
      bloomingBetty.somehowIManage(room);
      overseerVenture.somehowIManage(room);
    });
  }

  // Get a list of all rooms that have a spawn that we control
  function GetOwnedRooms() {

    let ownedRooms = new Set<Room>();
    for(let key in Game.spawns)
    {
        var spawn:StructureSpawn =  Game.spawns[key];
        ownedRooms.add(spawn.room);
    }

    return ownedRooms;
  }

  function getResourceDict(room:Room): {[id:string]: Resource}
  {
    var resources:Resource[] = room.find(FIND_DROPPED_RESOURCES);

    var updateResources:{[id:string]: Resource} = {};
    resources.forEach(function(resource) { updateResources[resource.id] = resource; });

    // Handle resources in memory
    if(!_.isUndefined(Memory.resources))
    {
      for(let resourceId in Memory.resources)
      {
        var knownResource:Resource = updateResources[resourceId];

        // If the resource is in memory but not on the map, it has 'died' and we need to update memory
        if(_.isUndefined(knownResource))
        {
          var resourceMem = Memory.resources[resourceId]

          if(!_.isUndefined(resourceMem.isResourceDump) &&
             resourceMem.isResourceDump == true)
          {
            // Set the room resource dump as undefined
            room.resourceDump = undefined;
          }

          console.log("Resource death " + resourceId + ".");
          delete Memory.resources[resourceId];
          delete updateResources[resourceId];
        }
      }
    }

    return updateResources;
  }
}

import { OverseerVenture } from "Managers/OverseerVenture";
import { BloomingBetty } from "Managers/BloomingBetty";
import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"
import { Globals, RoomGlobalData } from "Globals";

// Prototypes
import { sourcePrototype } from "Prototypes/Source";
import { creepPrototype } from "Prototypes/Creep";

export namespace WaynesWorld
{
  var bloomingBetty:BloomingBetty = new BloomingBetty();
  var overseerVenture:OverseerVenture = new OverseerVenture();

  sourcePrototype();
  creepPrototype();

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

      //var constructionSites:ConstructionSite[] = room.find(FIND_CONSTRUCTION_SITES);
      var sources:Source[] = room.find(FIND_SOURCES)
      var spawns:Spawn[] = room.find(FIND_MY_SPAWNS);
      //var structures:Structure[] = room.find(FIND_STRUCTURES);

      // Update Managers
      bloomingBetty.somehowIManage(room, spawns);// sources, spawns, structures);
      overseerVenture.somehowIManage(room, sources);
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
}

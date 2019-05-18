//import { OverseerRon } from "Managers/OverseerRon";
import { BloomingBetty } from "Managers/BloomingBetty";
import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"
import { Globals, RoomGlobalData } from "Globals";

// Prototypes
import { sourcePrototype } from "Prototypes/Source";

export namespace WaynesWorld
{
    //ar overseerRon:OverseerRon = new OverseerRon();
  var bloomingBetty:BloomingBetty = new BloomingBetty();

  sourcePrototype();

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
      bloomingBetty.somehowIManage(room, spawns, sources);// sources, spawns, structures);
      //overseerRon.somehowIManage(room, sources);

      // Update Entities
      for (let source of sources)
      {
        source.tick(room);
      }
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

//import { OverseerRon } from "Managers/OverseerRon";
import { BloomingBetty } from "Managers/BloomingBetty";
import { SourceMgr } from "Managers/SourceMgr";
import { CreepSpawnQueue } from "Managers/CreepSpawnQueue"
import { Globals } from "Globals";


export namespace WaynesWorld
{
    //ar overseerRon:OverseerRon = new OverseerRon();
  var bloomingBetty:BloomingBetty = new BloomingBetty();
  var sourceManager:SourceMgr = new SourceMgr();

  // Screeps gameplay loop entry point
  export function WaynesPowerMinute()
  {
    GetOwnedRooms().forEach(function(room)
    {
      if(_.isUndefined(Globals.isInitialzed))
      {
        console.log("Initializing Managers.");
        CreepSpawnQueue.Initialize(room);
      }

      //var constructionSites:ConstructionSite[] = room.find(FIND_CONSTRUCTION_SITES);
      var sources:Source[] = room.find(FIND_SOURCES)
      var spawns:Spawn[] = room.find(FIND_MY_SPAWNS);
      //var structures:Structure[] = room.find(FIND_STRUCTURES);

      // Update Managers
      bloomingBetty.somehowIManage(room, spawns);// sources, spawns, structures);

      // Update Entities
      sourceManager.somehowIManage(room, sources);

      //overseerRon.somehowIManage(room, sources);
    });


    Globals.isInitialzed = true;
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

import { BloomingBetty } from "Managers/BloomingBetty";

export namespace WaynesWorld {

  var bloomingBetty:BloomingBetty = new BloomingBetty();

  // Screeps gameplay loop entry point
  export function WaynesPowerMinute() {

    GetOwnedRooms().forEach(function(room) {

        //var constructionSites:ConstructionSite[] = room.find(FIND_CONSTRUCTION_SITES);
        //var sources:Source[] = room.find(FIND_SOURCES)
        //var structures:Structure[] = room.find(FIND_STRUCTURES);
        //var spawns:Spawn[] = room.find(FIND_MY_SPAWNS);

        bloomingBetty.somehowIManage(room);// sources, spawns, structures);
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

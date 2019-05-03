export const loop = function() {


    var room:Room = Game.rooms['W35S7'];
    var constructionSites:ConstructionSite[] = room.find(FIND_CONSTRUCTION_SITES);
    var sources:Source[] = room.find(FIND_SOURCES)
    var structures:Structure[] = room.find(FIND_STRUCTURES);
    var spawns:Spawn[] = room.find(FIND_MY_SPAWNS);

    console.log("constructionSites", constructionSites);
    console.log("sources", sources);
    console.log("structures", structures);
    console.log("spawns", spawns);
};

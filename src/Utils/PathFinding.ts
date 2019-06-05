import { Globals, RoomGlobalData } from "Globals";

// Find a path from the fromPos to the toPos that includes plains, swamps, and road costs
// that is equlivant to creep move fatigue. This also takes i n consideration owned
// structures
export function FindPath(fromPos:RoomPosition, toPos:RoomPosition): PathFinderPath
{
  return PathFinder.search(fromPos, toPos,
    {
      plainCost: 2,
      swampCost: 10,
      roomCallback: function(roomName)
      {
        var roomData:RoomGlobalData = Globals.roomGlobals[roomName];
        if(_.isUndefined(roomData)) return false;

        let costMatrix = new PathFinder.CostMatrix;

        let structures:Structure[] = roomData.Structures;
        structures.forEach(function(structure)
        {
          // Set roads as a lower code than the plains
          if(structure.structureType == STRUCTURE_ROAD)
          {
            costMatrix.set(structure.pos.x, structure.pos.y, 1);
          }
          // Every other structure we need to set as unwalkable except containers
          // and ramparts
          else if(structure.structureType != STRUCTURE_CONTAINER &&
                  structure.structureType != STRUCTURE_RAMPART)
          {
            costMatrix.set(structure.pos.x, structure.pos.y, 0xff);
          }
        });

        return costMatrix;
      },
    });
}

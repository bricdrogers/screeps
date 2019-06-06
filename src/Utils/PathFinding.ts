import { Globals, RoomGlobalData } from "Globals";

export function GetLifetimeEnergy(pathCost:number, energyPerAction:number, bodyParts:string[]):number
{
  var moveParts:number = 0;
  var carryParts:number = 0;
  var workParts:number = 0;
  var otherParts:number = 0;
  bodyParts.forEach(function(bodyPart)
  {
    if(bodyPart == MOVE) moveParts += 1;
    else if(bodyPart == CARRY) carryParts += 1;
    else if(bodyPart == WORK) workParts += 1;
    else otherParts += 1;
  });

  // pathFatigue is the total fatigue cost of a one way trip for the creep to get from the
  // controller to the dump. Note: We use half cost for the carry parts since they
  // only cost fatigue when they are full.
  var pathFatigue:number = (pathCost * (otherParts + workParts)) +
                           (pathCost / 2) * carryParts;

  var moveReduction:number = (moveParts * 2)
  var carryCapacity:number = carryParts * 50;

  // We multiply the total pathFatigue by two to count for a path to the dump and back
  var ticksToTraverse:number = (pathFatigue * 2) / moveReduction;

  // Now we need to figure out how many ticks it will take the creep to use all of the energy.
  var ticksForAction:number = carryCapacity / (energyPerAction * workParts);
  var tripsPerLifespan:number = 1500 / (ticksToTraverse + ticksForAction);

  return tripsPerLifespan * carryCapacity;
}

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

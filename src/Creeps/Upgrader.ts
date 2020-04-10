import { EntityType } from "Prototypes/EntityTypes"

export enum UpgraderState
{
  Gathering,    // The creep is moving to and gathering energy for upgrading
  Upgrading,    // The creep moving into position to upgrade the controller
  Idle,         // The creep is waiting for commands
  Calculating,  // The creep performing required but higher cost calculations and will not perform actions this tick
}

export function upgraderTick(creep:Creep)
{
  var memory:any = Memory.creeps[creep.name];
  var owners:[EntityType, string][] = memory.owners;

  if(memory.hasMultipleOwners)
  {
    console.log("Upgraders currently do not support multiple owners. Skipping update.");
    return;
  }

  // Initialize memory
  if(_.isUndefined(memory.state))
  {
    creep.say("💤");
    memory.state = UpgraderState.Idle;
  }

  var owner:[EntityType, string] = memory.owners[0];
  if(owner[0] != EntityType.Controller)
  {
    console.log("Upgraders only support controller owners.");
    return;
  }

  switch(memory.state)
  {
    case UpgraderState.Idle:
    {
      if(owners.length > 0)
      {
        creep.say("⚗️");
        memory.state = UpgraderState.Calculating;
      }
      break;
    }
    case UpgraderState.Calculating:
    {
      if(owners.length < 1)
      {
        creep.say("💤");
        memory.state = UpgraderState.Idle;
      }

      var owner:[EntityType, string] = owners[0];
      if(owner[0] != EntityType.Controller)
      {
         console.log("Upgrader", creep.name, "does not support owner type of", EntityType[owner[0]]);
         break;
      }

      var energyPerTick:number = getRequiredEnergyPerTick(creep);
      if(_.isUndefined(energyPerTick))
      {
        console.log("ERROR: Failed to calculate energy per tick for", creep.name);
        break;
      }

      // Store the energyPerTick in memory for later reference without recalc
      creep.energyPerTick = energyPerTick;

      // Report our energy consumption to the regulation office
      creep.room.addResourceCreep(creep);

      creep.say("🌾");
      memory.state = UpgraderState.Gathering;

      break;
    }
    case UpgraderState.Gathering:
    {
      if(creep.carry.energy == creep.carryCapacity)
      {
        creep.say("🏷️");
        creep.memory.state = UpgraderState.Upgrading;
        break;
      }

      // Load up from the resource dump
      if(creep.room.getResourceFromDump(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
      {
        creep.moveTo(creep.room.resourceDumpPos);
      }

      break;
    }
    case UpgraderState.Upgrading:
    {
      if(creep.carry.energy == 0)
      {
        creep.say("🌾");
        creep.memory.state = UpgraderState.Gathering;
        break;
      }

      if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE)
      {
          creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
      }

      break;
    }
  }
}

function getRequiredEnergyPerTick(creep:Creep):number
{
    var controller:StructureController = creep.room.controller;
    if(_.isUndefined(controller)) return undefined;

    var moveParts:number = 0;
    var carryParts:number = 0;
    var workParts:number = 0;
    var otherParts:number = 0;
    creep.bodyParts.forEach(function(bodyPart)
    {
      if(bodyPart == MOVE) moveParts += 1;
      else if(bodyPart == CARRY) carryParts += 1;
      else if(bodyPart == WORK) workParts += 1;
      else otherParts += 1;

    });

    // pathFatigue is the total fatigue cost of a one way trip for the creep to get from the
    // controller to the dump. Note: We use half cost for the carry parts since they
    // only cost fatigue when they are full.
    var pathFatigue:number = (controller.pathToDump.cost * (otherParts + workParts)) +
                             (controller.pathToDump.cost / 2) * carryParts;
    var moveReduction:number = (moveParts * 2)

    // We multiply the total pathFatigue by two to count for a path to the dump and back
    var ticksToTraverse:number = (pathFatigue * 2) / moveReduction;

    // Now we need to figure out how many ticks it will take the creep to use all of the energy.
    // A creep will upgrade a controller 1 energy per WORK per tick
    var ticksToUpgrade:number = creep.carryCapacity / (1 * workParts);

    // Now we know the total amount of ticket this upgrader will take to pull resource from the dump,
    // travel to the controller, upgrade the controller, then move back to the dump. Based on this we can
    // calculate how much energy per tick this creep will consume from the dump
    var energyPerTickRequired = creep.carryCapacity / (ticksToTraverse + ticksToUpgrade);
    return energyPerTickRequired;
}

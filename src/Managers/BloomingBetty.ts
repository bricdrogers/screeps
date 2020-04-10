import { CreepRequest, RequestStatus } from "CreepRequest";
import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"
import { PriorityQueue } from "Utils/PriorityQueue"
import { Globals } from "Globals";

export class BloomingBetty {
  private readonly _updateTickRate: number = 1;

  somehowIManage(room: Room) {
    if (!this.checkCanUpdate(room)) return;

    // Every thousand ticks, garbage collect the queue
    if (Game.time % 1000 == 0) CreepSpawnQueue.GarbageCollect(room);

    var queue: PriorityQueue<CreepRequest> = CreepSpawnQueue.GetPriorityQueue(room);
    if (queue.length > 0) {
      var request: CreepRequest = queue.peek();

      // Check to see if the request has been invalidated
      if (!request.isValid) {
        queue.dequeue();
        request.completeTime = Game.time;
        return;
      }

      if (request.Status == RequestStatus.Queued) {
        request.Status = RequestStatus.Processing;

        request.actualBodyParts = this.getAvailableBodyParts(room, request);
        if (request.actualBodyParts == null) {
          console.log("Betty: Cannot fulfill creep request; room capacity not available.");
          queue.dequeue();

          request.completeTime = Game.time;
          request.Status = RequestStatus.Failed;
          return;
        }
      }

      var spawn: StructureSpawn = Globals.roomGlobals[room.name].Spawns[0]; // TODO: multiple spawns per room?
      if (spawn.spawnCreep(request.actualBodyParts, request.creepName, { dryRun: true }) == OK) {
        let creepMemory =
        {
          role: request.Role,
          owners: request.Owners,
          bodyParts: request.actualBodyParts,
          hasMultipleOwners: (request.Owners.length > 1),
          energyPerTick: 0,
          state: 0,
        }

        spawn.spawnCreep(request.actualBodyParts, request.creepName, { memory: creepMemory });
        queue.dequeue();

        request.Status = RequestStatus.Complete;
        request.completeTime = Game.time;
      }
    }
  }

  private getAvailableBodyParts(room: Room, request: CreepRequest) {
    var currentEnergyValue: number = 0;
    var bodyParts: BodyPartConstant[] = [];
    for (let bodyPart of request.RequiredBodyParts) {
      currentEnergyValue += BODYPART_COST[bodyPart];
      bodyParts.push(bodyPart);
    }

    if (currentEnergyValue > room.energyCapacityAvailable) return null;

    // Add as many extra optional body parts as we can
    for (let bodyPart of request.OptionalBodyParts) {
      currentEnergyValue = currentEnergyValue + BODYPART_COST[bodyPart];
      if (currentEnergyValue <= room.energyCapacityAvailable) {
        bodyParts.push(bodyPart);
      }
      else break;
    }

    return bodyParts;
  }

  private checkCanUpdate(room: Room) {
    if (room.memory.betty_ticksSinceLastUpdate >= this._updateTickRate) {
      room.memory.betty_ticksSinceLastUpdate = 0;
      return true;
    }
    else {
      ++room.memory.betty_ticksSinceLastUpdate;
      return false;
    }
  }
}

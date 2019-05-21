import { CreepRequest, RequestStatus } from "CreepRequest";
import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"
import { PriorityQueue } from "Utils/PriorityQueue"

export class BloomingBetty
{
  private readonly _updateTickRate:number = 1;

  somehowIManage(room:Room, spawns:Spawn[])
  {
    if(!this.checkCanUpdate(room)) return;

    var queue:PriorityQueue<CreepRequest> = CreepSpawnQueue.GetPriorityQueue(room);
    if(queue.length > 0)
    {
      var request:CreepRequest = queue.peek();
      // TODO: CHECK IDLE CREEPS

      if(request.Status == RequestStatus.Queued)
      {
        request.Status = RequestStatus.Processing;

        request.actualBodyParts = this.getAvailableBodyParts(room, request);
        if(request.actualBodyParts == null)
        {
          console.log("Betty: Cannot fulfill creep request; room capacity not available.");
          queue.dequeue();

          request.Status = RequestStatus.Failed;
        }
      }

      var spawn:Spawn = spawns[0]; // TODO: multiple spawns per room?
      if(spawn.spawnCreep(request.actualBodyParts, request.creepName, { dryRun: true }) == OK)
      {
        let creepMemory =
        {
          role: request.Role,
          owner: request.Owner,
          bodyParts: request.actualBodyParts,
        }

        spawn.spawnCreep(request.actualBodyParts, request.creepName, { memory: creepMemory });
        queue.dequeue();

        request.Status = RequestStatus.Complete;
      }
    }
  }

  private getAvailableBodyParts(room:Room, request:CreepRequest)
  {
    var currentEnergyValue:number = 0;
    var bodyParts:string[] = [];
    for(let bodyPart of request.RequiredBodyParts)
    {
      currentEnergyValue += BODYPART_COST[bodyPart];
      bodyParts.push(bodyPart);
    }

    if(currentEnergyValue > room.energyCapacityAvailable) return null;

    // Add as many extra optional body parts as we can
    for(let bodyPart of request.OptionalBodyParts)
    {
      currentEnergyValue = currentEnergyValue + BODYPART_COST[bodyPart];
      if(currentEnergyValue <= room.energyCapacityAvailable)
      {
        bodyParts.push(bodyPart);
      }
      else break;
    }

    return bodyParts;
  }


  private checkCanUpdate(room:Room)
  {
    if(room.memory.betty_ticksSinceLastUpdate >= this._updateTickRate)
     {
       room.memory.betty_ticksSinceLastUpdate = 0;
       return true;
     }
     else
     {
       ++room.memory.betty_ticksSinceLastUpdate;
       return false;
     }
  }
}

import { CreepRequest, RequestStatus } from "CreepRequest";
import { PriorityQueue } from "Utils/PriorityQueue"


export class BloomingBetty
{
  private static readonly _queue = new PriorityQueue<CreepRequest>({ comparator: function(a, b) { return b.Priority - a.Priority; }});
  public static AddCreepRequest(request:CreepRequest)
  {
      console.log("New Creep Request: ", request.Role);
      BloomingBetty._queue.queue(request);
      request.Status = RequestStatus.Queued;
  }

  private readonly _updateTickRate:number = 1;

  somehowIManage(room:Room, spawns:Spawn[]) //, sources:Source[], structures:Structure[]) {
  {
    if(!this.checkCanUpdate(room)) return;

    if(BloomingBetty._queue.length > 0)
    {
      var request:CreepRequest = BloomingBetty._queue.peek();
      // TODO: CHECK IDLE CREEPS

      if(request.Status == RequestStatus.Queued)
      {
        request.Status = RequestStatus.Processing;

        request.actualBodyParts = this.getAvailableBodyParts(room, request);
        if(request.actualBodyParts == null)
        {
          console.log("Betty: Cannot fulfill creep request; room capacity not available.");
          BloomingBetty._queue.dequeue();
          request.Status = RequestStatus.Failed;
        }
      }

      var spawn:Spawn = spawns[0]; // TODO: multiple spawns per room?
      var name:string = "harvester-" + Game.time;
      if(spawn.spawnCreep(request.actualBodyParts, name, { dryRun: true }) == OK)
      {
        spawn.spawnCreep(request.actualBodyParts, name, { memory: request.Role });
        BloomingBetty._queue.dequeue();

        request.creepName = name;
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

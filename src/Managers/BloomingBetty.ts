import { CreepRequest, RequestStatus } from "CreepRequest";
import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"
import { PriorityQueue } from "Utils/PriorityQueue"
import { EntityType } from "Prototypes/EntityTypes"

export class BloomingBetty
{
  private readonly _updateTickRate:number = 1;


  somehowIManage(room:Room, spawns:Spawn[], sources:Source[])// structures:Structure[]) {
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
      var name:string = request.Role + Game.time;
      if(spawn.spawnCreep(request.actualBodyParts, name, { dryRun: true }) == OK)
      {
        let creepMemory =
        {
          Role: request.Role,
          Owner: request.Owner,
          BodyParts: request.actualBodyParts,
        }

        spawn.spawnCreep(request.actualBodyParts, name, { memory: creepMemory });
        queue.dequeue();

        request.creepName = name;
        request.Status = RequestStatus.Complete;
      }
    }

    for (let name in Memory.creeps)
    {
      if(!Game.creeps[name])
      {
        var owner:[EntityType, string] = Memory.creeps[name].Owner;
        console.log("Creep death", name + ".", "Releasing lease from", EntityType[owner[0]] + ":", owner[1].toString());
        switch(owner[0])
        {
          case EntityType.Source:
          {
            var source:Source = sources.find(function(source) { return source.id == owner[1]; });
            source.releaseCreepLease(name);
            break;
          }
          default:
          {
            console.log("Unknown entity type. cannot release creep lease.");
          }
        }

        delete Memory.creeps[name];
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

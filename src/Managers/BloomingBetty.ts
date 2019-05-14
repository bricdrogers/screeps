import { CreepRequest, RequestStatus } from "CreepRequest";
import { PriorityQueue } from "Utils/PriorityQueue"

export class BloomingBetty
{
  // a dictionary of roomname and a tuple which contains the creep request map lookup and the priority queue
  private static readonly _queueLookup:{ [roomName:string]: [{[id: string]: CreepRequest;}, PriorityQueue<CreepRequest>] } = { };

  public static AddCreepRequest(room:Room, request:CreepRequest)
  {
    console.log("New Creep Request: ", request.Role);

    var queueData = BloomingBetty._queueLookup[room.name];
    queueData[0][request.Id] = request;
    queueData[1].queue(request);
    request.Status = RequestStatus.Queued;
  }

  public static FindCreepRequest(room:Room, id:string)
  {
    var queueData = BloomingBetty._queueLookup[room.name];
    return queueData[0][id];
  }

  public static RemoveCreepRequest(room:Room, id:string)
  {
    var queueData = BloomingBetty._queueLookup[room.name];
    delete queueData[0][id];
  }

  private readonly _updateTickRate:number = 1;

  initialize(room:Room)
  {
    console.log("initiaze)");
    var queueLookup: [{[id: string]: CreepRequest;}, PriorityQueue<CreepRequest>] = [{}, new PriorityQueue<CreepRequest>({ comparator: function(a, b) { return b.Priority - a.Priority; }})];
    BloomingBetty._queueLookup[room.name] = queueLookup;
  }

  somehowIManage(room:Room, spawns:Spawn[]) //, sources:Source[], structures:Structure[]) {
  {
    if(!this.checkCanUpdate(room)) return;

    var queueData = BloomingBetty._queueLookup[room.name];
    var queue = queueData[1];

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
      var name:string = "harvester-" + Game.time;
      if(spawn.spawnCreep(request.actualBodyParts, name, { dryRun: true }) == OK)
      {
        spawn.spawnCreep(request.actualBodyParts, name, { memory: request.Role });
        queue.dequeue();

        request.creepName = name;
        request.Status = RequestStatus.Complete;
        console.log("Betty spawning ", name, " from request: ", request.Role);
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

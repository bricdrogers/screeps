import { CreepRequest, RequestStatus } from "CreepRequest";
import { PriorityQueue } from "Utils/PriorityQueue"
import { EntityType } from "Prototypes/EntityTypes"

export class CreepSpawnQueue
{
  // a dictionary of roomname and a tuple which contains the creep request map lookup and the priority queue
  private static readonly _queueLookup:{ [roomName:string]: [{[id: string]: CreepRequest;}, PriorityQueue<CreepRequest>] } = { };

  public static AddCreepRequest(room:Room, request:CreepRequest)
  {
    console.log(EntityType[request.Owner[0]] + ":", request.Owner[1].toString(), "requesting a creep.");

    var queueData = CreepSpawnQueue._queueLookup[room.name];
    queueData[0][request.Id] = request;
    queueData[1].queue(request);
    request.Status = RequestStatus.Queued;
  }

  public static FindCreepRequest(room:Room, id:string)
  {
    var queueData = CreepSpawnQueue._queueLookup[room.name];
    return queueData[0][id];
  }

  public static RemoveCreepRequest(room:Room, id:string)
  {
    var queueData = CreepSpawnQueue._queueLookup[room.name];
    delete queueData[0][id];
  }

  public static GetPriorityQueue(room:Room)
  {
    return CreepSpawnQueue._queueLookup[room.name][1];
  }

  public static Initialize(room:Room)
  {
    var queueLookup: [{[id: string]: CreepRequest;}, PriorityQueue<CreepRequest>] = [{}, new PriorityQueue<CreepRequest>({ comparator: function(a, b) { return b.Priority - a.Priority; }})];
    CreepSpawnQueue._queueLookup[room.name] = queueLookup;
  }
}

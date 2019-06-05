import { CreepRequest, RequestStatus, RequestPriority } from "CreepRequest";
import { PriorityQueue } from "Utils/PriorityQueue"
import { EntityType } from "Prototypes/EntityTypes"

export class CreepSpawnQueue
{
  // a dictionary of roomname and a tuple which contains the creep request map lookup and the priority queue
  private static readonly _queueLookup:{ [roomName:string]: [{[id: string]: CreepRequest;}, PriorityQueue<CreepRequest>] } = { };

  // requiredBodyParts - Body parts required to handle this request
  // optionalBodyParts - Body parts that can be added if the additional resources are available
  // priority - Spawn priority
  // role - Creep role
  // owner - Entity owner information
  // noCreate - Will only add this requiest to the creep duties or reassign idle creeps.
  // room - The room the request is made from
  public static CreateSharedRequest(requiredBodyParts:string[],
                                    optionalBodyParts:string[],
                                    priority:RequestPriority,
                                    role:string,
                                    owner:[EntityType, string],
                                    noCreate:boolean,
                                    room:Room): string
  {
    var request:CreepRequest = new CreepRequest(requiredBodyParts, optionalBodyParts, priority, role, owner);

    // First, check to see if a creep exists that can handle the request
    var creeps:Creep[] = room.find(FIND_MY_CREEPS);
    for(let creep of creeps)
    {
      if(creep.role == role)
      {
        if(creep.canFulfillRequest(request))
        {
          console.log("Adding owner(s) to creep", creep.name, "from", EntityType[owner[0]]);
          request.Status = RequestStatus.Complete;
          request.creepName = creep.name;
          request.actualBodyParts = creep.bodyParts;

          // Add the request to the lookup so the requester can
          // respond to it on the next tick
          var queueData = CreepSpawnQueue._queueLookup[room.name];
          queueData[0][request.Id] = request;

          return request.Id;
        }
      }
    }

    // Check the current list of requests, if a request exists
    // that fits a few criteria, we will add the duties to the request
    // If the creep cannot furfill the request when it has spawned, the
    // request will then fail
    for(let requestId in this._queueLookup[room.name][0])
    {
      var queuedRequest:CreepRequest = this._queueLookup[room.name][0][requestId];

      // Make sure the request is not already complete
      if(queuedRequest.Status == RequestStatus.Complete ||
        queuedRequest.Status == RequestStatus.Failed) continue;

      if(queuedRequest.Role == role &&
         queuedRequest.Priority == priority)
      {
        // Ensure the queued request has the required parts to furfill the new request
        // We create a dictionary that is the part count of required parts. If the request
        // contains at least the same amount of parts, we can say that the queued request
        // can handle this request.
        var partCount:{[part:string]: number} = {};
        requiredBodyParts.forEach(function(requiredPart)
        {
          var part:number = partCount[requiredPart];
          if(_.isUndefined(part))
          {
            part = 1;
            return;
          }

          partCount[requiredPart] += 1;
        });

        queuedRequest.RequiredBodyParts.forEach(function(part)
        {
          var count:number = partCount[part];
          if(_.isUndefined(count)) return;

          count -= 1;

          if(count <= 0) delete partCount[part];
          else partCount[part] = count;
        });

        // Make sure all of the parts have counterparts in the queued request
        if(Object.keys(partCount).length == 0)
        {
          var owner:[EntityType, string] = request.Owners[0];
          console.log((EntityType[owner[0]] + ":" + owner[1]), "adding as additional owner to request", queuedRequest.Id);
          queuedRequest.Owners.push(owner);
          return queuedRequest.Id;
        }
      }
    }

    // Check the no create flag
    if(noCreate)
    {
      request.Status = RequestStatus.Failed;
      request.creepName = undefined;

      // Add the request to the lookup so the requester can
      // respond to it on the next tick
      var queueData = CreepSpawnQueue._queueLookup[room.name];
      queueData[0][request.Id] = request;

      return request.Id;
    }

    // Add the request to the spawn queue
    this.AddCreepRequest(room, request);
    return request.Id;
  }

  public static AddCreepRequest(room:Room, request:CreepRequest)
  {
    var message:string = "";
    for(var _i = 0; _i < request.Owners.length; _i++)
    {
      var owner:[EntityType, string] = request.Owners[_i];
      message += (EntityType[owner[0]] + ":" + owner[1]);

      if(request.Owners.length > 1 && _i <= request.Owners.length - 1)
      {
        message += "/n";
      }
    }
    console.log(message, "requesting a creep.", "Priority:", RequestPriority[request.Priority]);

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

  public static RemoveCreepRequest(room:Room, id:string, removeOwner:[EntityType, string])
  {
    var queueData = CreepSpawnQueue._queueLookup[room.name];
    var request:CreepRequest = queueData[0][id];

    // If the request only has one owner, we can delete it
    if(request.Owners.length <= 1)
    {
      delete queueData[0][id];
    }
    // If the request has multiple owners, we need to remove this owner from the list
    else
    {
      const removeIndex = request.Owners.findIndex(owner => owner[0] == removeOwner[0] && owner[1] == removeOwner[1]);
      if(removeIndex > -1) request.Owners.splice(removeIndex, 1);
    }
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

  public static GarbageCollect(room:Room)
  {
    console.log("CreepSpawnQueue: GarbageCollect");
    // Check the creep spawn queue for stale requests
    var requestMap:{[id: string]: CreepRequest;} = CreepSpawnQueue._queueLookup[room.name][0];
    var staleRequests:string[] = [];
    for(let key in requestMap)
    {
      var request:CreepRequest = requestMap[key];
      if((Game.time - request.completeTime) > 1000)
      {
        staleRequests.push(key);
      }
    }

    staleRequests.forEach(function(key)
    {
      console.log("Removing stale request", key, "from spawn queue lookup.");
      delete requestMap[key];
    });
  }
}

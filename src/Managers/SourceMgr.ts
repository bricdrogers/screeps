import { SourceInfoData } from "SourceInfoData";
import { CreepRequest, RequestStatus, RequestPriority } from "CreepRequest";
import { BloomingBetty } from "Managers/BloomingBetty";
import { CreepSpawnQueue } from "Utils/CreepSpawnQueue"

export class SourceMgr
{
  private readonly _updateTickRate:number = 5;
  private readonly _maxWorkParts:number = 5;

  somehowIManage(room:Room, sources:Source[])
  {
    if(!this.checkCanUpdate(room)) return;

    for (let source of sources)
    {
        var sourceInfo:SourceInfoData = this.getSourceInfo(room, source);

        // If the source has a requestId, we need to wait for it to be complete.
        if(sourceInfo.RequestId != null)
        {
          var request:CreepRequest = CreepSpawnQueue.FindCreepRequest(room, sourceInfo.RequestId);

          // If the request is undefined, our heap memory has been reset and was reinitialzed.
          // This source will have to put in a new request.
          if(_.isUndefined(request))
          {
            sourceInfo.RequestId = null;
            continue;
          }

          console.log("Request status:", request.Status, request.Role);
          if(request.Status == RequestStatus.Complete)
          {
            console.log(request.actualBodyParts);
            for(let bodyPart of request.actualBodyParts)
            {
              if(bodyPart == WORK)
              {
                ++sourceInfo.WorkParts;
              }
            }

            sourceInfo.Harvesters.push(request.creepName);
            CreepSpawnQueue.RemoveCreepRequest(room, sourceInfo.RequestId);
            sourceInfo.RequestId = null;
          }
          else if(request.Status == RequestStatus.Failed)
          {
            CreepSpawnQueue.RemoveCreepRequest(room, sourceInfo.RequestId);
            sourceInfo.RequestId = null;
          }

          continue;
        }

        if(sourceInfo.WorkParts < this._maxWorkParts)
        {
          console.log("SrcMgr: Adding Creep REquest");
          var request:CreepRequest = new CreepRequest([WORK, MOVE],
                                                      [WORK, WORK, WORK, WORK, CARRY],
                                                      RequestPriority.Routine,
                                                      "harvester" + Game.time);
          CreepSpawnQueue.AddCreepRequest(room, request);
          sourceInfo.RequestId = request.Id;
        }

        // TODO: How to remove dead harvesters?
    }
  }

  private getSourceInfo(room:Room, source:Source)
  {
    if(room.memory.sourceInfo == null)
    {
      var sourceInfoDict: { [id: string]: SourceInfoData; } = { };
      room.memory.sourceInfo = sourceInfoDict;
    }

     var sourceInfo:SourceInfoData = room.memory.sourceInfo[source.id];
     if(sourceInfo == null)
     {
         sourceInfo = new SourceInfoData();
         sourceInfo.WorkParts = 0;
         sourceInfo.Harvesters = [];
         room.memory.sourceInfo[source.id] = sourceInfo;
     }

     return sourceInfo;
  }

  private checkCanUpdate(room:Room)
  {
    if(room.memory.srcMgr_ticksSinceLastUpdate >= this._updateTickRate)
     {
       room.memory.srcMgr_ticksSinceLastUpdate = 0;
       return true;
     }
     else
     {
       ++room.memory.srcMgr_ticksSinceLastUpdate;
       return false;
     }
  }
}

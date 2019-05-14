import { SourceInfoData } from "SourceInfoData";
import { CreepRequest, RequestStatus } from "CreepRequest";
import { RequestPriority } from "CreepRequest";
import { BloomingBetty } from "Managers/BloomingBetty";

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

        console.log("request id", sourceInfo.RequestId,  sourceInfo.RequestId != null);
        if(sourceInfo.RequestId != null)
        {
          var request:CreepRequest = BloomingBetty.FindCreepRequest(room, sourceInfo.RequestId);

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
            BloomingBetty.RemoveCreepRequest(room, sourceInfo.RequestId);
            sourceInfo.RequestId = null;
          }
          else if(request.Status == RequestStatus.Failed)
          {
            BloomingBetty.RemoveCreepRequest(room, sourceInfo.RequestId);
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
          BloomingBetty.AddCreepRequest(room, request);
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

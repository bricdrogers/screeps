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

        if(sourceInfo.Request != null)
        {
          console.log("Getting herE?", sourceInfo.Request.Status);
            if(sourceInfo.Request.Status == RequestStatus.Complete)
            {
              console.log(sourceInfo.Request.actualBodyParts);
              for(let bodyPart of sourceInfo.Request.actualBodyParts)
              {
                console.log(bodyPart);
                if(bodyPart == MOVE)
                {
                  console.log("Adding Move");
                  ++sourceInfo.WorkParts;
                }
              }

              sourceInfo.Harvesters.push(sourceInfo.Request.creepName);
              sourceInfo.Request = null;
            }
            else if(sourceInfo.Request.Status == RequestStatus.Failed)
            {
              sourceInfo.Request = null;
            }

            continue;
        }

        if(sourceInfo.WorkParts < this._maxWorkParts)
        {
          var request:CreepRequest = new CreepRequest([WORK, MOVE],
                                                      [WORK, WORK, WORK, WORK, CARRY],
                                                      RequestPriority.Routine,
                                                      "harvester");
          BloomingBetty.AddCreepRequest(request);
          sourceInfo.Request = request;
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

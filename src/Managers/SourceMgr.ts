import { SourceInfoData } from "SourceInfoData";

export class SourceMgr
{
  private readonly _updateTickRate:number = 5;
  private readonly _maxWorkParts:number = 5;

  somehowIManage(room:Room, sources:Source[])
  {
    if(!this.checkCanUpdate(room)) return;

    for (let source of sources)
    {
        // We need to ensure the each source has max work parts
        var sourceInfo:SourceInfoData = this.getSourceInfo(room, source);

        // How to remove dead harvesters?
        if(sourceInfo.workParts < this._maxWorkParts)
        {
          console.log("Source:", source.id, "requests harvester");
        }
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
         sourceInfo.workParts = 0;
         sourceInfo.harvesters = [];
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

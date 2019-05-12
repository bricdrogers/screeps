// import { SourceInfoData } from "SourceInfoData";

// export class OverseerRon {

//   private readonly _updateTickRate:number = 1;

//   // somehowIManage(room:Room, sources:Source[])//, spawns:Spawn[], structures:Structure[]) {
//   // {
//   //   if(room.memory.ron_TicksSinceLastUpdate == null ||
//   //      room.memory.ron_TicksSinceLastUpdate >= this._updateTickRate)
//   //     {
//   //       room.memory.ron_TicksSinceLastUpdate = 0;

//   //       this.overseeMemory(room, sources);
//   //     }
//   //     else
//   //     {
//   //       ++room.memory.ron_TicksSinceLastUpdate;
//   //     }
//   // }

//   // overseeMemory(room:Room, sources:Source[])
//   // {
//   //     // Initialze a new room
//   //     if(room.memory.isInitialized == null)
//   //     {
//   //       // Calculate the source static info
//   //       var sourceInfo: { [id: string]: SourceInfoData; } = { };
//   //       for (let source of sources)
//   //       {
//   //         var sourceInfoData:SourceInfoData = new SourceInfoData();

//   //         var areaList = room.lookForAtArea(LOOK_TERRAIN,
//   //                                           source.pos.y - 1,
//   //                                           source.pos.x - 1,
//   //                                           source.pos.y + 1,
//   //                                           source.pos.x + 1,
//   //                                           true);
//   //         for (let area of areaList as LookAtResultWithPos[])
//   //         {
//   //           ++sourceInfoData.harvestCount;
//   //         }
//   //         sourceInfoData.availableCount = sourceInfoData.harvestCount;
//   //         sourceInfo[source.id] = sourceInfoData;
//   //       }

//   //       room.memory.sourceInfo = sourceInfo;
//   //       room.memory.isInitialized = true;
//   //     }
//   // }
// }

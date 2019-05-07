export class BloomingBetty {

  private readonly _updateTickRate:number = 1;

  somehowIManage(room:Room) //, sources:Source[], spawns:Spawn[], structures:Structure[]) {
  {
    if(room.memory.betty_TicksSinceLastUpdate == null ||
       room.memory.betty_TicksSinceLastUpdate >= this._updateTickRate)
      {
        room.memory.betty_TicksSinceLastUpdate = 0;
      }
      else
      {
        ++room.memory.betty_TicksSinceLastUpdate;
      }
  }

  // bloomCreeps(room:Room, spawns:Spawn[])
  // {

  // }
}

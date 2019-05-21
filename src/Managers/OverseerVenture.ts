import { EntityType } from "Prototypes/EntityTypes"

export class OverseerVenture
{
  private readonly _updateTickRate:number = 1;

  somehowIManage(room:Room, sources:Source[], _spawns:Spawn[])
  {
    if(!this.checkCanUpdate(room)) return;

    // *****
    // Update Room
    // *****
    room.tick(sources);

    // *****
    // Update Creeps
    // *****
    for (let name in Memory.creeps)
    {
      var creep = Game.creeps[name];
      if(!creep)
      {
        var owner:[EntityType, string] = Memory.creeps[name].owner;
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
      else
      {
        // Update creeps
        creep.tick(sources);
      }
    }

    // *****
    // Update Sources
    // *****
    for (let source of sources)
    {
      source.tick(room);
    }
  }

  private checkCanUpdate(room:Room)
  {
    if(room.memory.venture_ticksSinceLastUpdate >= this._updateTickRate)
     {
       room.memory.venture_ticksSinceLastUpdate = 0;
       return true;
     }
     else
     {
       ++room.memory.venture_ticksSinceLastUpdate;
       return false;
     }
  }
}

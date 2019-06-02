import { EntityType } from "Prototypes/EntityTypes"
import { Globals, RoomGlobalData } from "Globals";

export class OverseerVenture
{
  somehowIManage(room:Room)
  {
    var roomGlobals:RoomGlobalData = Globals.roomGlobals[room.name];

    // *****
    // Update Creeps
    // *****
    this.updateCreeps(room, roomGlobals);

    // *****
    // Update Sources
    // *****
    roomGlobals.Sources.forEach(function(source)
    {
      source.tick(room);
    });

    // *****
    // Update Resources
    // *****
    for(let resourceId in roomGlobals.Resources)
    {
      roomGlobals.Resources[resourceId].tick(room);
    }

    // *****
    // Update Controller
    // *****
    room.controller.tick();

    // *****
    // Update Room
    // The room must be processed after the creep tick to account for the creeps
    // energy deposits
    // *****
    room.tick();
  }

  private updateCreeps(room:Room, roomGlobals:RoomGlobalData)
  {
    for (let name in Memory.creeps)
    {
      var creep = Game.creeps[name];
      if(!creep)
      {
        var owners:[EntityType, string][] = Memory.creeps[name].owners;
        owners.forEach(function(owner)
        {
          console.log("Creep death", name + ".", "Releasing lease from", EntityType[owner[0]] + ":", owner[1].toString());
          switch(owner[0])
          {
            case EntityType.Source:
            {
              var source:Source = roomGlobals.Sources.find(function(source) { return source.id == owner[1]; });
              source.releaseCreepLease(name);
              break;
            }
            case EntityType.Resource:
            {
              var resource:Resource =  roomGlobals.Resources[owner[1]];
              if(!_.isUndefined(resource)) resource.releaseCreepLease(name);
              break;
            }
            case EntityType.Controller:
            {
              room.controller.releaseCreepLease(name);
              room.removeResourceCreep(name, Memory.creeps[name]);
              break;
            }
            default:
            {
              console.log("Unknown entity type.", owner[0], "cannot release creep lease.");
            }
          }
        });

        delete Memory.creeps[name];
      }
      else
      {
        // Update creeps
        creep.tick();
      }
    }
  }
}

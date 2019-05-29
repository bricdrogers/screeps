import { EntityType } from "Prototypes/EntityTypes"
import { roomPrototype } from "Prototypes/Room";

export class OverseerVenture
{
  private readonly _updateTickRate:number = 1;

  somehowIManage(room:Room, sources:Source[], spawns:Spawn[])
  {
    if(!this.checkCanUpdate(room)) return;

    var constructionSites:ConstructionSite[] = room.find(FIND_CONSTRUCTION_SITES);
    var structures:Structure[] = room.find(FIND_STRUCTURES);
    var resources:{[id:string]: Resource} = this.getResourceDict(room:Room);

    // *****
    // Update Room
    // *****
    room.tick(spawns);

    // *****
    // Update Creeps
    // *****
    this.updateCreeps(room, sources, structures, spawns, resources);

    // *****
    // Update Sources
    // *****
    sources.forEach(function(source)
    {
      source.tick(room, spawns, constructionSites);
    });

    // *****
    // Update Resources
    // *****
    for(let resourceId in resources)
    {
      resources[resourceId].tick(room);
    }

    // *****
    // Update Controller
    // *****
    room.controller.tick();
  }

  private getResourceDict(room:Room): {[id:string]: Resource}
  {
    var resources:Resource[] = room.find(FIND_DROPPED_RESOURCES);

    var updateResources:{[id:string]: Resource} = {};
    resources.forEach(function(resource) { updateResources[resource.id] = resource; });

    // Handle resources in memory
    if(!_.isUndefined(Memory.resources))
    {
      for(let resourceId in Memory.resources)
      {
        var knownResource:Resource = updateResources[resourceId];

        // If the resource is in memory but not on the map, it has 'died' and we need to update memory
        if(_.isUndefined(knownResource))
        {
          var notification:string = "Resource death " + resourceId + ".";
          var resourceMem = Memory.resources[resourceId]

          if(!_.isUndefined(resourceMem.isResourceDump) &&
             resourceMem.isResourceDump == true)
          {
            // Set the room resource dump as undefined
            room.resourceDump = undefined;
          }

          console.log(notification);
          delete Memory.resources[resourceId];
          delete updateResources[resourceId];
        }
      }
    }

    return updateResources;
  }

  private updateCreeps(room:Room, sources:Source[], structures:Structure[], spawns:Spawn[], resources:{[id:string]: Resource})
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
              var source:Source = sources.find(function(source) { return source.id == owner[1]; });
              source.releaseCreepLease(name);
              break;
            }
            case EntityType.Resource:
            {
              var resource:Resource = resources[owner[1]];
              if(!_.isUndefined(resource)) resource.releaseCreepLease(name);
              break;
            }
            case EntityType.Controller:
            {
              room.controller.releaseCreepLease(name);
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
        creep.tick(sources, structures, spawns, resources);
      }
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

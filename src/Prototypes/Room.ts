import { EntityType } from "./EntityTypes";
import { Globals } from "Globals";

const _controllerEnergyPercent: number = 0.25;

export function roomPrototype() {
  // ***************
  // Room.energyTickDelta
  // ***************
  Object.defineProperty(Room.prototype, 'energyTickDelta',
    {
      get: function (): number {
        if (_.isUndefined(this._energyTickDelta)) {
          this._energyTickDelta = 0;
        }

        return <number>this._energyTickDelta;
      },
      set: function (value) {
        this._energyTickDelta = value;
      }
    });

  // ***************
  // Room.energyPerTickAvg
  // ***************
  Object.defineProperty(Room.prototype, 'energyPerTickAvg',
    {
      get: function (): number {
        if (_.isUndefined(this.memory.energyPerTickAvg)) {
          this.memory.energyPerTickAvg = 0;
        }

        return <number>this.memory.energyPerTickAvg;
      },
      set: function (value) {
        this.memory.energyPerTickAvg = value;
      }
    });

  // ***************
  // Room.resourceDumpPos
  // ***************
  Object.defineProperty(Room.prototype, 'resourceDumpPos',
    {
      get: function (): RoomPosition {
        if (_.isUndefined(this.memory.resourceDumpPos)) {
          var spawns: StructureSpawn[] = this.find(FIND_MY_SPAWNS);
          this.memory.resourceDumpPos = new RoomPosition(spawns[0].pos.x, spawns[0].pos.y - 2, this.name);
        }

        var pos: any = this.memory.resourceDumpPos;
        return new RoomPosition(pos.x, pos.y, this.name);
      }
    });

  // ***************
  // Room.resourceDump
  //  The Entity type is the entity of the dump (container, storage, resource, etc..)
  //  The string is the id of the entity
  // ***************
  Object.defineProperty(Room.prototype, 'resourceDump',
    {
      get: function (): [EntityType, string] {
        return this.memory.resourceDump;
      },
      set: function (value) {
        this.memory.resourceDump = value;
      }
    });

  // ***************
  // Room.controllerConsumers
  // ***************
  Object.defineProperty(Room.prototype, 'controllerConsumers',
    {
      get: function (): { [id: string]: number } {
        if (_.isUndefined(this.memory.controllerConsumers)) {
          this.memory.controllerConsumers = {};
        }
        return this.memory.controllerConsumers;
      },
      set: function (value) {
        this.memory.controllerConsumers = value;
      }
    });

  // ***************
  // Room.requestEnergyCreep()
  // ***************
  Room.prototype.requestEnergyCreep = function (consumerType: EntityType): boolean {
    var room: Room = this;
    switch (consumerType) {
      case EntityType.Controller:
        {
          var totalControllerEPT = room.energyPerTickAvg * _controllerEnergyPercent;
          var currentControllerEPT = 0;
          for (let key in room.controllerConsumers) {
            currentControllerEPT += room.controllerConsumers[key];
          }

          // if the currentController energy per tick is less than the allocated energy
          // per tick, we can spawn a new controller energy consumer.
          console.log("Controller Request Energy Current:", currentControllerEPT, "Total", totalControllerEPT);
          return currentControllerEPT < totalControllerEPT;
        }
      default:
        {
          console.log("cannot requestEnergyCreep unsupported entityType");
          return false;
        }
    }
  }

  // ***************
  // Room.addResourceCreep()
  // ***************
  Room.prototype.addResourceCreep = function (creep: Creep) {
    var room: Room = this;

    // Get the creep owner entity type (I am going to assume that if the creep has multiple owners
    // that they are the same type)
    if (creep.memory.owners.length < 1) {
      console.log("Unable to add creep energy consumer. Creep does not have any owners");
      return;
    }

    var consumerType: EntityType = creep.memory.owners[0][0];
    switch (consumerType) {
      case EntityType.Controller:
        {
          room.controllerConsumers[creep.name] = creep.energyPerTick;
          break;
        }
      default:
        {
          console.log("Unsupported consumer type for creep", creep.name);
          return;
        }
    }
  }

  // ***************
  // Room.removeResourceCreep()
  // ***************
  Room.prototype.removeResourceCreep = function (name: string, memory: any) {
    // Get the creep owner entity type (I am going to assume that if the creep has multiple owners
    // that they are the same type)
    if (memory.owners.length < 1) {
      console.log("Unable to remove creep energy consumer. Creep does not have any owners");
      return;
    }

    var room: Room = this;
    var consumerType: EntityType = memory.owners[0][0];
    switch (consumerType) {
      case EntityType.Controller:
        {
          delete room.controllerConsumers[name];
          break;
        }
      default:
        {
          console.log("Unsupported consumer type for creep", name);
          return;
        }
    }
  }

  // ***************
  // Room.getResourceDumpEnergy()
  // ***************
  Room.prototype.getResourceDumpEnergy = function () {
    var room: Room = this;

    var resourceDump: [EntityType, string] = room.resourceDump;
    if (_.isUndefined(resourceDump)) return 0;

    switch (resourceDump[0]) {
      case EntityType.Resource:
        {
          var resource: Resource = Globals.roomGlobals[room.name].Resources[resourceDump[1]];
          if (_.isUndefined(resource)) return 0;
          return resource.amount;
        }
    }

    return 0;
  }

  // ***************
  // Room.addResourceToDump()
  // ***************
  Room.prototype.addResourceToDump = function (creep: Creep, resourceType: ResourceConstant) {
    var dumpType: EntityType = EntityType.Resource;
    var resourceDump: [EntityType, string] = creep.room.resourceDump;

    // If the resourceDump is invalid, it  means it is empty
    if (!_.isUndefined(resourceDump)) {
      dumpType = resourceDump[0]
    }

    switch (dumpType) {
      // if the dumpType is a resource, we simply drop our load on the site
      case EntityType.Resource:
        {
          // If the dump type is a resource, the creep needs to be standing directly over it
          if (creep.pos.x != creep.room.resourceDumpPos.x ||
            creep.pos.y != creep.room.resourceDumpPos.y) {
            return ERR_NOT_IN_RANGE;
          }

          this.energyTickDelta += creep.carry[resourceType];
          return creep.drop(resourceType);
        }
    }

    console.log(creep.name, "Unable to add resource from dump. Unsupported dump entity.");
    return ERR_INVALID_TARGET;
  }

  // ***************
  // Room.getResourceFromDump()
  // ***************
  Room.prototype.getResourceFromDump = function (creep: Creep, resourceType: ResourceConstant) {
    var resourceDump: [EntityType, string] = creep.room.resourceDump;
    if (_.isUndefined(resourceDump)) {
      return ERR_NOT_ENOUGH_RESOURCES;
    }

    switch (resourceDump[0]) {
      case EntityType.Resource:
        {
          var resource: Resource = Globals.roomGlobals[creep.room.name].Resources[resourceDump[1]];
          if (_.isUndefined(resource) || resource == null) {
            console.log(creep.name, "Unable to get resource from dump. Resource not found.");
            return ERR_INVALID_TARGET;
          }

          // If the resource type is different, the resource does not exist
          if (resource.resourceType != resourceType) {
            return ERR_NOT_ENOUGH_RESOURCES;
          }

          return creep.pickup(resource);
        }
    }

    console.log(creep.name, "Unable to get resource from dump. Unsupported dump entity.");
    return ERR_INVALID_TARGET;
  }

  // ***************
  // Room.tick()
  // ***************
  Room.prototype.tick = function () {
    var room: Room = this;

    // Calculate the energy income per tick. This is the exponential average formula so it is slightly more
    // erratic than a moving average but works great for not having to worry about historical data. Over time,
    // it is almost as accurate as moving average which is good enough here.
    room.energyPerTickAvg -= room.energyPerTickAvg / 200;
    room.energyPerTickAvg += room.energyTickDelta / 200;

    if (Game.time % 50 == 0) {
      console.log("Energy Income Per Tick", room.energyPerTickAvg);
    }
  }
}

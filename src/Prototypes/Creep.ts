import { ROLE_HARVESTER } from "Globals";
import { harvestTick } from "Creeps/Harvester";

export function creepPrototype()
{
  // ***************
  // Creep.role
  // ***************
  Object.defineProperty(Creep.prototype, 'role',
  {
    get:function():string { return Memory.creeps[this.name].role; },
    set: function(value) { Memory.creeps[this.name].role = value; }
  });

  // ***************
  // Creep.bodyParts
  // ***************
  Object.defineProperty(Creep.prototype, 'bodyParts',
  {
    get:function():string[] { return Memory.creeps[this.name].bodyParts; },
    set: function(value) { Memory.creeps[this.name].bodyParts = value; }
  });

  // ***************
  // Creep.tick(Source[])
  // ***************
  Creep.prototype.tick = function(sources:Source[])
  {
    switch(this.role)
    {
      case ROLE_HARVESTER:
      {
        harvestTick(this, sources);
        break;
      }
      default:
      {
        console.log("Unknown creep role for", this.name + ".", "Cannot Update.");
        break;
      }
    }
  }
}

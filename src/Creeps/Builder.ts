import { EntityType } from "Prototypes/EntityTypes"

export enum UpgraderState
{
  Gathering,    // The creep is moving to and gathering energy for upgrading
  Building,     // The creep moving into position or is building on a construction site
  Idle,         // The creep is waiting for commands
  Calculating,  // The creep performing required but higher cost calculations and will not perform actions this tick
}

// We only want one builder at a time. A builder will accept all owner request and release the requests
// upon death
export function builderAddOwner(creep:Creep, owners:[EntityType, string][]):boolean
{
  var memory:any = Memory.creeps[creep.name];
  for(let owner of owners)
  {
    memory.owners.push(owner);
  }

  return true;
}

export function builderTick(_creep:Creep)
{

}

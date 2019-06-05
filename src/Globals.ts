export const ROLE_HARVESTER = "harvester";
export const ROLE_ROOMBA = "roomba";
export const ROLE_UPGRADER = "upgrader";
export const ROLE_BUILDER = "builder";

export abstract class Globals
{
  static roomGlobals: { [id: string]: RoomGlobalData; } = {}
}

export class RoomGlobalData
{
  public Sources:Source[] = [];
  public Spawns:Spawn[] = [];
  public Creeps:{[id:string]: Creep} = {};
  public ConstructionSites:{[id:string]: ConstructionSite} = {}
  public Structures:Structure[] = [];
  public Resources:{[id:string]: Resource} = {};
}

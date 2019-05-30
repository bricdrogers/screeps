export const ROLE_HARVESTER = "harvester";
export const ROLE_ROOMBA = "roomba";
export const ROLE_UPGRADER = "upgrader";

export abstract class Globals
{
  static roomGlobals: { [id: string]: RoomGlobalData; } = {}
}

export class RoomGlobalData
{
  public Sources:Source[] = [];
  public Spawns:Spawn[] = [];
  public Creeps:{[id:string]: Creep} = {};
  public ConstructionSites:ConstructionSite[] = [];
  public Structures:Structure[] = [];
  public Resources:{[id:string]: Resource} = {};
}

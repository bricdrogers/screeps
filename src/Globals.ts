export const ROLE_HARVESTER = "harvester";
export const ROLE_ROOMBA = "roomba";

export abstract class Globals
{
  static roomGlobals: { [id: string]: RoomGlobalData; } = {}
}

export class RoomGlobalData
{
  // TODO
}

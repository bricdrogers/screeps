interface Memory {
    resources: any;
    sources: any;
    constructionSites: any;
    controllers: any;
}

interface Room {
    resourceDumpPos: RoomPosition;
    resourceDump: [any, string];
    energyTickDelta: number;
    energyPerTickAvg: number;
    controllerConsumers: { [id: string]: number };
    tick();
    getResourceDumpEnergy();
    getResourceFromDump(creep: Creep, resourceType: string);
    addResourceToDump(creep: Creep, resourceType: string);
    addResourceCreep(creep: Creep);
    removeResourceCreep(name: string, memory: any);
    requestEnergyCreep(consumerType: any): boolean;
}

interface RoomMemory {
    betty_ticksSinceLastUpdate: number;
}

interface Source {
    ticksSinceLastUpdate: number;
    workParts: number;
    requestId: string;
    containerId: string;
    energyPerTick: number;
    harvestSlots: any;
    memory: any;
    tick(room: Room);
    releaseCreepLease(creepId: string);
    findHarvestSlot(creepId: string);
}

interface Resource {
    tick(room: Room);
    releaseCreepLease(creepId: string);
    memory: any;
    requestId: string;
    creepId: string;
    ticksSinceLastUpdate: number;
    isResourceDump: boolean;
    pathToDump: PathFinderPath;
}

interface ConstructionSite {
    memory: any;
    ticksSinceLastUpdate: number;
    pathToDump: PathFinderPath;
    creepId: string;
    requestId: string;
    tick(room: Room);
    releaseCreepLease(creepId: string);
}

interface StructureController {
    tick();
    releaseCreepLease(creepId: string);
    ticksSinceLastUpdate: number;
    requestId: string;
    creeps: string[];
    pathToDump: PathFinderPath;
}

interface StructureSpawn {
    ticksSinceLastUpdate: number;
    tick();
}

interface Creep {
    bodyParts: BodyPartConstant[];
    role: string;
    hasMultipleOwners: boolean;
    energyPerTick: number;
    tick();
    canFulfillRequest(request: any): boolean;
}

interface CreepMemory {
    bodyParts: BodyPartConstant[];
    role: string;
    hasMultipleOwners: boolean;
    energyPerTick: number;
    owners: any;
    state: any;
}

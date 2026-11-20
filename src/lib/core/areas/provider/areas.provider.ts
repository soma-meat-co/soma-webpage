import { Tables } from "../../database.types";

export type Area = Pick<Tables<'areas'>, 'id' |'name'>;

export interface AreasProvider {
    createNewArea(areaName: string): Promise<void>;
    editArea(uuid: string, newAreaName: string): Promise<void>;
    deleteArea(uuid: string): Promise<void>;
    fetchAllAreas(): Promise<Area[]>;
}
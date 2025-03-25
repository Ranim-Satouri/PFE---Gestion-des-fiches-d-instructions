import { User } from "./User";
import { Zone } from "./Zone";

export interface User_Zone {
    idUserZone?: number;
    user: User;
    zone: Zone;
    modifieLe: Date;

}
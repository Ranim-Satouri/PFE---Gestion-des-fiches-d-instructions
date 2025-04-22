import { Zone } from './Zone';

export interface ZoneHistory extends Zone {
    revisionNumber: number;
    revisionDate: string; // La date sera reçue sous forme de chaîne (format ISO)
    changeType: string;
    actionneurFullName: string;
    isDeleted: boolean; // Added the missing property

}
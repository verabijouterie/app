import { Permission } from "./permission.interface";

export interface Role {
    id?: number;
    name: string;
    permission_ids?: number[];
    permissions?: Permission[];
}
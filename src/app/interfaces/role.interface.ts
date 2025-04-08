import { Permission } from "./permission.interface";

export interface Role {
    id?: number;
    name: string;
    row_index?: number;
    permission_ids?: number[];
    permissions?: Permission[];
}
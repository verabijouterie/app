import { PermissionGroup } from "./permission-group.interface";

export interface Permission {
    id: number;
    name: string;           // e.g. 'create_clients'
    slug: string;         // e.g. 'Create Clients'
    permission_group_id: number;
    permission_group: PermissionGroup; // optional if populated via join
    row_index: number;
}
  
import { Role } from "./role.interface";
import { Permission } from "./permission.interface";

export interface RolePermission {
    role_id?: number;
    role?: Role;
    permission_id?: number;
    permission?: Permission;
  }
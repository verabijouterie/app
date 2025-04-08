import { Permission } from "./permission.interface";
import { Role } from "./role.interface";

export interface User {
  id: number;
  email: string;
  name: string;
  role?: Role;
  role_id?: number;
  permissions?: Permission[];
  extraPermissions?: Permission[]; // isGranted = true
  deniedPermissions: Permission[]; // isGranted = false
} 
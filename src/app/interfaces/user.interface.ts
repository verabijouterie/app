import { Permission } from "./permission.interface";
import { Role } from "./role.interface";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  role_id: number;
  password?: string;
} 
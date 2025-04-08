import { User } from "./user.interface";
import { Permission } from "./permission.interface";
export interface UserPermission {
    user_id?: number;
    user?: User;
    permission_id?: number;
    permission?: Permission;
    is_granted?: boolean;
  }
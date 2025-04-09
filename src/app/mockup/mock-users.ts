import { User } from '../interfaces/user.interface';

export const mockUsers: User[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    role_id: 1,
    role: {
      id: 1,
      name: "Super Administrator",
    },
  },
  {
    id: 2,
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    role_id: 2,
    role: {
      id: 2,
      name: "Administrator",
    },
  },
]; 
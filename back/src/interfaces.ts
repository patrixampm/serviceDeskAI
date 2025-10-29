export type Role = 'standard-user' | 'service-desk-user' | 'admin-user';

export interface UserSession {
  id: string;
  role: Role;
}

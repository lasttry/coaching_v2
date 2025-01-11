export const rolesConfig = {
  '/api/accounts': ['admin'], // Only admin can manage accounts
  '/api/clubs': ['admin', 'manager'], // Admins and managers can manage clubs
  '/api/public': ['guest', 'user'], // Example: Publicly accessible endpoints
};

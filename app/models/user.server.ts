/**
 * User model for non-authentication version
 */

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserById(id: string): Promise<User | null> {
  // In a real app with auth, this would query the database
  return {
    id,
    email: "dummy@example.com",
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  // In a real app with auth, this would query the database
  return {
    id: "dummy-user-id",
    email,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export async function createUser(email: string, password: string): Promise<User> {
  // In a real app with auth, this would create a user in the database
  return {
    id: "dummy-user-id",
    email,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export async function deleteUserByEmail(email: string): Promise<User | null> {
  // In a real app with auth, this would delete a user from the database
  return {
    id: "dummy-user-id",
    email,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export async function verifyLogin(email: string, password: string): Promise<User | null> {
  // In a real app with auth, this would verify the login credentials
  return {
    id: "dummy-user-id", 
    email,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

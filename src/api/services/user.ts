import type { MemosClient } from '../client.js';
import type { User, ListUsersResponse, CreateUserRequest } from '../../types/index.js';

export interface ListUsersOptions {
  pageSize?: number;
  pageToken?: string;
  filter?: string;
  showDeleted?: boolean;
}

export async function listUsers(
  client: MemosClient,
  options?: ListUsersOptions
): Promise<ListUsersResponse> {
  return client.get('/users', options as Record<string, string | number | boolean | undefined>);
}

export async function getUser(client: MemosClient, name: string): Promise<User> {
  return client.get(`/${name}`);
}

export async function createUser(client: MemosClient, data: CreateUserRequest): Promise<User> {
  return client.post('/users', data);
}

export async function updateUser(
  client: MemosClient,
  name: string,
  data: Partial<User> & { password?: string },
  updateMask: string[]
): Promise<User> {
  return client.patch(`/${name}`, data, { updateMask: updateMask.join(',') });
}

export async function deleteUser(client: MemosClient, name: string): Promise<void> {
  await client.delete(`/${name}`);
}

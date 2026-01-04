import type { MemosClient } from '../client.js';
import type { UserNotification, ListUserNotificationsResponse } from '../../types/index.js';

export async function listUserNotifications(
  client: MemosClient,
  user: string
): Promise<ListUserNotificationsResponse> {
  return client.get(`/users/${user}/notifications`);
}

export async function updateUserNotification(
  client: MemosClient,
  name: string,
  data: Partial<UserNotification>,
  updateMask: string[]
): Promise<UserNotification> {
  return client.patch(`/${name}`, data, { updateMask: updateMask.join(',') });
}

export async function deleteUserNotification(
  client: MemosClient,
  name: string
): Promise<void> {
  await client.delete(`/${name}`);
}

import type { MemosClient } from '../client.js';
import type { UserSetting, ListUserSettingsResponse } from '../../types/index.js';

export async function getUserSetting(client: MemosClient, name: string): Promise<UserSetting> {
  return client.get(`/${name}`);
}

export async function updateUserSetting(
  client: MemosClient,
  name: string,
  data: Partial<UserSetting>,
  updateMask: string[]
): Promise<UserSetting> {
  return client.patch(`/${name}`, data, { updateMask: updateMask.join(',') });
}

export async function listUserSettings(
  client: MemosClient,
  user: string
): Promise<ListUserSettingsResponse> {
  return client.get(`/users/${user}/settings`);
}

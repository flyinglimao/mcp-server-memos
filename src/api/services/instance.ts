import { MemosClient } from '../client.js';
import type { InstanceProfile } from '../../types/index.js';

export async function getInstanceProfile(
  client: MemosClient
): Promise<InstanceProfile> {
  return client.get('/instance/profile');
}

export async function getInstanceSetting(
  client: MemosClient,
  name: string
): Promise<unknown> {
  return client.get(`/instance/settings/${name}`);
}

export async function updateInstanceSetting(
  client: MemosClient,
  name: string,
  data: unknown,
  updateMask?: string[]
): Promise<unknown> {
  const params = updateMask ? { updateMask: updateMask.join(',') } : undefined;
  return client.patch(`/instance/settings/${name}`, data, params);
}

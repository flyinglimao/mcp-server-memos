import type { MemosClient } from '../client.js';
import type {
  Webhook,
  ListWebhooksResponse,
  CreateWebhookRequest,
  UpdateWebhookRequest,
} from '../../types/index.js';

export async function listUserWebhooks(
  client: MemosClient,
  user: string
): Promise<ListWebhooksResponse> {
  return client.get(`/users/${user}/webhooks`);
}

export async function createUserWebhook(
  client: MemosClient,
  user: string,
  data: CreateWebhookRequest
): Promise<Webhook> {
  return client.post(`/users/${user}/webhooks`, data);
}

export async function updateUserWebhook(
  client: MemosClient,
  name: string,
  data: UpdateWebhookRequest,
  updateMask: string[]
): Promise<Webhook> {
  return client.patch(`/${name}`, data, { updateMask: updateMask.join(',') });
}

export async function deleteUserWebhook(client: MemosClient, name: string): Promise<void> {
  await client.delete(`/${name}`);
}

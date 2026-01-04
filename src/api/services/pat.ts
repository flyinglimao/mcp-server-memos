import type { MemosClient } from '../client.js';
import type {
  ListPersonalAccessTokensResponse,
  CreatePersonalAccessTokenResponse,
  CreatePersonalAccessTokenRequest
} from '../../types/index.js';

export async function listPersonalAccessTokens(
  client: MemosClient,
  user: string
): Promise<ListPersonalAccessTokensResponse> {
  return client.get(`/users/${user}/personalAccessTokens`);
}

export async function createPersonalAccessToken(
  client: MemosClient,
  user: string,
  data: CreatePersonalAccessTokenRequest
): Promise<CreatePersonalAccessTokenResponse> {
  return client.post(`/users/${user}/personalAccessTokens`, data);
}

export async function deletePersonalAccessToken(
  client: MemosClient,
  name: string
): Promise<void> {
  await client.delete(`/${name}`);
}

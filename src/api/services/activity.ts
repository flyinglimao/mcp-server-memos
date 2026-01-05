import type { MemosClient } from '../client.js';
import type { Activity, ListActivitiesResponse } from '../../types/index.js';

export interface ListActivitiesOptions {
  pageSize?: number;
  pageToken?: string;
}

export async function listActivities(
  client: MemosClient,
  options?: ListActivitiesOptions
): Promise<ListActivitiesResponse> {
  return client.get(
    '/activities',
    options as Record<string, string | number | boolean | undefined>
  );
}

export async function getActivity(client: MemosClient, name: string): Promise<Activity> {
  return client.get(`/${name}`);
}

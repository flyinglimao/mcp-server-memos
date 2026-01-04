# Agent D: Tier 3 - Instance & Activity Tools

## Task
Implement Tier 3 Instance Settings and Activity tools for memos-mcp-server (admin functionality).

## Repository
https://github.com/flyinglimao/mcp-server-memos

## Context
This is an MCP (Model Context Protocol) server for Memos note-taking app. The project uses:
- TypeScript with strict mode
- pnpm as package manager
- @modelcontextprotocol/sdk for MCP server
- zod for parameter validation

Tier 1 tools are already implemented. Your task is to implement Instance Settings and Activity tools for Tier 3 (admin functionality).

## API Endpoints to Implement

### Instance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/instance/profile` | Get instance profile (version, owner, etc.) |
| GET | `/api/v1/instance/settings/{name}` | Get specific setting |
| PATCH | `/api/v1/instance/settings/{name}` | Update setting |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/activities` | List activities |
| GET | `/api/v1/activities/{activity}` | Get specific activity |

## Types Already Defined

In `src/types/memos.ts`, these types exist:

```typescript
interface InstanceProfile {
  owner: string;
  version: string;
  mode: string;
  instanceUrl: string;
}

interface Activity {
  name: string;
  creator: string;
  type: string;
  level: string;
  createTime: string;
  payload?: ActivityPayload;
}

interface ActivityPayload {
  memoComment?: {
    memo: string;
    relatedMemo: string;
  };
}

interface ListActivitiesResponse {
  activities: Activity[];
  nextPageToken?: string;
}
```

## Files to Create

### 1. src/api/services/instance.ts

```typescript
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
```

### 2. src/api/services/activity.ts

```typescript
import { MemosClient } from '../client.js';
import type { Activity, ListActivitiesResponse } from '../../types/index.js';

export interface ListActivitiesOptions {
  pageSize?: number;
  pageToken?: string;
}

export async function listActivities(
  client: MemosClient, 
  options?: ListActivitiesOptions
): Promise<ListActivitiesResponse> {
  return client.get('/activities', options);
}

export async function getActivity(
  client: MemosClient, 
  name: string
): Promise<Activity> {
  return client.get(`/${name}`);
}
```

### 3. src/tools/tier3/instance.ts

```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstance } from '../../config/index.js';
import { createClient, MemosApiError } from '../../api/index.js';
import * as instanceService from '../../api/services/instance.js';

export function registerInstanceTools(server: McpServer): void {
  // get_instance_profile - Get instance info
  server.tool(
    'get_instance_profile',
    'Get instance profile information (version, owner, mode).',
    {
      instance: z.string().describe('Instance name'),
    },
    async ({ instance }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const profile = await instanceService.getInstanceProfile(client);
        
        return {
          content: [{
            type: 'text' as const,
            text: `# Instance Profile\n\n` +
                  `- **Version:** ${profile.version}\n` +
                  `- **Mode:** ${profile.mode}\n` +
                  `- **Owner:** ${profile.owner}\n` +
                  `- **URL:** ${profile.instanceUrl}`,
          }],
        };
      } catch (error) {
        if (error instanceof MemosApiError) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          };
        }
        throw error;
      }
    }
  );

  // get_instance_setting - Get specific setting
  server.tool(
    'get_instance_setting',
    'Get a specific instance setting.',
    {
      instance: z.string().describe('Instance name'),
      settingName: z.string().describe('Setting name'),
    },
    async ({ instance, settingName }) => {
      // ... implementation
    }
  );

  // update_instance_setting - Update setting (admin only)
  server.tool(
    'update_instance_setting',
    'Update an instance setting (admin only).',
    {
      instance: z.string().describe('Instance name'),
      settingName: z.string().describe('Setting name'),
      value: z.string().describe('New value (JSON string)'),
    },
    async ({ instance, settingName, value }) => {
      // ... implementation with JSON.parse(value)
    }
  );
}
```

### 4. src/tools/tier3/activities.ts

```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstance } from '../../config/index.js';
import { createClient, MemosApiError } from '../../api/index.js';
import * as activityService from '../../api/services/activity.js';

export function registerActivityTools(server: McpServer): void {
  // list_activities - List recent activities
  server.tool(
    'list_activities',
    'List recent activities.',
    {
      instance: z.string().describe('Instance name'),
      pageSize: z.number().optional().default(20).describe('Number of activities to return'),
    },
    async ({ instance, pageSize }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const response = await activityService.listActivities(client, { pageSize });
        
        if (!response.activities?.length) {
          return {
            content: [{ type: 'text' as const, text: 'No activities found.' }],
          };
        }

        const list = response.activities
          .map(a => `- **${a.type}** by ${a.creator} at ${a.createTime}\n  ${a.name}`)
          .join('\n');

        return {
          content: [{ type: 'text' as const, text: `Activities:\n${list}` }],
        };
      } catch (error) {
        if (error instanceof MemosApiError) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          };
        }
        throw error;
      }
    }
  );

  // get_activity - Get specific activity
  server.tool(
    'get_activity',
    'Get a specific activity by name.',
    {
      instance: z.string().describe('Instance name'),
      activityName: z.string().describe('Activity name (e.g., "activities/123")'),
    },
    async ({ instance, activityName }) => {
      // ... implementation
    }
  );
}
```

### 5. Update src/tools/tier3/index.ts

```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerUserManagementTools } from './users.js';
import { registerInstanceTools } from './instance.js';
import { registerActivityTools } from './activities.js';

export function registerTier3Tools(server: McpServer): void {
  registerUserManagementTools(server);
  registerInstanceTools(server);
  registerActivityTools(server);
}
```

## Activity Type Display

```typescript
function getActivityIcon(type: string): string {
  switch (type) {
    case 'MEMO_COMMENT': return '💬';
    case 'MEMO_CREATE': return '📝';
    case 'MEMO_UPDATE': return '✏️';
    case 'MEMO_DELETE': return '🗑️';
    default: return '📋';
  }
}
```

## Validation Steps

After completing the implementation:

1. **Build Check**
   ```bash
   pnpm build
   ```
   Must compile without errors.

2. **Lint Check**
   ```bash
   pnpm lint
   ```
   Should pass without errors.

3. **Import Verification**
   - Check that `src/tools/tier3/index.ts` properly imports and registers all tools
   - Verify all API service functions are exported

## Commit Message

```
feat(tier3): add instance and activity tools

- Add instance service with profile and settings operations
- Add activity service with list and get operations
- Register tools in tier3 index
```

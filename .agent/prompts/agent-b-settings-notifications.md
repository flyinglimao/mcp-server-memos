# Agent B: Tier 2 - Settings & Notification Tools

## Task
Implement Tier 2 User Settings and Notification tools for memos-mcp-server.

## Repository
https://github.com/flyinglimao/mcp-server-memos

## Context
This is an MCP (Model Context Protocol) server for Memos note-taking app. The project uses:
- TypeScript with strict mode
- pnpm as package manager
- @modelcontextprotocol/sdk for MCP server
- zod for parameter validation

Tier 1 tools are already implemented. Your task is to implement User Settings and Notification tools for Tier 2.

## API Endpoints to Implement

### User Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/{user}/settings/{setting}` | Get specific setting |
| PATCH | `/api/v1/users/{user}/settings/{setting}?updateMask=...` | Update setting |
| GET | `/api/v1/users/{user}/settings` | List all settings |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/{user}/notifications` | List notifications |
| PATCH | `/api/v1/users/{user}/notifications/{notification}?updateMask=...` | Update notification |
| DELETE | `/api/v1/users/{user}/notifications/{notification}` | Delete notification |

## Files to Create

### 1. src/api/services/userSetting.ts

```typescript
import { MemosClient } from '../client.js';
import type { UserSetting, ListUserSettingsResponse } from '../../types/index.js';

export async function getUserSetting(
  client: MemosClient, 
  name: string
): Promise<UserSetting> {
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
```

### 2. src/api/services/notification.ts

```typescript
import { MemosClient } from '../client.js';
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
```

### 3. src/tools/tier2/settings.ts

Create MCP tools:
- `get_user_setting` - Get a specific user setting
- `update_user_setting` - Update user setting
- `list_user_settings` - List all user settings

### 4. src/tools/tier2/notifications.ts

Create MCP tools:
- `list_notifications` - List all notifications for a user
- `update_notification` - Update a notification (e.g., mark as read)
- `delete_notification` - Delete a notification

### 5. Update src/tools/tier2/index.ts

Add imports and registration for settings and notification tools:

```typescript
import { registerSettingTools } from './settings.js';
import { registerNotificationTools } from './notifications.js';

export function registerTier2Tools(server: McpServer): void {
  // ... existing imports from Agent A
  registerSettingTools(server);
  registerNotificationTools(server);
}
```

## Code Patterns to Follow

Reference `src/tools/tier1/shortcuts.ts` for the exact pattern:

```typescript
server.tool(
  'tool_name',
  'Tool description',
  {
    instance: z.string().describe('Instance name'),
    user: z.string().optional().default('me').describe('User ID or "me"'),
    // ... other params
  },
  async ({ instance, user, ... }) => {
    const inst = await getInstance(instance);
    if (!inst) {
      return {
        content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
        isError: true,
      };
    }

    try {
      const client = createClient(inst);
      // ... API call
      return {
        content: [{ type: 'text' as const, text: '...' }],
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
```

## Important Notes

- For `user` parameter, default to `'me'` for current user
- Setting names follow pattern: `users/{user}/settings/{setting_key}`
- Setting keys include: `GENERAL`, `WEBHOOKS`
- Notification names follow pattern: `users/{user}/notifications/{notification_id}`

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
   - Check that `src/tools/tier2/index.ts` properly imports and registers all tools
   - Verify all API service functions are exported

## Commit Message

```
feat(tier2): add user settings and notification tools

- Add user setting service with get, update, list operations
- Add notification service with list, update, delete operations
- Register tools in tier2 index
```

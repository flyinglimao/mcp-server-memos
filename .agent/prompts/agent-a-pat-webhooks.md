# Agent A: Tier 2 - PAT & Webhook Tools

## Task
Implement Tier 2 PAT (Personal Access Token) and Webhook management tools for memos-mcp-server.

## Repository
https://github.com/flyinglimao/mcp-server-memos

## Context
This is an MCP (Model Context Protocol) server for Memos note-taking app. The project uses:
- TypeScript with strict mode
- pnpm as package manager
- @modelcontextprotocol/sdk for MCP server
- zod for parameter validation

Tier 1 tools are already implemented. Your task is to implement PAT and Webhook management tools for Tier 2.

## API Endpoints to Implement

### Personal Access Tokens
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/{user}/personalAccessTokens` | List PATs |
| POST | `/api/v1/users/{user}/personalAccessTokens` | Create PAT (returns token only once) |
| DELETE | `/api/v1/users/{user}/personalAccessTokens/{pat}` | Delete PAT |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/{user}/webhooks` | List webhooks |
| POST | `/api/v1/users/{user}/webhooks` | Create webhook |
| PATCH | `/api/v1/users/{user}/webhooks/{webhook}?updateMask=url,displayName` | Update webhook |
| DELETE | `/api/v1/users/{user}/webhooks/{webhook}` | Delete webhook |

## Files to Create

### 1. src/api/services/pat.ts

```typescript
import { MemosClient } from '../client.js';
import type { 
  PersonalAccessToken, 
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
```

### 2. src/api/services/webhook.ts

```typescript
import { MemosClient } from '../client.js';
import type { 
  Webhook, 
  ListWebhooksResponse, 
  CreateWebhookRequest,
  UpdateWebhookRequest 
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

export async function deleteUserWebhook(
  client: MemosClient, 
  name: string
): Promise<void> {
  await client.delete(`/${name}`);
}
```

### 3. src/tools/tier2/pats.ts

Create MCP tools following the pattern in `src/tools/tier1/instances.ts`:
- `list_personal_access_tokens` - List all PATs for a user
- `create_personal_access_token` - Create new PAT with description and optional expiry
- `delete_personal_access_token` - Delete a PAT by name

### 4. src/tools/tier2/webhooks.ts

Create MCP tools:
- `list_webhooks` - List all webhooks for a user
- `create_webhook` - Create new webhook with URL and display name
- `update_webhook` - Update webhook URL or display name
- `delete_webhook` - Delete a webhook

### 5. Update src/tools/tier2/index.ts

```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerPATTools } from './pats.js';
import { registerWebhookTools } from './webhooks.js';

export function registerTier2Tools(server: McpServer): void {
  registerPATTools(server);
  registerWebhookTools(server);
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
feat(tier2): add PAT and webhook management tools

- Add PAT service with list, create, delete operations
- Add webhook service with full CRUD operations  
- Register tools in tier2 index
```

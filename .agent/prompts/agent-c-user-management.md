# Agent C: Tier 3 - User Management Tools

## Task
Implement Tier 3 User Management tools for memos-mcp-server (admin functionality).

## Repository
https://github.com/flyinglimao/mcp-server-memos

## Context
This is an MCP (Model Context Protocol) server for Memos note-taking app. The project uses:
- TypeScript with strict mode
- pnpm as package manager
- @modelcontextprotocol/sdk for MCP server
- zod for parameter validation

Tier 1 tools are already implemented. Your task is to implement User Management tools for Tier 3 (admin functionality).

## API Endpoints to Implement

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List all users |
| GET | `/api/v1/users/{user}` | Get user by ID or username |
| POST | `/api/v1/users` | Create new user |
| PATCH | `/api/v1/users/{user}?updateMask=...` | Update user |
| DELETE | `/api/v1/users/{user}` | Delete user |

## Types Already Defined

In `src/types/memos.ts`, these types exist:

```typescript
interface User {
  name: string;
  role: UserRole;
  username: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  description?: string;
  state: State;
  createTime: string;
  updateTime: string;
}

type UserRole = 'ROLE_UNSPECIFIED' | 'HOST' | 'ADMIN' | 'USER';

interface CreateUserRequest {
  username: string;
  role: UserRole;
  email?: string;
  displayName?: string;
  password: string;
}

interface ListUsersResponse {
  users: User[];
  nextPageToken?: string;
  totalSize?: number;
}
```

## Files to Create

### 1. src/api/services/user.ts

```typescript
import { MemosClient } from '../client.js';
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
  return client.get('/users', options);
}

export async function getUser(
  client: MemosClient, 
  name: string
): Promise<User> {
  return client.get(`/${name}`);
}

export async function createUser(
  client: MemosClient, 
  data: CreateUserRequest
): Promise<User> {
  return client.post('/users', data);
}

export async function updateUser(
  client: MemosClient, 
  name: string, 
  data: Partial<User>, 
  updateMask: string[]
): Promise<User> {
  return client.patch(`/${name}`, data, { updateMask: updateMask.join(',') });
}

export async function deleteUser(
  client: MemosClient, 
  name: string
): Promise<void> {
  await client.delete(`/${name}`);
}
```

### 2. src/tools/tier3/users.ts

Create MCP tools:

```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstance } from '../../config/index.js';
import { createClient, MemosApiError } from '../../api/index.js';
import * as userService from '../../api/services/user.js';

export function registerUserManagementTools(server: McpServer): void {
  // list_users - List all users with pagination
  server.tool(
    'list_users',
    'List all users (admin only).',
    {
      instance: z.string().describe('Instance name'),
      pageSize: z.number().optional().default(20).describe('Number of users to return'),
      filter: z.string().optional().describe('Filter expression'),
    },
    async ({ instance, pageSize, filter }) => {
      // ... implementation
    }
  );

  // get_user - Get specific user details
  server.tool(
    'get_user',
    'Get a specific user by ID or username.',
    {
      instance: z.string().describe('Instance name'),
      userName: z.string().describe('User name (e.g., "users/123" or "users/john")'),
    },
    async ({ instance, userName }) => {
      // ... implementation
    }
  );

  // create_user - Create new user
  server.tool(
    'create_user',
    'Create a new user (admin only).',
    {
      instance: z.string().describe('Instance name'),
      username: z.string().describe('Login username'),
      password: z.string().describe('User password'),
      role: z.enum(['HOST', 'ADMIN', 'USER']).default('USER').describe('User role'),
      email: z.string().optional().describe('Email address'),
      displayName: z.string().optional().describe('Display name'),
    },
    async ({ instance, username, password, role, email, displayName }) => {
      // ... implementation
    }
  );

  // update_user - Update user attributes
  server.tool(
    'update_user',
    'Update a user (admin only).',
    {
      instance: z.string().describe('Instance name'),
      userName: z.string().describe('User name'),
      email: z.string().optional().describe('New email'),
      displayName: z.string().optional().describe('New display name'),
      role: z.enum(['HOST', 'ADMIN', 'USER']).optional().describe('New role'),
    },
    async ({ instance, userName, email, displayName, role }) => {
      // ... implementation with updateMask
    }
  );

  // delete_user - Delete user
  server.tool(
    'delete_user',
    'Delete a user (admin only).',
    {
      instance: z.string().describe('Instance name'),
      userName: z.string().describe('User name to delete'),
    },
    async ({ instance, userName }) => {
      // ... implementation
    }
  );
}
```

### 3. Update src/tools/tier3/index.ts

```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerUserManagementTools } from './users.js';

export function registerTier3Tools(server: McpServer): void {
  registerUserManagementTools(server);
}
```

## Code Patterns

Reference `src/tools/tier1/memos.ts` for CRUD patterns.

### Role Badge Display
```typescript
function getRoleBadge(role: string): string {
  switch (role) {
    case 'HOST': return '👑';
    case 'ADMIN': return '🔧';
    case 'USER': return '👤';
    default: return '';
  }
}
```

### Permission Error Handling
```typescript
catch (error) {
  if (error instanceof MemosApiError) {
    if (error.code === 7) {
      return {
        content: [{ type: 'text' as const, text: 'Permission denied. Admin privileges required.' }],
        isError: true,
      };
    }
    return {
      content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
      isError: true,
    };
  }
  throw error;
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

## Commit Message

```
feat(tier3): add user management tools

- Add user service with full CRUD operations
- Add admin-level tools: list_users, get_user, create_user, update_user, delete_user
- Handle permission denied errors gracefully
- Register tools in tier3 index
```

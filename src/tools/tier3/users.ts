import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstance } from '../../config/index.js';
import { createClient, MemosApiError } from '../../api/index.js';
import * as userService from '../../api/services/user.js';
import type { UserRole, User } from '../../types/index.js';

function getRoleBadge(role: string): string {
  switch (role) {
    case 'HOST': return '👑';
    case 'ADMIN': return '🔧';
    case 'USER': return '👤';
    default: return '';
  }
}

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
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const response = await userService.listUsers(client, { pageSize, filter });

        if (!response.users || response.users.length === 0) {
          return {
            content: [{ type: 'text' as const, text: 'No users found.' }],
          };
        }

        const userList = response.users
          .map(user => {
            const badge = getRoleBadge(user.role);
            return `- ${badge} **${user.username}** (${user.name})\n  Role: ${user.role} | State: ${user.state}${user.email ? ` | Email: ${user.email}` : ''}`;
          })
          .join('\n');

        return {
          content: [{ type: 'text' as const, text: `## Users in ${inst.name}\n${userList}` }],
        };
      } catch (error) {
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
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const user = await userService.getUser(client, userName);
        const badge = getRoleBadge(user.role);

        const details = [
          `# ${badge} ${user.username} (${user.name})`,
          `**Role:** ${user.role}`,
          `**State:** ${user.state}`,
          `**Created:** ${user.createTime}`,
          `**Updated:** ${user.updateTime}`,
        ];

        if (user.email) details.push(`**Email:** ${user.email}`);
        if (user.displayName) details.push(`**Display Name:** ${user.displayName}`);
        if (user.description) details.push(`**Description:** ${user.description}`);

        return {
          content: [{ type: 'text' as const, text: details.join('\n') }],
        };
      } catch (error) {
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
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const user = await userService.createUser(client, {
          username,
          password,
          role: role as UserRole,
          email,
          displayName,
        });

        return {
          content: [{
            type: 'text' as const,
            text: `Successfully created user: ${user.username} (${user.name})`,
          }],
        };
      } catch (error) {
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
      password: z.string().optional().describe('New password'),
    },
    async ({ instance, userName, email, displayName, role, password }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      const updateFields: string[] = [];
      const data: Partial<User> & { password?: string } = {};

      if (email !== undefined) { data.email = email; updateFields.push('email'); }
      if (displayName !== undefined) { data.displayName = displayName; updateFields.push('display_name'); }
      if (role !== undefined) { data.role = role as UserRole; updateFields.push('role'); }
      if (password !== undefined) { data.password = password; updateFields.push('password'); }

      if (updateFields.length === 0) {
        return {
          content: [{ type: 'text' as const, text: 'No fields to update.' }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const user = await userService.updateUser(client, userName, data, updateFields);

        return {
          content: [{
            type: 'text' as const,
            text: `Successfully updated user: ${user.username} (${user.name})`,
          }],
        };
      } catch (error) {
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
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        await userService.deleteUser(client, userName);

        return {
          content: [{
            type: 'text' as const,
            text: `Successfully deleted user: ${userName}`,
          }],
        };
      } catch (error) {
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
    }
  );
}

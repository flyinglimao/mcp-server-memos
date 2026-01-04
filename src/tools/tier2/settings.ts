import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstance } from '../../config/index.js';
import { createClient, MemosApiError, getUserSetting, updateUserSetting, listUserSettings } from '../../api/index.js';
import type { UserSetting } from '../../types/index.js';

export function registerSettingTools(server: McpServer): void {
  // Get user setting
  server.tool(
    'get_user_setting',
    'Get a specific user setting',
    {
      instance: z.string().describe('Instance name'),
      user: z.string().optional().default('me').describe('User ID or "me" for current user'),
      setting: z.string().describe('Setting key (e.g. GENERAL, WEBHOOKS)'),
    },
    async ({ instance, user, setting }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const name = `users/${user}/settings/${setting}`;
        const response = await getUserSetting(client, name);

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
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

  // Update user setting
  server.tool(
    'update_user_setting',
    'Update user setting',
    {
      instance: z.string().describe('Instance name'),
      user: z.string().optional().default('me').describe('User ID or "me" for current user'),
      setting: z.string().describe('Setting key (e.g. GENERAL, WEBHOOKS)'),
      data: z.string().describe('JSON string of setting data to update'),
      updateMask: z.string().describe('Comma-separated list of fields to update'),
    },
    async ({ instance, user, setting, data, updateMask }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const name = `users/${user}/settings/${setting}`;
        let parsedData: Partial<UserSetting>;
        try {
          parsedData = JSON.parse(data);
        } catch {
          return {
            content: [{ type: 'text' as const, text: 'Invalid JSON data provided.' }],
            isError: true,
          };
        }

        const mask = updateMask.split(',').map(s => s.trim());
        const response = await updateUserSetting(client, name, parsedData, mask);

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
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

  // List user settings
  server.tool(
    'list_user_settings',
    'List all user settings',
    {
      instance: z.string().describe('Instance name'),
      user: z.string().optional().default('me').describe('User ID or "me" for current user'),
    },
    async ({ instance, user }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const response = await listUserSettings(client, user);

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
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
}

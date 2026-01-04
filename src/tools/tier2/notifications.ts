import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstance } from '../../config/index.js';
import { createClient, MemosApiError, listUserNotifications, updateUserNotification, deleteUserNotification } from '../../api/index.js';
import type { UserNotification } from '../../types/index.js';

export function registerNotificationTools(server: McpServer): void {
  // List notifications
  server.tool(
    'list_notifications',
    'List all notifications for a user',
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
        const response = await listUserNotifications(client, user);

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

  // Update notification
  server.tool(
    'update_notification',
    'Update a notification (e.g., mark as read)',
    {
      instance: z.string().describe('Instance name'),
      notification: z.string().describe('Notification name (e.g., "users/me/notifications/123")'),
      data: z.string().describe('JSON string of notification data to update'),
      updateMask: z.string().describe('Comma-separated list of fields to update'),
    },
    async ({ instance, notification, data, updateMask }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        let parsedData: Partial<UserNotification>;
        try {
          parsedData = JSON.parse(data);
        } catch {
          return {
            content: [{ type: 'text' as const, text: 'Invalid JSON data provided.' }],
            isError: true,
          };
        }

        const mask = updateMask.split(',').map(s => s.trim());
        const response = await updateUserNotification(client, notification, parsedData, mask);

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

  // Delete notification
  server.tool(
    'delete_notification',
    'Delete a notification',
    {
      instance: z.string().describe('Instance name'),
      notification: z.string().describe('Notification name (e.g., "users/me/notifications/123")'),
    },
    async ({ instance, notification }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        await deleteUserNotification(client, notification);

        return {
          content: [{ type: 'text' as const, text: `Successfully deleted notification: ${notification}` }],
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

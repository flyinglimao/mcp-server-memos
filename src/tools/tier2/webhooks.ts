import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstance } from '../../config/index.js';
import { createClient, MemosApiError } from '../../api/index.js';
import {
  listUserWebhooks,
  createUserWebhook,
  updateUserWebhook,
  deleteUserWebhook,
} from '../../api/services/webhook.js';

export function registerWebhookTools(server: McpServer): void {
  // List webhooks
  server.tool(
    'list_webhooks',
    'List all webhooks for a user.',
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
        const response = await listUserWebhooks(client, user);

        if (!response.webhooks?.length) {
          return {
            content: [{ type: 'text' as const, text: 'No webhooks found.' }],
          };
        }

        const list = response.webhooks
          .map(
            (w) =>
              `- **${w.displayName || 'No display name'}**\n  Name: \`${w.name}\`\n  URL: ${w.url}`
          )
          .join('\n');

        return {
          content: [{ type: 'text' as const, text: `Webhooks:\n${list}` }],
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

  // Create webhook
  server.tool(
    'create_webhook',
    'Create a new webhook.',
    {
      instance: z.string().describe('Instance name'),
      user: z.string().optional().default('me').describe('User ID or "me"'),
      url: z.string().url().describe('Webhook URL'),
      displayName: z.string().optional().describe('Display name for the webhook'),
    },
    async ({ instance, user, url, displayName }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const webhook = await createUserWebhook(client, user, { url, displayName });

        return {
          content: [
            {
              type: 'text' as const,
              text: `Successfully created webhook: ${webhook.name}`,
            },
          ],
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

  // Update webhook
  server.tool(
    'update_webhook',
    'Update an existing webhook.',
    {
      instance: z.string().describe('Instance name'),
      webhookName: z.string().describe('Webhook name (e.g., "users/me/webhooks/123")'),
      url: z.string().url().optional().describe('New webhook URL'),
      displayName: z.string().optional().describe('New display name'),
    },
    async ({ instance, webhookName, url, displayName }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      const updateFields: string[] = [];
      const request: { url?: string; displayName?: string } = {};

      if (url !== undefined) {
        request.url = url;
        updateFields.push('url');
      }
      if (displayName !== undefined) {
        request.displayName = displayName;
        updateFields.push('displayName');
      }

      if (updateFields.length === 0) {
        return {
          content: [{ type: 'text' as const, text: 'No fields to update.' }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const webhook = await updateUserWebhook(client, webhookName, request, updateFields);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Successfully updated webhook: ${webhook.name}`,
            },
          ],
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

  // Delete webhook
  server.tool(
    'delete_webhook',
    'Delete a webhook.',
    {
      instance: z.string().describe('Instance name'),
      webhookName: z.string().describe('Webhook name (e.g., "users/me/webhooks/123")'),
    },
    async ({ instance, webhookName }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        await deleteUserWebhook(client, webhookName);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Successfully deleted webhook: ${webhookName}`,
            },
          ],
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

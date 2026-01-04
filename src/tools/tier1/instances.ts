/**
 * Instance management tools
 * - connect_instance
 * - disconnect_instance
 * - list_instances
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstances, addInstance, removeInstance, getConfigPath } from '../../config/index.js';

export function registerInstanceTools(server: McpServer): void {
  // Connect to a new Memos instance
  server.tool(
    'connect_instance',
    'Connect to a Memos instance. Saves the connection info for future use.',
    {
      name: z.string().describe('Friendly name for this instance (e.g., "personal", "work")'),
      host: z
        .string()
        .url()
        .describe('The URL of your Memos instance (e.g., https://memos.example.com)'),
      apiKey: z.string().describe('Your API access token from Memos settings'),
    },
    async ({ name, host, apiKey }) => {
      await addInstance({ name, host, apiKey });
      return {
        content: [
          {
            type: 'text' as const,
            text: `Successfully connected to Memos instance "${name}" at ${host}.\nConfiguration saved to: ${getConfigPath()}`,
          },
        ],
      };
    }
  );

  // Disconnect from a Memos instance
  server.tool(
    'disconnect_instance',
    'Remove a connected Memos instance.',
    {
      name: z.string().describe('The name of the instance to disconnect'),
    },
    async ({ name }) => {
      const removed = await removeInstance(name);
      if (removed) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Successfully disconnected from Memos instance "${name}".`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Instance "${name}" not found.`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // List all connected instances
  server.tool('list_instances', 'List all connected Memos instances.', {}, async () => {
    const instances = await getInstances();
    if (instances.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'No Memos instances connected.\n\nTo connect an instance, use the connect_instance tool with:\n- name: A friendly name for the instance\n- host: The URL of your Memos instance\n- apiKey: Your API access token (get it from Settings → My Account → Access Tokens)',
          },
        ],
      };
    }

    const list = instances.map((i) => `- ${i.name}: ${i.host}`).join('\n');
    return {
      content: [
        {
          type: 'text' as const,
          text: `Connected Memos instances:\n${list}`,
        },
      ],
    };
  });
}

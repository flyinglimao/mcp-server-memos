/**
 * Shortcut tools
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstance } from '../../config/index.js';
import { createClient, MemosApiError } from '../../api/index.js';
import type { Shortcut, ListShortcutsResponse, CreateShortcutRequest } from '../../types/index.js';

export function registerShortcutTools(server: McpServer): void {
  // List shortcuts
  server.tool(
    'list_shortcuts',
    'List all shortcuts for a user.',
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
        const response = await client.get<ListShortcutsResponse>(`/users/${user}/shortcuts`);

        if (!response.shortcuts?.length) {
          return {
            content: [{ type: 'text' as const, text: 'No shortcuts found.' }],
          };
        }

        const list = response.shortcuts
          .map((s) => `- **${s.title}** (${s.name})\n  Filter: \`${s.filter}\``)
          .join('\n');

        return {
          content: [{ type: 'text' as const, text: `Shortcuts:\n${list}` }],
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

  // Create shortcut
  server.tool(
    'create_shortcut',
    'Create a new shortcut (saved filter).',
    {
      instance: z.string().describe('Instance name'),
      user: z.string().optional().default('me').describe('User ID or "me"'),
      title: z.string().describe('Shortcut title'),
      filter: z.string().describe('CEL filter expression'),
    },
    async ({ instance, user, title, filter }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const request: CreateShortcutRequest = { title, filter };
        const shortcut = await client.post<Shortcut>(`/users/${user}/shortcuts`, request);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Successfully created shortcut: ${shortcut.name}`,
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

  // Update shortcut
  server.tool(
    'update_shortcut',
    'Update an existing shortcut.',
    {
      instance: z.string().describe('Instance name'),
      shortcutName: z.string().describe('Shortcut name (e.g., "users/me/shortcuts/123")'),
      title: z.string().optional().describe('New title'),
      filter: z.string().optional().describe('New filter expression'),
    },
    async ({ instance, shortcutName, title, filter }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      const updateFields: string[] = [];
      const request: Partial<CreateShortcutRequest> = {};

      if (title !== undefined) {
        request.title = title;
        updateFields.push('title');
      }
      if (filter !== undefined) {
        request.filter = filter;
        updateFields.push('filter');
      }

      if (updateFields.length === 0) {
        return {
          content: [{ type: 'text' as const, text: 'No fields to update.' }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const shortcut = await client.patch<Shortcut>(`/${shortcutName}`, request, {
          updateMask: updateFields.join(','),
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: `Successfully updated shortcut: ${shortcut.name}`,
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

  // Delete shortcut
  server.tool(
    'delete_shortcut',
    'Delete a shortcut.',
    {
      instance: z.string().describe('Instance name'),
      shortcutName: z.string().describe('Shortcut name'),
    },
    async ({ instance, shortcutName }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        await client.delete(`/${shortcutName}`);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Successfully deleted shortcut: ${shortcutName}`,
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

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
          .map((a) => `- **${a.type}** by ${a.creator} at ${a.createTime}\n  ${a.name}`)
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
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const activity = await activityService.getActivity(client, activityName);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(activity, null, 2),
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

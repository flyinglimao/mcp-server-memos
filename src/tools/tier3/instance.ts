import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstance } from '../../config/index.js';
import { createClient, MemosApiError } from '../../api/index.js';
import * as instanceService from '../../api/services/instance.js';

export function registerInstanceTools(server: McpServer): void {
  // get_instance_profile - Get instance info
  server.tool(
    'get_instance_profile',
    'Get instance profile information (version, owner, mode).',
    {
      instance: z.string().describe('Instance name'),
    },
    async ({ instance }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const profile = await instanceService.getInstanceProfile(client);

        return {
          content: [{
            type: 'text' as const,
            text: `# Instance Profile\n\n` +
                  `- **Version:** ${profile.version}\n` +
                  `- **Mode:** ${profile.mode}\n` +
                  `- **Owner:** ${profile.owner}\n` +
                  `- **URL:** ${profile.instanceUrl}`,
          }],
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

  // get_instance_setting - Get specific setting
  server.tool(
    'get_instance_setting',
    'Get a specific instance setting.',
    {
      instance: z.string().describe('Instance name'),
      settingName: z.string().describe('Setting name'),
    },
    async ({ instance, settingName }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const setting = await instanceService.getInstanceSetting(client, settingName);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(setting, null, 2),
          }],
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

  // update_instance_setting - Update setting (admin only)
  server.tool(
    'update_instance_setting',
    'Update an instance setting (admin only).',
    {
      instance: z.string().describe('Instance name'),
      settingName: z.string().describe('Setting name'),
      value: z.string().describe('New value (JSON string)'),
    },
    async ({ instance, settingName, value }) => {
       const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        let parsedValue;
        try {
            parsedValue = JSON.parse(value);
        } catch (e) {
             return {
                content: [{ type: 'text' as const, text: `Invalid JSON value: ${e}` }],
                isError: true,
            };
        }

        const result = await instanceService.updateInstanceSetting(client, settingName, parsedValue);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          }],
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

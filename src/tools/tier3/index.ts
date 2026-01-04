import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerUserManagementTools } from './users.js';
import { registerInstanceTools } from './instance.js';
import { registerActivityTools } from './activities.js';

export function registerTier3Tools(server: McpServer): void {
  registerUserManagementTools(server);
  registerInstanceTools(server);
  registerActivityTools(server);
}

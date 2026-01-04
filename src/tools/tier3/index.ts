/**
 * Tier 3 Tools - Admin (--admin-tools)
 * - User management
 * - Instance settings
 * - Activities
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerUserManagementTools } from './users.js';

export function registerTier3Tools(server: McpServer): void {
  registerUserManagementTools(server);
  // registerInstanceSettingTools(server);
  // registerActivityTools(server);
}

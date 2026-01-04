/**
 * MCP Server Setup
 * Registers tools based on enabled tiers
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { ToolTiers } from './index.js';

// Import tool registrations
import { registerTier1Tools } from './tools/tier1/index.js';
import { registerTier2Tools } from './tools/tier2/index.js';
import { registerTier3Tools } from './tools/tier3/index.js';

export async function startServer(tiers: ToolTiers): Promise<void> {
  const server = new McpServer({
    name: 'memos-mcp-server',
    version: '0.1.0',
  });

  // Register Tier 1 tools (always enabled)
  registerTier1Tools(server);

  // Register Tier 2 tools if enabled
  if (tiers.tier2) {
    registerTier2Tools(server);
  }

  // Register Tier 3 tools if enabled
  if (tiers.tier3) {
    registerTier3Tools(server);
  }

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

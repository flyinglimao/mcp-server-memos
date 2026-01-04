#!/usr/bin/env node
/**
 * Memos MCP Server Entry Point
 *
 * CLI Arguments:
 *   --user-tools   Enable Tier 2 tools (PAT, webhooks, settings)
 *   --admin-tools  Enable Tier 3 tools (users, instance settings)
 *   --full-tools   Enable all tools (Tier 1 + 2 + 3)
 */

import { startServer } from './server.js';

// Parse CLI arguments
const args = process.argv.slice(2);

export interface ToolTiers {
  tier1: boolean; // Always true (core note-taking)
  tier2: boolean; // User advanced (PAT, webhooks)
  tier3: boolean; // Admin (users, instance settings)
}

function parseArgs(args: string[]): ToolTiers {
  const tiers: ToolTiers = {
    tier1: true, // Always enabled
    tier2: false,
    tier3: false,
  };

  for (const arg of args) {
    switch (arg) {
      case '--user-tools':
        tiers.tier2 = true;
        break;
      case '--admin-tools':
        tiers.tier3 = true;
        break;
      case '--full-tools':
        tiers.tier2 = true;
        tiers.tier3 = true;
        break;
    }
  }

  return tiers;
}

const tiers = parseArgs(args);

// Start the MCP server
startServer(tiers).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

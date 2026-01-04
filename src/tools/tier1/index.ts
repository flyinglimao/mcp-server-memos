/**
 * Tier 1 Tools - Core Note-Taking (Always Enabled)
 * - Instance management
 * - Memo CRUD
 * - Tags
 * - Shortcuts
 * - Attachments
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerInstanceTools } from './instances.js';
import { registerMemoTools } from './memos.js';
import { registerTagTools } from './tags.js';
import { registerShortcutTools } from './shortcuts.js';
import { registerAttachmentTools } from './attachments.js';

export function registerTier1Tools(server: McpServer): void {
    registerInstanceTools(server);
    registerMemoTools(server);
    registerTagTools(server);
    registerShortcutTools(server);
    registerAttachmentTools(server);
}

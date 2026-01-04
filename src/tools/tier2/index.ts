import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerPATTools } from './pats.js';
import { registerWebhookTools } from './webhooks.js';
import { registerSettingTools } from './settings.js';
import { registerNotificationTools } from './notifications.js';

export function registerTier2Tools(server: McpServer): void {
  registerPATTools(server);
  registerWebhookTools(server);
  registerSettingTools(server);
  registerNotificationTools(server);
}

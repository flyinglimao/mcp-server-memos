/**
 * Attachment tools
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstance } from '../../config/index.js';
import { createClient, MemosApiError } from '../../api/index.js';
import type {
  Attachment,
  ListAttachmentsResponse,
  CreateAttachmentRequest,
} from '../../types/index.js';

export function registerAttachmentTools(server: McpServer): void {
  // List attachments
  server.tool(
    'list_attachments',
    'List all attachments.',
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
        const response = await client.get<ListAttachmentsResponse>('/attachments');

        if (!response.attachments?.length) {
          return {
            content: [{ type: 'text' as const, text: 'No attachments found.' }],
          };
        }

        const list = response.attachments
          .map(
            (a) =>
              `- **${a.filename}** (${a.type}, ${a.size} bytes)\n  ${a.name}${a.memo ? ` → ${a.memo}` : ''}`
          )
          .join('\n');

        return {
          content: [{ type: 'text' as const, text: `Attachments:\n${list}` }],
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

  // Upload attachment
  server.tool(
    'upload_attachment',
    'Upload a new attachment.',
    {
      instance: z.string().describe('Instance name'),
      filename: z.string().describe('Filename'),
      type: z.string().describe('MIME type (e.g., "image/png")'),
      content: z.string().describe('Base64-encoded file content'),
      memo: z.string().optional().describe('Associate with memo (e.g., "memos/123")'),
    },
    async ({ instance, filename, type, content, memo }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        const request: CreateAttachmentRequest = { filename, type, content, memo };
        const attachment = await client.post<Attachment>('/attachments', request);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Successfully uploaded attachment: ${attachment.name}`,
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

  // Delete attachment
  server.tool(
    'delete_attachment',
    'Delete an attachment.',
    {
      instance: z.string().describe('Instance name'),
      attachmentName: z.string().describe('Attachment name'),
    },
    async ({ instance, attachmentName }) => {
      const inst = await getInstance(instance);
      if (!inst) {
        return {
          content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
          isError: true,
        };
      }

      try {
        const client = createClient(inst);
        await client.delete(`/${attachmentName}`);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Successfully deleted attachment: ${attachmentName}`,
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

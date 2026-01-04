import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstance } from '../../config/index.js';
import { createClient, MemosApiError } from '../../api/index.js';
import {
    listPersonalAccessTokens,
    createPersonalAccessToken,
    deletePersonalAccessToken
} from '../../api/services/pat.js';

export function registerPATTools(server: McpServer): void {
    // List personal access tokens
    server.tool(
        'list_personal_access_tokens',
        'List all personal access tokens for a user.',
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
                const response = await listPersonalAccessTokens(client, user);

                if (!response.personalAccessTokens?.length) {
                    return {
                        content: [{ type: 'text' as const, text: 'No personal access tokens found.' }],
                    };
                }

                const list = response.personalAccessTokens
                    .map(t => `- **${t.description || 'No description'}**\n  Name: \`${t.name}\`\n  Created: ${t.createdAt}\n  Expires: ${t.expiresAt || 'Never'}`)
                    .join('\n');

                return {
                    content: [{ type: 'text' as const, text: `Personal Access Tokens:\n${list}` }],
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

    // Create personal access token
    server.tool(
        'create_personal_access_token',
        'Create a new personal access token.',
        {
            instance: z.string().describe('Instance name'),
            user: z.string().optional().default('me').describe('User ID or "me"'),
            description: z.string().optional().describe('Token description'),
            expiresAt: z.string().optional().describe('Expiration time (ISO 8601 format, e.g., "2024-12-31T23:59:59Z")'),
        },
        async ({ instance, user, description, expiresAt }) => {
            const inst = await getInstance(instance);
            if (!inst) {
                return {
                    content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
                    isError: true,
                };
            }

            try {
                const client = createClient(inst);
                const response = await createPersonalAccessToken(client, user, { description, expiresAt });

                return {
                    content: [{
                        type: 'text' as const,
                        text: `Successfully created personal access token.\n\n**Token:** \`${response.token}\`\n\n⚠️ Make sure to copy your personal access token now. You won't be able to see it again!`,
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

    // Delete personal access token
    server.tool(
        'delete_personal_access_token',
        'Delete a personal access token.',
        {
            instance: z.string().describe('Instance name'),
            patName: z.string().describe('The resource name of the PAT (e.g., "users/me/personalAccessTokens/123")'),
        },
        async ({ instance, patName }) => {
            const inst = await getInstance(instance);
            if (!inst) {
                return {
                    content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
                    isError: true,
                };
            }

            try {
                const client = createClient(inst);
                await deletePersonalAccessToken(client, patName);

                return {
                    content: [{
                        type: 'text' as const,
                        text: `Successfully deleted personal access token: ${patName}`,
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

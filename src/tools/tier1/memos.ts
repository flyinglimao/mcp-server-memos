/**
 * Memo CRUD tools
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstances, getInstance } from '../../config/index.js';
import { createClient, MemosApiError } from '../../api/index.js';
import type { Memo, ListMemosResponse, CreateMemoRequest, UpdateMemoRequest } from '../../types/index.js';

export function registerMemoTools(server: McpServer): void {
    // List memos
    server.tool(
        'list_memos',
        'List memos from one or all connected Memos instances.',
        {
            instance: z.string().optional().describe('Instance name to query. If not specified, queries all instances.'),
            filter: z.string().optional().describe('CEL filter expression (e.g., "tag == \\"important\\"")'),
            pageSize: z.number().optional().default(20).describe('Number of memos to return (default: 20, max: 1000)'),
            state: z.enum(['NORMAL', 'ARCHIVED']).optional().describe('Filter by state'),
            orderBy: z.string().optional().describe('Order by field (e.g., "display_time desc")'),
        },
        async ({ instance, filter, pageSize, state, orderBy }) => {
            const instances = instance
                ? [await getInstance(instance)].filter(Boolean)
                : await getInstances();

            if (instances.length === 0) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: instance
                            ? `Instance "${instance}" not found.`
                            : 'No instances connected. Use connect_instance first.',
                    }],
                    isError: true,
                };
            }

            const results: { instance: string; memos: Memo[] }[] = [];

            for (const inst of instances) {
                if (!inst) continue;
                try {
                    const client = createClient(inst);
                    const response = await client.get<ListMemosResponse>('/memos', {
                        pageSize,
                        filter,
                        state,
                        orderBy,
                    });
                    results.push({ instance: inst.name, memos: response.memos || [] });
                } catch (error) {
                    if (error instanceof MemosApiError) {
                        results.push({ instance: inst.name, memos: [] });
                    } else {
                        throw error;
                    }
                }
            }

            const output = results
                .map(r => {
                    if (r.memos.length === 0) {
                        return `## ${r.instance}\nNo memos found.`;
                    }
                    const memoList = r.memos
                        .map(m => {
                            const tags = m.tags?.length ? ` [${m.tags.join(', ')}]` : '';
                            const pinned = m.pinned ? ' 📌' : '';
                            const snippet = m.content.slice(0, 100).replace(/\n/g, ' ');
                            return `- **${m.name}**${pinned}${tags}\n  ${snippet}${m.content.length > 100 ? '...' : ''}`;
                        })
                        .join('\n');
                    return `## ${r.instance}\n${memoList}`;
                })
                .join('\n\n');

            return {
                content: [{ type: 'text' as const, text: output }],
            };
        }
    );

    // Get a specific memo
    server.tool(
        'get_memo',
        'Get a specific memo by its name.',
        {
            instance: z.string().describe('Instance name'),
            memoName: z.string().describe('Memo name (e.g., "memos/123")'),
        },
        async ({ instance, memoName }) => {
            const inst = await getInstance(instance);
            if (!inst) {
                return {
                    content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
                    isError: true,
                };
            }

            try {
                const client = createClient(inst);
                const memo = await client.get<Memo>(`/${memoName}`);

                const tags = memo.tags?.length ? `\n**Tags:** ${memo.tags.join(', ')}` : '';
                const pinned = memo.pinned ? ' 📌' : '';

                return {
                    content: [{
                        type: 'text' as const,
                        text: `# ${memo.name}${pinned}\n**Created:** ${memo.createTime}\n**Visibility:** ${memo.visibility}${tags}\n\n---\n\n${memo.content}`,
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

    // Create a new memo
    server.tool(
        'create_memo',
        'Create a new memo.',
        {
            instance: z.string().describe('Instance name'),
            content: z.string().describe('Memo content in Markdown format'),
            visibility: z.enum(['PRIVATE', 'PROTECTED', 'PUBLIC']).optional().default('PRIVATE').describe('Visibility'),
            pinned: z.boolean().optional().default(false).describe('Pin this memo'),
        },
        async ({ instance, content, visibility, pinned }) => {
            const inst = await getInstance(instance);
            if (!inst) {
                return {
                    content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
                    isError: true,
                };
            }

            try {
                const client = createClient(inst);
                const request: CreateMemoRequest = { content, visibility, pinned };
                const memo = await client.post<Memo>('/memos', request);

                return {
                    content: [{
                        type: 'text' as const,
                        text: `Successfully created memo: ${memo.name}`,
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

    // Update a memo
    server.tool(
        'update_memo',
        'Update an existing memo.',
        {
            instance: z.string().describe('Instance name'),
            memoName: z.string().describe('Memo name (e.g., "memos/123")'),
            content: z.string().optional().describe('New content'),
            visibility: z.enum(['PRIVATE', 'PROTECTED', 'PUBLIC']).optional().describe('New visibility'),
            pinned: z.boolean().optional().describe('Pin/unpin this memo'),
            state: z.enum(['NORMAL', 'ARCHIVED']).optional().describe('New state'),
        },
        async ({ instance, memoName, content, visibility, pinned, state }) => {
            const inst = await getInstance(instance);
            if (!inst) {
                return {
                    content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
                    isError: true,
                };
            }

            // Build update mask
            const updateFields: string[] = [];
            const request: UpdateMemoRequest = {};

            if (content !== undefined) { request.content = content; updateFields.push('content'); }
            if (visibility !== undefined) { request.visibility = visibility; updateFields.push('visibility'); }
            if (pinned !== undefined) { request.pinned = pinned; updateFields.push('pinned'); }
            if (state !== undefined) { request.state = state; updateFields.push('state'); }

            if (updateFields.length === 0) {
                return {
                    content: [{ type: 'text' as const, text: 'No fields to update.' }],
                    isError: true,
                };
            }

            try {
                const client = createClient(inst);
                const memo = await client.patch<Memo>(`/${memoName}`, request, {
                    updateMask: updateFields.join(','),
                });

                return {
                    content: [{
                        type: 'text' as const,
                        text: `Successfully updated memo: ${memo.name}`,
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

    // Delete a memo
    server.tool(
        'delete_memo',
        'Delete a memo.',
        {
            instance: z.string().describe('Instance name'),
            memoName: z.string().describe('Memo name (e.g., "memos/123")'),
        },
        async ({ instance, memoName }) => {
            const inst = await getInstance(instance);
            if (!inst) {
                return {
                    content: [{ type: 'text' as const, text: `Instance "${instance}" not found.` }],
                    isError: true,
                };
            }

            try {
                const client = createClient(inst);
                await client.delete(`/${memoName}`);

                return {
                    content: [{
                        type: 'text' as const,
                        text: `Successfully deleted memo: ${memoName}`,
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

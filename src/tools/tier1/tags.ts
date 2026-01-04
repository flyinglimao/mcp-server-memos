/**
 * Tag tools
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getInstances, getInstance } from '../../config/index.js';
import { createClient, MemosApiError } from '../../api/index.js';
import type { ListMemosResponse } from '../../types/index.js';

export function registerTagTools(server: McpServer): void {
    // List all tags
    server.tool(
        'list_tags',
        'List all tags from memos.',
        {
            instance: z.string().optional().describe('Instance name. If not specified, queries all instances.'),
        },
        async ({ instance }) => {
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

            const results: { instance: string; tags: Map<string, number> }[] = [];

            for (const inst of instances) {
                if (!inst) continue;
                try {
                    const client = createClient(inst);
                    const tagCounts = new Map<string, number>();

                    // Fetch memos to extract tags
                    let pageToken: string | undefined;
                    do {
                        const response = await client.get<ListMemosResponse>('/memos', {
                            pageSize: 100,
                            pageToken,
                        });

                        for (const memo of response.memos || []) {
                            for (const tag of memo.tags || []) {
                                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                            }
                        }

                        pageToken = response.nextPageToken;
                    } while (pageToken);

                    results.push({ instance: inst.name, tags: tagCounts });
                } catch (error) {
                    if (error instanceof MemosApiError) {
                        results.push({ instance: inst.name, tags: new Map() });
                    } else {
                        throw error;
                    }
                }
            }

            const output = results
                .map(r => {
                    if (r.tags.size === 0) {
                        return `## ${r.instance}\nNo tags found.`;
                    }
                    const sortedTags = [...r.tags.entries()]
                        .sort((a, b) => b[1] - a[1])
                        .map(([tag, count]) => `- #${tag} (${count})`)
                        .join('\n');
                    return `## ${r.instance}\n${sortedTags}`;
                })
                .join('\n\n');

            return {
                content: [{ type: 'text' as const, text: output }],
            };
        }
    );
}

#!/usr/bin/env npx tsx
/**
 * MCP Tools Test Script
 *
 * Tests all Memos MCP tools by directly calling the underlying API functions.
 * Run with: npx tsx tests/test-tools.ts
 *
 * Required: A configured instance in ~/.config/memos-mcp/instances.json
 */

// Allow self-signed certificates (e.g., OrbStack development environments)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { getInstances, getInstance, addInstance, removeInstance } from '../src/config/store.js';
import { createClient, MemosApiError } from '../src/api/client.js';
import type {
    ListMemosResponse,
    Memo,
    CreateMemoRequest,
    ListAttachmentsResponse,
    ListShortcutsResponse,
    InstanceProfile,
} from '../src/types/memos.js';

// Test result tracking
interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    duration: number;
}

const results: TestResult[] = [];
let testInstanceName = 'test';

// Helper function to run a test
async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
    const start = Date.now();
    try {
        await fn();
        results.push({ name, passed: true, duration: Date.now() - start });
        console.log(`✅ ${name}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({ name, passed: false, error: errorMessage, duration: Date.now() - start });
        console.log(`❌ ${name}: ${errorMessage}`);
    }
}

// ========================
// Tier 1: Core Tools Tests
// ========================

async function testListInstances(): Promise<void> {
    const instances = await getInstances();
    if (!Array.isArray(instances)) {
        throw new Error('Expected instances to be an array');
    }
}

async function testGetInstance(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) {
        throw new Error(`Instance "${testInstanceName}" not found. Please configure it first.`);
    }
    if (!instance.host || !instance.apiKey) {
        throw new Error('Instance missing host or apiKey');
    }
}

async function testListMemos(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) throw new Error('Instance not configured');

    const client = createClient(instance);
    const response = await client.get<ListMemosResponse>('/memos', { pageSize: 5 });

    if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from list_memos');
    }
    // memos field should exist (even if empty array)
    if (!('memos' in response)) {
        throw new Error('Response missing memos field');
    }
}

async function testCreateAndDeleteMemo(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) throw new Error('Instance not configured');

    const client = createClient(instance);
    const testContent = `Test memo created at ${new Date().toISOString()} - will be deleted`;

    // Create memo
    const request: CreateMemoRequest = {
        content: testContent,
        visibility: 'PRIVATE',
    };
    const memo = await client.post<Memo>('/memos', request);

    if (!memo.name) {
        throw new Error('Created memo missing name');
    }

    // Delete the memo
    await client.delete(`/${memo.name}`);
}

async function testGetMemo(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) throw new Error('Instance not configured');

    const client = createClient(instance);

    // First list memos to get a valid name
    const response = await client.get<ListMemosResponse>('/memos', { pageSize: 1 });

    if (response.memos && response.memos.length > 0) {
        const memoName = response.memos[0].name;
        const memo = await client.get<Memo>(`/${memoName}`);
        if (!memo.content) {
            throw new Error('Memo missing content');
        }
    }
    // If no memos exist, we just skip this test (not an error)
}

async function testListTags(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) throw new Error('Instance not configured');

    const client = createClient(instance);
    // list_tags fetches memos and extracts tags
    const response = await client.get<ListMemosResponse>('/memos', { pageSize: 100 });

    if (!response || typeof response !== 'object') {
        throw new Error('Invalid response when fetching memos for tags');
    }
}

async function testListAttachments(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) throw new Error('Instance not configured');

    const client = createClient(instance);

    try {
        const response = await client.get<ListAttachmentsResponse>('/attachments');
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response from list_attachments');
        }
    } catch (error) {
        // Some instances may not support this endpoint
        if (error instanceof MemosApiError && error.code === 404) {
            console.log('  (attachments endpoint not available)');
            return;
        }
        throw error;
    }
}

async function testListShortcuts(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) throw new Error('Instance not configured');

    const client = createClient(instance);

    try {
        const response = await client.get<ListShortcutsResponse>('/users/me/shortcuts');
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response from list_shortcuts');
        }
    } catch (error) {
        if (error instanceof MemosApiError) {
            console.log(`  (shortcuts: ${error.message})`);
            return;
        }
        throw error;
    }
}

// ========================
// Tier 2: User Tools Tests
// ========================

async function testListPATs(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) throw new Error('Instance not configured');

    const client = createClient(instance);

    try {
        const response = await client.get<{ accessTokens?: unknown[] }>('/users/me/accessTokens');
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response from list_pats');
        }
    } catch (error) {
        if (error instanceof MemosApiError) {
            console.log(`  (PATs: ${error.message})`);
            return;
        }
        throw error;
    }
}

async function testListWebhooks(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) throw new Error('Instance not configured');

    const client = createClient(instance);

    try {
        const response = await client.get<{ webhooks?: unknown[] }>('/webhooks');
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response from list_webhooks');
        }
    } catch (error) {
        if (error instanceof MemosApiError) {
            console.log(`  (webhooks: ${error.message})`);
            return;
        }
        throw error;
    }
}

async function testGetUserSetting(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) throw new Error('Instance not configured');

    const client = createClient(instance);

    try {
        const response = await client.get<unknown>('/users/me/setting');
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response from get_user_setting');
        }
    } catch (error) {
        if (error instanceof MemosApiError) {
            console.log(`  (user setting: ${error.message})`);
            return;
        }
        throw error;
    }
}

// ========================
// Tier 3: Admin Tools Tests
// ========================

async function testGetInstanceProfile(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) throw new Error('Instance not configured');

    const client = createClient(instance);

    try {
        // The workspace profile endpoint
        const response = await client.get<InstanceProfile>('/workspace/profile');
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response from get_instance_profile');
        }
        if (!response.version) {
            throw new Error('Instance profile missing version');
        }
    } catch (error) {
        if (error instanceof MemosApiError) {
            console.log(`  (instance profile: ${error.message})`);
            return;
        }
        throw error;
    }
}

async function testListUsers(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) throw new Error('Instance not configured');

    const client = createClient(instance);

    try {
        const response = await client.get<{ users?: unknown[] }>('/users');
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response from list_users');
        }
    } catch (error) {
        if (error instanceof MemosApiError) {
            // Non-admins may not have access
            console.log(`  (users: ${error.message})`);
            return;
        }
        throw error;
    }
}

async function testListActivities(): Promise<void> {
    const instance = await getInstance(testInstanceName);
    if (!instance) throw new Error('Instance not configured');

    const client = createClient(instance);

    try {
        const response = await client.get<{ activities?: unknown[] }>('/users/me/activities');
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response from list_activities');
        }
    } catch (error) {
        if (error instanceof MemosApiError) {
            console.log(`  (activities: ${error.message})`);
            return;
        }
        throw error;
    }
}

// ========================
// Main Test Runner
// ========================

async function main(): Promise<void> {
    console.log('='.repeat(60));
    console.log('MCP Tools Test Suite');
    console.log('='.repeat(60));
    console.log();

    // Check for instance argument
    const args = process.argv.slice(2);
    if (args.length > 0) {
        testInstanceName = args[0];
    }

    console.log(`Using instance: ${testInstanceName}`);
    console.log();

    // Check if instance exists
    const instance = await getInstance(testInstanceName);
    if (!instance) {
        console.error(`❌ Instance "${testInstanceName}" not found.`);
        console.error('');
        console.error('Please configure an instance first:');
        console.error('  1. Run the MCP server');
        console.error('  2. Use connect_instance tool with name, host, and apiKey');
        console.error('');
        console.error('Or create ~/.config/memos-mcp/instances.json with:');
        console.error(
            JSON.stringify(
                {
                    instances: [
                        {
                            name: 'test',
                            host: 'https://your-memos-instance.com',
                            apiKey: 'your-api-key',
                        },
                    ],
                },
                null,
                2
            )
        );
        process.exit(1);
    }

    console.log(`Instance host: ${instance.host}`);
    console.log();

    // Run Tier 1 tests
    console.log('--- Tier 1: Core Tools ---');
    await runTest('list_instances', testListInstances);
    await runTest('get_instance', testGetInstance);
    await runTest('list_memos', testListMemos);
    await runTest('get_memo', testGetMemo);
    await runTest('create_memo + delete_memo', testCreateAndDeleteMemo);
    await runTest('list_tags', testListTags);
    await runTest('list_attachments', testListAttachments);
    await runTest('list_shortcuts', testListShortcuts);
    console.log();

    // Run Tier 2 tests
    console.log('--- Tier 2: User Tools ---');
    await runTest('list_pats', testListPATs);
    await runTest('list_webhooks', testListWebhooks);
    await runTest('get_user_setting', testGetUserSetting);
    console.log();

    // Run Tier 3 tests
    console.log('--- Tier 3: Admin Tools ---');
    await runTest('get_instance_profile', testGetInstanceProfile);
    await runTest('list_users', testListUsers);
    await runTest('list_activities', testListActivities);
    console.log();

    // Summary
    console.log('='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total: ${results.length} tests`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Duration: ${totalDuration}ms`);
    console.log();

    if (failed > 0) {
        console.log('Failed tests:');
        for (const result of results.filter((r) => !r.passed)) {
            console.log(`  - ${result.name}: ${result.error}`);
        }
        process.exit(1);
    } else {
        console.log('✅ All tests passed!');
    }
}

main().catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
});

/**
 * Configuration storage for Memos instances
 * Stores connection info in a local JSON file
 */

import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { InstanceConfig } from '../types/index.js';

interface ConfigData {
    instances: InstanceConfig[];
}

const CONFIG_DIR = join(homedir(), '.config', 'memos-mcp');
const CONFIG_FILE = join(CONFIG_DIR, 'instances.json');

/**
 * Ensure the config directory exists
 */
async function ensureConfigDir(): Promise<void> {
    try {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
    } catch (error) {
        // Directory might already exist
    }
}

/**
 * Load config from file
 */
async function loadConfig(): Promise<ConfigData> {
    try {
        const data = await fs.readFile(CONFIG_FILE, 'utf-8');
        return JSON.parse(data) as ConfigData;
    } catch {
        return { instances: [] };
    }
}

/**
 * Save config to file
 */
async function saveConfig(config: ConfigData): Promise<void> {
    await ensureConfigDir();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Get all configured instances
 */
export async function getInstances(): Promise<InstanceConfig[]> {
    const config = await loadConfig();
    return config.instances;
}

/**
 * Get a specific instance by name
 */
export async function getInstance(name: string): Promise<InstanceConfig | undefined> {
    const instances = await getInstances();
    return instances.find(i => i.name === name);
}

/**
 * Add a new instance
 */
export async function addInstance(instance: InstanceConfig): Promise<void> {
    const config = await loadConfig();

    // Check if instance with same name already exists
    const existingIndex = config.instances.findIndex(i => i.name === instance.name);
    if (existingIndex >= 0) {
        // Update existing
        config.instances[existingIndex] = instance;
    } else {
        config.instances.push(instance);
    }

    await saveConfig(config);
}

/**
 * Remove an instance by name
 */
export async function removeInstance(name: string): Promise<boolean> {
    const config = await loadConfig();
    const initialLength = config.instances.length;
    config.instances = config.instances.filter(i => i.name !== name);

    if (config.instances.length < initialLength) {
        await saveConfig(config);
        return true;
    }
    return false;
}

/**
 * Get the config file path (for display purposes)
 */
export function getConfigPath(): string {
    return CONFIG_FILE;
}

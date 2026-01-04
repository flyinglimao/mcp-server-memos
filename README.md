# Memos MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for [Memos](https://github.com/usememos/memos), enabling AI assistants to interact with your Memos instances.

## Features

- 🔗 **Multi-Instance Support**: Connect to multiple Memos instances and query them individually or collectively
- 📝 **Note Management**: Create, read, update, and delete memos with full Markdown support
- 🏷️ **Tag Management**: List and manage tags across your memos
- 📎 **Attachment Support**: Upload and manage file attachments
- 🔖 **Shortcuts**: Create and manage saved filters
- 🔒 **Secure Storage**: API keys are stored locally in your configuration directory
- 🎚️ **Tiered Tool Exposure**: Control which tools are enabled to minimize context usage

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/memos-mcp-server.git
cd memos-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Adding Your First Instance

When you first start using the MCP server, you'll need to add a Memos instance:

1. Get your API key from your Memos instance:
   - Go to Settings → My Account → Access Tokens
   - Create a new access token
   
2. Connect the instance using the `connect_instance` tool:
   ```
   Host: https://your-memos-instance.com
   Name: my-memos (optional friendly name)
   API Key: your-access-token
   ```

### Configuration File Location

Instance configurations are stored at:
- **macOS/Linux**: `~/.config/memos-mcp/instances.json`
- **Windows**: `%APPDATA%\memos-mcp\instances.json`

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "memos": {
      "command": "node",
      "args": ["/path/to/memos-mcp-server/dist/index.js"]
    }
  }
}
```

### Tool Tiers

The server supports three tiers of tools to minimize context usage:

| Tier | Flag | Description |
|------|------|-------------|
| **Tier 1** | (default) | Core note-taking tools |
| **Tier 2** | `--user-tools` | User advanced features (PAT, webhooks) |
| **Tier 3** | `--admin-tools` | Instance administration |
| **All** | `--full-tools` | All tools enabled |

Example configurations:

```json
// Default: Only note-taking tools
{
  "args": ["/path/to/dist/index.js"]
}

// With user advanced tools
{
  "args": ["/path/to/dist/index.js", "--user-tools"]
}

// With admin tools
{
  "args": ["/path/to/dist/index.js", "--admin-tools"]
}

// All tools
{
  "args": ["/path/to/dist/index.js", "--full-tools"]
}
```

## Available Tools

### Tier 1: Core Tools (Default)

| Tool | Description |
|------|-------------|
| `connect_instance` | Connect to a new Memos instance |
| `disconnect_instance` | Remove a connected instance |
| `list_instances` | List all connected instances |
| `list_memos` | List memos with optional filtering |
| `get_memo` | Get a specific memo by ID |
| `create_memo` | Create a new memo |
| `update_memo` | Update an existing memo |
| `delete_memo` | Delete a memo |
| `list_tags` | List all tags |
| `list_shortcuts` | List saved shortcuts |
| `create_shortcut` | Create a new shortcut |
| `update_shortcut` | Update a shortcut |
| `delete_shortcut` | Delete a shortcut |
| `list_attachments` | List attachments |
| `upload_attachment` | Upload a new attachment |
| `delete_attachment` | Delete an attachment |

### Tier 2: User Advanced Tools (--user-tools)

| Tool | Description |
|------|-------------|
| `list_personal_access_tokens` | List PATs for a user |
| `create_personal_access_token` | Create a new PAT |
| `delete_personal_access_token` | Delete a PAT |
| `list_webhooks` | List webhooks for a user |
| `create_webhook` | Create a new webhook |
| `update_webhook` | Update a webhook |
| `delete_webhook` | Delete a webhook |
| `get_user_setting` | Get user settings |
| `update_user_setting` | Update user settings |
| `list_notifications` | List user notifications |
| `update_notification` | Update a notification |
| `delete_notification` | Delete a notification |

### Tier 3: Admin Tools (--admin-tools)

| Tool | Description |
|------|-------------|
| `list_users` | List all users |
| `create_user` | Create a new user |
| `update_user` | Update a user |
| `delete_user` | Delete a user |
| `get_instance_profile` | Get instance information |
| `get_instance_setting` | Get instance settings |
| `update_instance_setting` | Update instance settings |
| `list_activities` | List activities |
| `get_activity` | Get a specific activity |

## Examples

### Searching Across All Instances

> "Find all memos containing 'project ideas' in all my memos instances"

The server will query all connected instances and return matching results.

### Querying a Specific Instance

> "Create a new memo in my work-memos instance about the meeting today"

The server will create the memo only in the specified instance.

### Using Filters

> "List all archived memos with the #important tag"

The server supports CEL filter expressions for advanced queries.

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

# Agent Instructions for memos-mcp-server

This document provides context and instructions for AI agents working on this project.

## Project Overview

This is a **Model Context Protocol (MCP) Server** for [Memos](https://github.com/usememos/memos), a privacy-focused note-taking application. The MCP server allows AI assistants to interact with Memos instances programmatically.

## Key Features

1. **Multi-Instance Support**: Connect to multiple Memos instances simultaneously
2. **Dynamic Instance Selection**: Query specific instances or all instances at once
3. **Instance Management**: Add, remove, and store connection credentials
4. **Three-Tier Tool Exposure**: Control context usage with `--user-tools`, `--admin-tools`, or `--full-tools`

## Architecture

```
src/
├── index.ts              # Entry point with CLI argument parsing
├── server.ts             # MCP server setup and tool registration
├── config/
│   └── store.ts          # Persistent storage for instance connections
├── api/
│   ├── client.ts         # Base API client for Memos
│   └── services/         # Individual API service implementations
│       ├── memo.ts       # Memo CRUD operations
│       ├── attachment.ts # Attachment management
│       ├── shortcut.ts   # Shortcuts (saved filters)
│       ├── pat.ts        # Personal Access Tokens (user-tools)
│       ├── webhook.ts    # Webhooks (user-tools)
│       ├── user.ts       # User management (admin-tools)
│       ├── instance.ts   # Instance info (admin-tools)
│       └── activity.ts   # Activity logs (admin-tools)
└── tools/
    ├── tier1/            # Default tools (notes)
    │   ├── instances.ts  # Instance connection tools
    │   ├── memos.ts      # Memo tools
    │   ├── tags.ts       # Tag tools
    │   ├── shortcuts.ts  # Shortcut tools
    │   └── attachments.ts# Attachment tools
    ├── tier2/            # User advanced tools (--user-tools)
    │   ├── pats.ts       # PAT tools
    │   ├── webhooks.ts   # Webhook tools
    │   ├── settings.ts   # User settings tools
    │   └── notifications.ts # Notification tools
    └── tier3/            # Admin tools (--admin-tools)
        ├── users.ts      # User management tools
        ├── instance.ts   # Instance settings tools
        └── activities.ts # Activity tools
```

## Tool Tiers

### Tier 1 (Default) - Note-Taking
Always enabled. Core functionality for managing memos.

| Tools |
|-------|
| connect_instance, disconnect_instance, list_instances |
| list_memos, get_memo, create_memo, update_memo, delete_memo |
| list_tags |
| list_shortcuts, create_shortcut, update_shortcut, delete_shortcut |
| list_attachments, upload_attachment, delete_attachment |

### Tier 2 (--user-tools) - User Advanced
User-level advanced features for API access and integrations.

| Tools |
|-------|
| list_personal_access_tokens, create_personal_access_token, delete_personal_access_token |
| list_webhooks, create_webhook, update_webhook, delete_webhook |
| get_user_setting, update_user_setting |
| list_notifications, update_notification, delete_notification |

### Tier 3 (--admin-tools) - Instance Administration
Admin-level tools for managing users and instance settings.

| Tools |
|-------|
| list_users, create_user, update_user, delete_user |
| get_instance_profile, get_instance_setting, update_instance_setting |
| list_activities, get_activity |

### Full Mode (--full-tools)
Enables all tiers (Tier 1 + Tier 2 + Tier 3).

## API Reference

- Base URL: `/api/v1` on each Memos instance
- Authentication: Bearer Token (from Memos account settings)
- Pagination: `pageSize` and `pageToken` query parameters
- Filtering: CEL expressions following Google AIP-160

## Development Guidelines

### Code Style
- Use TypeScript with strict mode
- Follow ESLint + Prettier configuration
- Use async/await for all API calls
- Implement proper error handling with typed errors

### Testing
- Unit tests for API client methods
- Integration tests for tool handlers
- Mock Memos API responses for testing

### Adding New Tools
1. Determine which tier the tool belongs to
2. Implement API method in `src/api/services/`
3. Create tool handler in the appropriate `src/tools/tierX/` directory
4. Register tool in `src/server.ts` with tier check
5. Update this documentation

## Configuration Storage

Instance connection info is stored at:
- macOS: `~/.config/memos-mcp/instances.json`
- Linux: `~/.config/memos-mcp/instances.json`
- Windows: `%APPDATA%\memos-mcp\instances.json`

Format:
```json
{
  "instances": [
    {
      "name": "personal",
      "host": "https://memos.example.com",
      "apiKey": "your-api-key"
    }
  ]
}
```

## CLI Arguments

| Argument | Description |
|----------|-------------|
| (default) | Only Tier 1 tools (note-taking) |
| `--user-tools` | Enable Tier 1 + Tier 2 tools |
| `--admin-tools` | Enable Tier 1 + Tier 3 tools |
| `--full-tools` | Enable all tools (Tier 1 + 2 + 3) |

## Related Documentation

- [Memos API Reference](https://usememos.com/docs/api)
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Memos GitHub Repository](https://github.com/usememos/memos)

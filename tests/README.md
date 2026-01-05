# MCP Tools Test Suite

This directory contains tests for verifying that all MCP tools work correctly.

## Prerequisites

1. **Configure a Memos Instance**

   Create or update `~/.config/memos-mcp/instances.json`:

   ```json
   {
     "instances": [
       {
         "name": "test",
         "host": "https://your-memos-instance.com",
         "apiKey": "your-api-key"
       }
     ]
   }
   ```

   Or use the MCP `connect_instance` tool.

2. **Get an API Key**

   In your Memos instance:
   - Go to Settings → My Account → Access Tokens
   - Create a new token with read/write permissions

## Running Tests

```bash
# Run with default instance ('test')
pnpm test:tools

# Run with a specific instance name
pnpm test:tools rnd
```

## Test Coverage

### Tier 1: Core Tools (Always enabled)
- `list_instances` - List configured instances
- `get_instance` - Get specific instance config
- `list_memos` - List memos from an instance
- `get_memo` - Get a specific memo
- `create_memo` + `delete_memo` - Create and delete a memo
- `list_tags` - List all tags
- `list_attachments` - List attachments
- `list_shortcuts` - List shortcuts

### Tier 2: User Tools (--user-tools flag)
- `list_pats` - List personal access tokens
- `list_webhooks` - List webhooks
- `get_user_setting` - Get user settings

### Tier 3: Admin Tools (--admin-tools flag)
- `get_instance_profile` - Get workspace profile
- `list_users` - List all users
- `list_activities` - List user activities

## Expected Results

Some endpoints may return:
- **404 Not Found**: Endpoint not available in this Memos version
- **authentication required**: Token expired or lacks required permissions

These are handled gracefully and shown in the test output.

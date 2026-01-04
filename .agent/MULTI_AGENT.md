# Multi-Agent Development Guide

This document provides prompts and context for multiple AI agents to work on different parts of the Memos MCP Server simultaneously.

## Current Project Status

- ✅ Project setup complete (pnpm, TypeScript, MCP SDK)
- ✅ Core infrastructure (types, config store, API client)
- ✅ Tier 1 tools implemented (instances, memos, tags, shortcuts, attachments)
- 🔲 Tier 2 tools (PAT, webhooks, settings, notifications)
- 🔲 Tier 3 tools (users, instance settings, activities)

## Agent Task Assignments

### Agent A: Tier 2 - PAT & Webhook Tools

**Prompt:**
```
You are working on the memos-mcp-server project. Your task is to implement Tier 2 tools for Personal Access Token (PAT) and Webhook management.

Reference files:
- src/tools/tier1/instances.ts (example of tool implementation)
- src/types/memos.ts (type definitions already exist)
- src/api/client.ts (API client)
- docs/API_REFERENCE.md (API endpoints)

Tasks:
1. Create src/api/services/pat.ts with:
   - listPersonalAccessTokens(client, user)
   - createPersonalAccessToken(client, user, data)
   - deletePersonalAccessToken(client, name)

2. Create src/api/services/webhook.ts with:
   - listUserWebhooks(client, user)
   - createUserWebhook(client, user, data)
   - updateUserWebhook(client, name, data)
   - deleteUserWebhook(client, name)

3. Create src/tools/tier2/pats.ts with MCP tools:
   - list_personal_access_tokens
   - create_personal_access_token
   - delete_personal_access_token

4. Create src/tools/tier2/webhooks.ts with MCP tools:
   - list_webhooks
   - create_webhook
   - update_webhook
   - delete_webhook

5. Update src/tools/tier2/index.ts to register these tools

Follow the patterns in existing tier1 tools. Use zod for parameter validation.
```

---

### Agent B: Tier 2 - Settings & Notification Tools

**Prompt:**
```
You are working on the memos-mcp-server project. Your task is to implement Tier 2 tools for User Settings and Notifications.

Reference files:
- src/tools/tier1/shortcuts.ts (similar pattern for user-scoped resources)
- src/types/memos.ts (type definitions)
- src/api/client.ts (API client)
- docs/API_REFERENCE.md (API endpoints)

Tasks:
1. Create src/api/services/userSetting.ts with:
   - getUserSetting(client, name)
   - updateUserSetting(client, name, data)
   - listUserSettings(client, user)

2. Create src/api/services/notification.ts with:
   - listUserNotifications(client, user)
   - updateUserNotification(client, name, data)
   - deleteUserNotification(client, name)

3. Create src/tools/tier2/settings.ts with MCP tools:
   - get_user_setting
   - update_user_setting

4. Create src/tools/tier2/notifications.ts with MCP tools:
   - list_notifications
   - update_notification
   - delete_notification

5. Update src/tools/tier2/index.ts to register these tools

Follow the patterns in existing tier1 tools.
```

---

### Agent C: Tier 3 - User Management Tools

**Prompt:**
```
You are working on the memos-mcp-server project. Your task is to implement Tier 3 tools for User Management (admin functionality).

Reference files:
- src/tools/tier1/memos.ts (CRUD pattern example)
- src/types/memos.ts (User type already defined)
- src/api/client.ts (API client)
- docs/API_REFERENCE.md (API endpoints)

Tasks:
1. Create src/api/services/user.ts with:
   - listUsers(client, options)
   - getUser(client, name)
   - createUser(client, data)
   - updateUser(client, name, data)
   - deleteUser(client, name)

2. Create src/tools/tier3/users.ts with MCP tools:
   - list_users
   - get_user
   - create_user
   - update_user
   - delete_user

3. Update src/tools/tier3/index.ts to register these tools

These are admin-level tools. Include proper error handling for permission denied errors.
```

---

### Agent D: Tier 3 - Instance & Activity Tools

**Prompt:**
```
You are working on the memos-mcp-server project. Your task is to implement Tier 3 tools for Instance Settings and Activity viewing.

Reference files:
- src/tools/tier1/instances.ts (instance-related patterns)
- src/types/memos.ts (InstanceProfile, Activity types)
- src/api/client.ts (API client)
- docs/API_REFERENCE.md (API endpoints)

Tasks:
1. Create src/api/services/instance.ts with:
   - getInstanceProfile(client)
   - getInstanceSetting(client, name)
   - updateInstanceSetting(client, name, data)

2. Create src/api/services/activity.ts with:
   - listActivities(client, options)
   - getActivity(client, name)

3. Create src/tools/tier3/instance.ts with MCP tools:
   - get_instance_profile
   - get_instance_setting
   - update_instance_setting

4. Create src/tools/tier3/activities.ts with MCP tools:
   - list_activities
   - get_activity

5. Update src/tools/tier3/index.ts to register these tools

These are admin-level tools for system configuration.
```

---

## Coordination Rules

1. **Do not modify these shared files** (unless coordinating):
   - src/index.ts
   - src/server.ts
   - src/types/memos.ts
   - src/api/client.ts
   - src/config/*

2. **Each agent should work in their designated directories:**
   - Agent A & B: src/tools/tier2/*, src/api/services/(pat|webhook|userSetting|notification).ts
   - Agent C & D: src/tools/tier3/*, src/api/services/(user|instance|activity).ts

3. **Commit messages should include agent identifier:**
   ```
   feat(tier2): add PAT management tools [Agent-A]
   feat(tier3): add user management tools [Agent-C]
   ```

4. **After completing work, update src/tools/tierX/index.ts** to register the tools.

5. **Run `pnpm build` to verify** before committing.

## API Reference Quick Links

- PAT: `GET/POST/DELETE /api/v1/users/{user}/personalAccessTokens`
- Webhooks: `GET/POST/PATCH/DELETE /api/v1/users/{user}/webhooks`
- User Settings: `GET/PATCH /api/v1/users/{user}/settings/{setting}`
- Notifications: `GET/PATCH/DELETE /api/v1/users/{user}/notifications`
- Users: `GET/POST/PATCH/DELETE /api/v1/users`
- Instance: `GET/PATCH /api/v1/instance/*`
- Activities: `GET /api/v1/activities`

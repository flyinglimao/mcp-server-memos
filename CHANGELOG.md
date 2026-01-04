# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-04

### Added

#### Core Infrastructure
- TypeScript project setup with strict mode and ES2022 target
- Configuration storage for multi-instance management in `~/.config/memos-mcp/instances.json`
- Memos API client with Bearer token authentication
- Custom error handling with `MemosApiError` class
- Comprehensive TypeScript type definitions for Memos API

#### Tier 1: Core Note-Taking Tools (15 tools)
**Instance Management:**
- `connect_instance` - Add new Memos instance with API key
- `disconnect_instance` - Remove instance connection
- `list_instances` - List all connected instances

**Memo Operations:**
- `list_memos` - Query memos with filters, pagination, and state options
- `get_memo` - Retrieve specific memo by ID
- `create_memo` - Create new memo with visibility and pinning options
- `update_memo` - Modify memo content, state, visibility, and pinned status
- `delete_memo` - Delete memo

**Tag Management:**
- `list_tags` - Aggregate tags across memos with usage counts

**Shortcuts (Saved Filters):**
- `list_shortcuts` - List user's saved filter expressions
- `create_shortcut` - Save CEL filter expression
- `update_shortcut` - Modify saved filter
- `delete_shortcut` - Remove shortcut

**Attachments:**
- `list_attachments` - List all file attachments
- `upload_attachment` - Upload files via base64 encoding
- `delete_attachment` - Remove attachment

#### Tier 2: User Advanced Tools (11 tools, `--user-tools`)
**Personal Access Tokens:**
- `list_personal_access_tokens` - View API tokens
- `create_personal_access_token` - Generate new token
- `delete_personal_access_token` - Revoke token

**Webhooks:**
- `list_webhooks` - List configured webhooks
- `create_webhook` - Add webhook endpoint
- `update_webhook` - Modify webhook URL or display name
- `delete_webhook` - Remove webhook

**User Settings:**
- `get_user_setting` - Retrieve user preferences
- `update_user_setting` - Modify settings (locale, theme, etc.)
- `list_user_settings` - List all user settings

**Notifications:**
- `list_notifications` - View user notifications
- `update_notification` - Update notification status
- `delete_notification` - Remove notification

#### Tier 3: Admin Tools (10 tools, `--admin-tools`)
**User Management:**
- `list_users` - List all users with pagination
- `get_user` - Get specific user details
- `create_user` - Create new user with role assignment
- `update_user` - Modify user properties and permissions
- `delete_user` - Remove user

**Instance Administration:**
- `get_instance_profile` - Get instance version, mode, and owner info
- `get_instance_setting` - Retrieve system settings
- `update_instance_setting` - Modify instance configuration

**Activity Monitoring:**
- `list_activities` - View recent system activities
- `get_activity` - Get specific activity details

#### Development & Documentation
- AGENTS.md with AI agent development guidelines
- README.md with project overview and usage instructions
- docs/API_REFERENCE.md with comprehensive Memos API documentation
- CI/CD pipeline with GitHub Actions (test, lint, build)
- Automated release workflow for npm and GitHub Packages
- ESLint and Prettier configuration
- Multi-agent development support

### Fixed
- Improved API client error handling for non-JSON responses
- Better error messages with fallback to HTTP status text

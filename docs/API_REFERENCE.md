# Memos API Reference

This document summarizes the Memos API endpoints that this MCP server wraps.

## Base Information

- **Base URL**: `/api/v1` on your Memos instance (e.g., `https://memos.example.com/api/v1`)
- **Authentication**: Bearer Token in `Authorization` header
- **Pagination**: `pageSize` (max 1000) and `pageToken` query parameters
- **Filtering**: CEL expressions following [Google AIP-160](https://google.aip.dev/160)
- **Field Masks**: `updateMask` for partial updates (comma-separated field names)

## Services by Tier

| Service | Tier 1 | Tier 2 | Tier 3 |
|---------|:------:|:------:|:------:|
| Memo Service | ✅ | ✅ | ✅ |
| Attachment Service | ✅ | ✅ | ✅ |
| Shortcut Service | ✅ | ✅ | ✅ |
| PAT Service | ❌ | ✅ | ✅ |
| Webhook Service | ❌ | ✅ | ✅ |
| User Setting Service | ❌ | ✅ | ✅ |
| Notification Service | ❌ | ✅ | ✅ |
| User Service | ❌ | ❌ | ✅ |
| Instance Service | ❌ | ❌ | ✅ |
| Activity Service | ❌ | ❌ | ✅ |

---

# Tier 1 Services (Default)

## Memo Service

### List Memos
```
GET /api/v1/memos
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `pageSize` | int32 | Max items to return (default 50, max 1000) |
| `pageToken` | string | Token for next page |
| `state` | enum | `STATE_UNSPECIFIED`, `NORMAL`, `ARCHIVED` |
| `orderBy` | string | e.g., `"pinned desc, display_time desc"` |
| `filter` | string | CEL filter expression |
| `showDeleted` | boolean | Include soft-deleted memos |

**Response:**
```json
{
  "memos": [
    {
      "name": "memos/123",
      "state": "NORMAL",
      "creator": "users/1",
      "createTime": "2024-01-01T00:00:00Z",
      "updateTime": "2024-01-01T00:00:00Z",
      "displayTime": "2024-01-01T00:00:00Z",
      "content": "# Hello World\n\nThis is a memo.",
      "visibility": "PRIVATE",
      "tags": ["important", "project"],
      "pinned": false,
      "attachments": [],
      "relations": [],
      "reactions": []
    }
  ],
  "nextPageToken": "..."
}
```

### Get Memo
```
GET /api/v1/memos/{memo}
```

### Create Memo
```
POST /api/v1/memos
```

**Request Body:**
```json
{
  "content": "# My Memo\n\nContent here...",
  "state": "NORMAL",
  "visibility": "PRIVATE",
  "pinned": false,
  "attachments": [],
  "relations": []
}
```

### Update Memo
```
PATCH /api/v1/memos/{memo}?updateMask=content,visibility
```

### Delete Memo
```
DELETE /api/v1/memos/{memo}
```

---

## Attachment Service

### List Attachments
```
GET /api/v1/attachments
```

### Create Attachment
```
POST /api/v1/attachments
```

**Request Body:**
```json
{
  "filename": "image.png",
  "type": "image/png",
  "content": "<base64-encoded-content>",
  "memo": "memos/123"
}
```

### Get Attachment
```
GET /api/v1/attachments/{attachment}
```

### Delete Attachment
```
DELETE /api/v1/attachments/{attachment}
```

---

## Shortcut Service

### List Shortcuts
```
GET /api/v1/users/{user}/shortcuts
```

### Create Shortcut
```
POST /api/v1/users/{user}/shortcuts
```

**Request Body:**
```json
{
  "title": "Pinned Notes",
  "filter": "pinned == true"
}
```

### Update Shortcut
```
PATCH /api/v1/users/{user}/shortcuts/{shortcut}?updateMask=title,filter
```

### Delete Shortcut
```
DELETE /api/v1/users/{user}/shortcuts/{shortcut}
```

---

# Tier 2 Services (--user-tools)

## Personal Access Token Service

PATs are long-lived tokens for API/script access.

### List Personal Access Tokens
```
GET /api/v1/users/{user}/personalAccessTokens
```

**Response:**
```json
{
  "personalAccessTokens": [
    {
      "name": "users/1/personalAccessTokens/abc123",
      "description": "CI/CD Pipeline",
      "createdAt": "2024-01-01T00:00:00Z",
      "expiresAt": "2025-01-01T00:00:00Z",
      "lastUsedAt": "2024-06-15T10:30:00Z"
    }
  ]
}
```

### Create Personal Access Token
```
POST /api/v1/users/{user}/personalAccessTokens
```

**Request Body:**
```json
{
  "description": "My API Token",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

### Delete Personal Access Token
```
DELETE /api/v1/users/{user}/personalAccessTokens/{pat}
```

---

## Webhook Service

### List User Webhooks
```
GET /api/v1/users/{user}/webhooks
```

**Response:**
```json
{
  "webhooks": [
    {
      "name": "users/1/webhooks/hook123",
      "url": "https://example.com/webhook",
      "displayName": "Slack Notification",
      "createTime": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create User Webhook
```
POST /api/v1/users/{user}/webhooks
```

**Request Body:**
```json
{
  "url": "https://example.com/webhook",
  "displayName": "My Webhook"
}
```

### Update User Webhook
```
PATCH /api/v1/users/{user}/webhooks/{webhook}?updateMask=url,displayName
```

### Delete User Webhook
```
DELETE /api/v1/users/{user}/webhooks/{webhook}
```

---

## User Setting Service

### Get User Setting
```
GET /api/v1/users/{user}/settings/{setting}
```

### Update User Setting
```
PATCH /api/v1/users/{user}/settings/{setting}
```

### List User Settings
```
GET /api/v1/users/{user}/settings
```

---

## Notification Service

### List User Notifications
```
GET /api/v1/users/{user}/notifications
```

### Update User Notification
```
PATCH /api/v1/users/{user}/notifications/{notification}
```

### Delete User Notification
```
DELETE /api/v1/users/{user}/notifications/{notification}
```

---

# Tier 3 Services (--admin-tools)

## User Service

### List Users
```
GET /api/v1/users
```

### Create User
```
POST /api/v1/users
```

**Request Body:**
```json
{
  "username": "newuser",
  "role": "USER",
  "email": "user@example.com",
  "nickname": "New User",
  "password": "securepassword"
}
```

**Role Values:** `ROLE_UNSPECIFIED`, `HOST`, `ADMIN`, `USER`

### Get User
```
GET /api/v1/users/{user}
```

### Update User
```
PATCH /api/v1/users/{user}?updateMask=nickname,email
```

### Delete User
```
DELETE /api/v1/users/{user}
```

---

## Instance Service

### Get Instance Profile
```
GET /api/v1/instance/profile
```

**Response:**
```json
{
  "owner": "users/1",
  "version": "0.18.0",
  "mode": "prod",
  "instanceUrl": "https://memos.example.com"
}
```

### Get Instance Setting
```
GET /api/v1/instance/settings/{name}
```

### Update Instance Setting
```
PATCH /api/v1/instance/settings/{name}
```

---

## Activity Service

### List Activities
```
GET /api/v1/activities
```

### Get Activity
```
GET /api/v1/activities/{activity}
```

**Response:**
```json
{
  "name": "activities/123",
  "creator": "users/1",
  "type": "MEMO_COMMENT",
  "level": "INFO",
  "createTime": "2024-01-01T00:00:00Z",
  "payload": {
    "memoComment": {
      "memo": "memos/123",
      "relatedMemo": "memos/124"
    }
  }
}
```

---

# Common Types

### State Enum
- `STATE_UNSPECIFIED`
- `NORMAL`
- `ARCHIVED`

### Visibility Enum
- `VISIBILITY_UNSPECIFIED`
- `PRIVATE` - Only visible to creator
- `PROTECTED` - Visible to logged-in users
- `PUBLIC` - Visible to everyone

### User Role Enum
- `ROLE_UNSPECIFIED`
- `HOST` - Instance owner
- `ADMIN` - Administrator
- `USER` - Regular user

---

## Error Response

```json
{
  "code": 3,
  "message": "Invalid argument",
  "details": []
}
```

Common error codes:
- `3`: Invalid argument
- `5`: Not found
- `7`: Permission denied
- `16`: Unauthenticated

---

## Filter Expression Examples

```
# Find memos with specific tag
tag == "important"

# Find pinned memos
pinned == true

# Find memos from specific date
display_time > "2024-01-01T00:00:00Z"

# Combine conditions
tag == "work" && pinned == true
```

---

## References

- [Official Memos API Documentation](https://usememos.com/docs/api)
- [Google AIP-160 Filtering](https://google.aip.dev/160)
- [Google AIP-132 List Methods](https://google.aip.dev/132)

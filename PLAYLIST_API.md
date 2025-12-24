# Playlist API Documentation

## Overview
The Playlist Service is now fully integrated with the backend and stores all playlist data in Azure PostgreSQL. This document describes all available endpoints.

## Base URL
```
http://localhost:3000/playlists
```

## Authentication
Most endpoints require JWT authentication. Include the token in the `Authorization` header:
```
Authorization: Bearer {access_token}
```

## Endpoints

### 1. Get User's Playlists
**GET** `/playlists/user/:username`

Get all playlists owned by a specific user (public endpoint).

**Parameters:**
- `username` (string, path parameter): Username of the playlist owner

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "My Playlist",
      "username": "john_doe",
      "videoIds": ["vid1", "vid2", "vid3"],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/playlists/user/john_doe
```

---

### 2. Get Specific Playlist
**GET** `/playlists/:id`

Get details of a specific playlist by ID (public endpoint).

**Parameters:**
- `id` (string, path parameter): Playlist ID (UUID)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Playlist",
    "username": "john_doe",
    "videoIds": ["vid1", "vid2", "vid3"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
```json
{
  "statusCode": 404,
  "message": "Danh sách phát không tồn tại!"
}
```

**Example:**
```bash
curl http://localhost:3000/playlists/550e8400-e29b-41d4-a716-446655440000
```

---

### 3. Create New Playlist
**POST** `/playlists`

Create a new playlist (requires JWT authentication).

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Favorite Videos"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Danh sách phát đã được tạo!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Favorite Videos",
    "username": "john_doe",
    "videoIds": [],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
```json
{
  "statusCode": 400,
  "message": "Tên danh sách phát không được để trống!"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/playlists \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Favorite Videos"}'
```

---

### 4. Update Playlist Name
**PUT** `/playlists/:id`

Update the name of a playlist (requires JWT authentication and ownership).

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Parameters:**
- `id` (string, path parameter): Playlist ID (UUID)

**Request Body:**
```json
{
  "name": "Updated Playlist Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Danh sách phát đã được cập nhật!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Playlist Name",
    "username": "john_doe",
    "videoIds": ["vid1", "vid2"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền cập nhật danh sách phát này!"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/playlists/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Playlist Name"}'
```

---

### 5. Delete Playlist
**DELETE** `/playlists/:id`

Delete a playlist (requires JWT authentication and ownership).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Parameters:**
- `id` (string, path parameter): Playlist ID (UUID)

**Response:**
```json
{
  "success": true,
  "message": "Danh sách phát đã bị xóa!"
}
```

**Error Responses:**
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền xóa danh sách phát này!"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/playlists/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. Add Video to Playlist
**POST** `/playlists/:id/videos`

Add a video to a playlist (requires JWT authentication and ownership).

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Parameters:**
- `id` (string, path parameter): Playlist ID (UUID)

**Request Body:**
```json
{
  "videoId": "video-uuid-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video đã được thêm vào danh sách phát!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Playlist",
    "username": "john_doe",
    "videoIds": ["vid1", "vid2", "vid3", "video-uuid-123"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
```json
{
  "statusCode": 400,
  "message": "Video này đã có trong danh sách phát!"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/playlists/550e8400-e29b-41d4-a716-446655440000/videos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"videoId": "video-uuid-123"}'
```

---

### 7. Remove Video from Playlist
**DELETE** `/playlists/:id/videos/:videoId`

Remove a video from a playlist (requires JWT authentication and ownership).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Parameters:**
- `id` (string, path parameter): Playlist ID (UUID)
- `videoId` (string, path parameter): Video ID to remove

**Response:**
```json
{
  "success": true,
  "message": "Video đã được xóa khỏi danh sách phát!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Playlist",
    "username": "john_doe",
    "videoIds": ["vid1", "vid2"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
```json
{
  "statusCode": 404,
  "message": "Video không có trong danh sách phát!"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/playlists/550e8400-e29b-41d4-a716-446655440000/videos/video-uuid-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Data Model

### Playlist Entity
```typescript
{
  id: string;                    // UUID v4
  name: string;                  // Playlist name (max 100 characters)
  username: string;              // Username of the owner
  videoIds: string[];            // Array of video IDs stored in playlist
  createdAt: Date;               // ISO 8601 timestamp
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "statusCode": <HTTP_STATUS_CODE>,
  "message": "Lỗi... (Vietnamese error message)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not owner of playlist)
- `404` - Not Found (playlist/video doesn't exist)
- `500` - Internal Server Error

---

## Frontend Integration

The frontend `PlaylistService` in `src/api/services.js` provides easy wrapper methods:

```javascript
// Get user's playlists
PlaylistService.getUserPlaylists(username)

// Create new playlist
PlaylistService.createPlaylist(name)

// Get specific playlist
PlaylistService.getPlaylist(playlistId)

// Update playlist name
PlaylistService.updatePlaylist(playlistId, name)

// Delete playlist
PlaylistService.deletePlaylist(playlistId)

// Add video to playlist
PlaylistService.addVideoToPlaylist(playlistId, videoId)

// Remove video from playlist
PlaylistService.removeVideoFromPlaylist(playlistId, videoId)
```

All methods automatically include JWT token from localStorage via axios interceptor.

---

## Troubleshooting

### "Danh sách phát không tồn tại!"
- Verify the playlist ID is correct
- Ensure the playlist exists in the database
- Check if the playlist was created by the logged-in user (for edit/delete operations)

### "Bạn không có quyền..."
- Only the playlist owner can edit/delete playlists
- Check if you're logged in as the correct user
- Verify JWT token is valid and not expired

### "Token không hợp lệ!"
- JWT token has expired (24 hour expiry)
- Need to login again to get a fresh token
- Token might be malformed or corrupted

### Video already in playlist
- Check if video was already added to the playlist
- Video IDs must be valid UUIDs

---

## Notes
- All API responses include `success` and `data` fields
- Error messages are in Vietnamese for better UX
- Playlist ownership is strictly enforced (only owner can modify)
- Video IDs in playlist are stored as strings (UUID format)
- Maximum playlist name length is 100 characters

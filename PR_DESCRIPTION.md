## 🚀 feat: Real-Time WebSocket Notification Architecture with Redis Pub/Sub (Issue #1277)

### Summary

This PR replaces the existing REST polling-based notification system with a scalable, real-time architecture using **Socket.io** and **Redis Pub/Sub**. The new infrastructure ensures immediate delivery of notifications while maintaining backward compatibility with existing REST endpoints and providing automatic fallback mechanisms.

---

### 🔗 Related Issue

Closes #1277 — Real-Time WebSocket Notification Architecture with Redis Pub/Sub

---

### 🧱 Architecture Overview

**Before:**
Notifications were fetched via HTTP polling (`setInterval` every 30 seconds), causing unnecessary server load and delayed updates.

**After:**
Real-time bidirectional communication using WebSockets. 

```text
Database Write (MongoDB) ──► Notification Controller ──► CompilerService / Socket
                                                                │
                                                                ▼
                                                        Redis Pub/Sub (Adapter)
                                                                │
                                                                ▼
                                                        User-Specific Rooms
                                                                │
                                                                ▼
                                                        Client (Socket.io)
```

---

### ✨ What's Changed (Phase 1 - Backend Infrastructure)

#### New Backend Socket Infrastructure
| File | Description |
|------|-------------|
| `server/socket/constants.js` | Defined standardized event names (`notification:new`, `notification:read`, etc.), room prefixes, and socket configuration. |
| `server/socket/socketAuth.js` | JWT authentication middleware for Socket.io. Extracts tokens from handshake auth, headers, or query params, and rejects unauthorized connections. |
| `server/socket/redisAdapter.js` | Configured the `@socket.io/redis-adapter` for multi-instance communication. Includes graceful fallback to local mode if Redis is unavailable. |
| `server/socket/notificationEvents.js` | Standardized payload builders and emitters for versioned notification events. |
| `server/socket/socketServer.js` | Core Socket.io initialization, attaching auth middleware, managing user rooms (`user:{email}`), and handling offline recovery sync requests. |
| `server/socket/index.js` | Module exports for the socket subsystem. |

#### Backend Integration
| File | Change |
|------|--------|
| `server/index.js` | Integrated `initSocketServer` into the Express server startup flow, attaching it to the active HTTP server. |
| `server/controller/notificationController.js` | Updated to emit socket events (`emitNewNotification`, `emitNotificationRead`, `emitBulkRead`) **after** successful MongoDB writes. Existing REST endpoints remain intact. |
| `server/package.json` | Added `socket.io`, `ioredis`, and `@socket.io/redis-adapter` dependencies. |

#### Client-Side Foundation
| File | Description |
|------|-------------|
| `client/src/socket/socketEvents.js` | Shared event constants mirroring the server for the client. |
| `client/package.json` | Added `socket.io-client` dependency. |

---

### 🔒 Security & Authentication

- **JWT Socket Authentication:** Connections are validated using the same JWT secret as the REST API.
- **Room Isolation:** Users are strictly joined to rooms matching their authenticated email (`user:{email}`). It is impossible to listen to another user's room.
- **Safe Payload Emission:** Events are only emitted after database confirmation.

---

### 🌐 Scaling & Reliability

- **Redis Pub/Sub:** Enables horizontal scaling across multiple backend instances.
- **Graceful Fallback:** If the Redis server is unreachable, the system automatically falls back to local in-memory socket mode without crashing.
- **HTTP Fallback:** Socket.io is configured to allow transparent fallback to long-polling if WebSockets are blocked by proxies/firewalls.

---

### ⚙️ Configuration (Environment Variables)

To enable Redis, configure the following in your `.env` file:

```env
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

SOCKET_PING_TIMEOUT=20000
SOCKET_PING_INTERVAL=25000
```

---

### 🔧 Next Steps (Phase 2 - Client Implementation)

*This PR implements the core backend infrastructure. The remaining client-side features (React hooks, multi-tab sync, offline recovery, and UI updates) will be built upon this foundation.*

---

### ✅ Acceptance Criteria Checklist (Backend)

- [x] Socket.io integrated into Express server.
- [x] JWT socket authentication implemented.
- [x] User-specific rooms (`user:{email}`) implemented.
- [x] Redis Pub/Sub adapter functional with fallback.
- [x] `notificationController` updated to emit events.
- [x] Backward compatibility maintained (REST endpoints intact).
- [x] Dependencies installed (`socket.io`, `ioredis`, `@socket.io/redis-adapter`).

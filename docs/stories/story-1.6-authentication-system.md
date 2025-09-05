# Story 1.6: Authentication System Implementation

**Epic**: Epic 1: Cash Game Foundation Stabilization

## Status
Draft

## Story
**As a** User,
**I want** to register and login with secure credentials,
**so that** I have authenticated access to the poker game with persistent identity and proper security.

## Acceptance Criteria
1. Implement UserService interface to connect auth-service with database operations
2. Add password field and hashing to user registration and authentication
3. Connect existing LoginLayout and RegisterLayout components to backend APIs
4. Replace URL-based user identification with proper JWT authentication flow
5. Update existing game flows to use authenticated user context
6. Add user registration endpoint that integrates with auth-service
7. Test complete authentication flow from registration through game access

## Tasks / Subtasks
- [ ] Implement UserService Interface (AC: 1)
  - [ ] Create UserService implementation in `apps/api-server/src/services/user-service.ts`
  - [ ] Implement `findById` method using existing `db.user.findById`
  - [ ] Implement `validateCredentials` method with password verification
  - [ ] Update `apps/api-server/src/app.ts` to use real UserService instead of null returns
- [ ] Add Password Support to Database Layer (AC: 2)
  - [ ] Add password field to user creation in `packages/database-api/src/repositories/user.repository.ts`
  - [ ] Implement password hashing using bcrypt in user creation
  - [ ] Add password verification method for authentication
  - [ ] Update database schema if needed for password field
- [ ] Connect Frontend Forms to Backend (AC: 3, 6)
  - [ ] Update `RegisterLayout.tsx` form submission to call `/auth/register` endpoint
  - [ ] Update `LoginLayout.tsx` form submission to call existing `/auth/login` endpoint
  - [ ] Add user registration endpoint (`/auth/register`) to auth-service plugin
  - [ ] Handle JWT token storage and management in client
- [ ] Replace URL Authentication System (AC: 4)
  - [ ] Remove URL parameter logic from `apps/client/src/routes/index.tsx`
  - [ ] Add authentication check and redirect logic for protected routes
  - [ ] Update user context to use JWT token instead of localStorage user
  - [ ] Add logout functionality using existing `/auth/logout` endpoint
- [ ] Update Game Flow Integration (AC: 5)
  - [ ] Modify game joining to use authenticated user ID from JWT
  - [ ] Update Socket.io connections to authenticate using JWT tokens
  - [ ] Ensure all existing game functionality works with authenticated users
  - [ ] Test user session persistence across page refreshes

## Dev Notes

### Previous Story Insights
From Story 1.1 findings: The current system uses URL parameters (?username=test) for user identification and stores users in localStorage. This is a temporary testing mechanism that needs complete replacement with proper authentication.

## Current Authentication Implementation Status

### ✅ Already Implemented Components

**Auth Service Package** (`packages/auth-service/`):
- ✅ **JWT Plugin Integration**: `fastify-auth.plugin.ts` with full JWT token management
- ✅ **Token Service**: `core/token-service.ts` with `generateAuthTokens()`, `verifyToken()` functions
- ✅ **Authentication Routes**: `/auth/login`, `/auth/refresh`, `/auth/logout` endpoints already built
- ✅ **Fastify Integration**: Plugin registered in `apps/api-server/src/app.ts` line 26
- ✅ **TypeScript Interfaces**: `UserService` interface defined (lines 12-15 in plugin)

**Frontend Components**:
- ✅ **Registration Form**: `apps/client/src/components/layout/RegisterLayout.tsx` with full validation
- ✅ **Login Form**: `apps/client/src/components/layout/LoginLayout.tsx` with validation
- ✅ **Form Validation**: Both forms use Zod schemas and TanStack Form

**Database Layer**:
- ✅ **User Repository**: `packages/database-api/src/repositories/user.repository.ts` with CRUD operations
- ✅ **User Routes**: `apps/api-server/src/routes/users/handler.ts` with user management
- ✅ **Database Schema**: User table exists with id, username, email, phone, role fields

### ❌ Missing Implementation Pieces

**Critical Missing Connections**:
- ❌ **UserService Implementation**: `apps/api-server/src/app.ts` lines 29-32 return `null` instead of real user service
- ❌ **Password Support**: Database layer has no password field or hashing
- ❌ **Registration Endpoint**: No `/auth/register` endpoint (only login/refresh/logout exist)
- ❌ **Frontend API Integration**: Forms don't connect to backend endpoints
- ❌ **JWT Token Management**: Client has no token storage/management logic

**Current Broken Flow**:
1. Auth service plugin is registered but UserService methods return `null`
2. Login endpoint exists but can't validate credentials (no password support)
3. Frontend forms exist but submit handlers only console.log
4. URL parameter system still active in `apps/client/src/routes/index.tsx`

## What Needs to Be Implemented

### 🔧 High Priority Implementation Tasks

**1. UserService Implementation** (Critical - Unblocks everything else):
```typescript
// Create: apps/api-server/src/services/user-service.ts
interface UserService {
  findById: (id: string) => Promise<User | null>;
  validateCredentials: (username: string, password: string) => Promise<User | null>;
}
```

**2. Password Support** (Critical - Required for authentication):
- Add `password` field to user database schema
- Add bcrypt password hashing to `user.repository.ts`
- Add password validation method

**3. Registration Endpoint** (High - Complete the auth flow):
- Add `/auth/register` endpoint to auth-service plugin
- Connect to user creation with password hashing

**4. Frontend Integration** (High - Connect existing forms):
- Update `RegisterLayout.tsx` and `LoginLayout.tsx` form submissions
- Add JWT token storage and management
- Replace URL parameter system

### 📋 Implementation Sequence

**Phase 1: Backend Foundation**
1. Create UserService implementation
2. Add password support to database layer
3. Update app.ts to use real UserService
4. Add registration endpoint

**Phase 2: Frontend Connection** 
1. Update form submissions to call backend APIs
2. Add JWT token management
3. Remove URL parameter authentication

**Phase 3: Integration**
1. Update game flows to use authenticated users
2. Test complete authentication flow

### 📡 API Specifications

**✅ Existing Endpoints** (Already implemented in auth-service):
- `POST /auth/login` - User authentication (needs UserService connection)
- `POST /auth/refresh` - Token refresh (working)
- `POST /auth/logout` - Session termination (working)

**❌ Missing Endpoints**:
- `POST /auth/register` - User registration (needs to be added to auth-service plugin)

**🔧 Existing User Endpoints** (may need authentication middleware):
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID  
- `POST /users` - Create user (currently used by URL parameter system)
- `PUT /users/:id` - Update user

### File Locations
Based on existing project structure:
- **Auth Components**: `apps/client/src/components/auth/` (new directory)
- **Auth Routes**: `apps/client/src/routes/login/` and `apps/client/src/routes/register/`
- **Auth Middleware**: `apps/api-server/src/middleware/auth.ts` (new file)
- **Updated User Routes**: Modify existing `apps/api-server/src/routes/users/`

### Technical Constraints
- **Security**: Must use secure password hashing (bcrypt minimum)
- **Compatibility**: Must maintain existing game functionality during transition
- **Performance**: Authentication checks should not impact game server performance
- **Session Management**: Use JWT tokens for stateless authentication

### Testing Requirements
**Unit Tests**:
- Authentication middleware functionality
- Password hashing and validation
- JWT token generation/validation
- Form validation logic

**Integration Tests**:
- Full registration/login flow
- Authenticated API endpoint access
- Session persistence across page refreshes
- Logout functionality

**Manual Testing**:
- Verify existing game flows work with authenticated users
- Test security - ensure unauthenticated access is properly blocked
- Validate user experience of new authentication flows

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| [Current Date] | 1.0 | Initial story creation based on Story 1.1 findings | Scrum Master |

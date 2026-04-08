# Code Style Rules

## Purpose
Projedeki tüm kodun tutarlı, okunabilir ve maintainable olması için kod stil standartlarını tanımlar.

---

## Python Code Style

### General Rules
- **PEP 8** standardını takip et
- **Type hints** kullan (Python 3.10+)
- **Docstring** formatı: Google Style
- Maximum line length: **100 characters**
- String quotes: Single quotes (`'`) tercih et, docstring'lerde triple double quotes (`"""`)

### Naming Conventions

```python
# Class names: PascalCase
class UserService:
    pass

# Function and variable names: snake_case
def get_user_by_id(user_id: int) -> User:
    user_email = "example@test.com"
    return user

# Constants: UPPER_SNAKE_CASE
MAX_LOGIN_ATTEMPTS = 5
API_BASE_URL = "https://api.example.com"

# Private methods/attributes: Leading underscore
class MyClass:
    def __init__(self):
        self._private_attr = None
    
    def _private_method(self):
        pass

# Type aliases: PascalCase
UserDict = Dict[str, Any]
```

### Type Hints

```python
from typing import List, Dict, Optional, Union, Any
from datetime import datetime

# Always use type hints for function signatures
def process_users(
    users: List[User],
    filters: Optional[Dict[str, Any]] = None,
    limit: int = 100
) -> List[User]:
    """Process users with optional filters."""
    pass

# Use Union for multiple possible types
def get_value(key: str) -> Union[str, int, None]:
    pass

# Use Optional for values that can be None
def find_user(email: str) -> Optional[User]:
    pass

# Use type aliases for complex types
UserDict = Dict[str, Union[str, int, List[str]]]

def create_user_dict(data: Dict[str, Any]) -> UserDict:
    pass
```

### Docstrings

```python
def create_user(
    email: str,
    name: str,
    age: Optional[int] = None
) -> User:
    """
    Create a new user in the database.
    
    Args:
        email: User's email address (must be unique)
        name: User's full name
        age: User's age (optional)
        
    Returns:
        Created User object with generated ID
        
    Raises:
        ValueError: If email is already registered
        ValidationError: If email format is invalid
        
    Examples:
        >>> user = create_user("john@example.com", "John Doe", 25)
        >>> print(user.id)
        123
    """
    pass
```

### Imports

```python
# Standard library imports first
import os
import sys
from datetime import datetime
from typing import List, Dict, Optional

# Third-party imports second
import sqlalchemy
from fastapi import FastAPI, Depends
from pydantic import BaseModel

# Local application imports last
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate

# Group imports and separate with blank lines
# Use absolute imports, not relative
```

### Code Organization

```python
# File structure for a module

"""
Module docstring explaining the purpose of this file.
"""

# Imports
import os
from typing import List

# Constants
MAX_RETRIES = 3
DEFAULT_TIMEOUT = 30

# Type aliases
UserDict = Dict[str, Any]

# Classes
class MyClass:
    """Class docstring."""
    
    def __init__(self):
        """Constructor docstring."""
        pass
    
    def public_method(self):
        """Public method docstring."""
        pass
    
    def _private_method(self):
        """Private method docstring."""
        pass

# Functions
def public_function():
    """Function docstring."""
    pass

def _private_function():
    """Private function docstring."""
    pass

# Main execution (if applicable)
if __name__ == "__main__":
    main()
```

### Error Handling

```python
# Use specific exceptions
try:
    user = get_user_by_id(user_id)
except UserNotFoundError as e:
    logger.error(f"User not found: {user_id}")
    raise HTTPException(status_code=404, detail=str(e))
except DatabaseError as e:
    logger.error(f"Database error: {e}", exc_info=True)
    raise HTTPException(status_code=500, detail="Database error")

# Don't use bare except
# Bad
try:
    risky_operation()
except:  # Don't do this!
    pass

# Good
try:
    risky_operation()
except SpecificError as e:
    handle_error(e)
```

### Async/Await

```python
# Use async/await for I/O operations
async def get_user(user_id: int) -> User:
    """Fetch user from database asynchronously."""
    async with get_db() as db:
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

# Await all async operations
users = await get_all_users()
await save_user(user)

# Use asyncio.gather for parallel operations
user, profile, settings = await asyncio.gather(
    get_user(user_id),
    get_profile(user_id),
    get_settings(user_id)
)
```

---

## JavaScript/TypeScript Code Style

### General Rules
- **ESLint + Prettier** yapılandırmasına uy
- **TypeScript strict mode** aktif
- Maximum line length: **100 characters**
- Semicolons: **Required**
- Quotes: Single quotes (`'`) tercih et

### Naming Conventions

```typescript
// Interfaces and Types: PascalCase (NO 'I' prefix)
interface User {
  id: number;
  name: string;
}

type UserResponse = {
  user: User;
  token: string;
};

// Classes: PascalCase
class UserService {
  constructor() {}
}

// Functions and variables: camelCase
function getUserById(userId: number): User {
  const userName = 'John';
  return user;
}

// Constants: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;
const API_BASE_URL = 'https://api.example.com';

// React Hooks: use prefix
function useAuth() {
  const [user, setUser] = useState(null);
  return { user, setUser };
}

// React Components: PascalCase
function UserProfile({ userId }: Props) {
  return <div>Profile</div>;
}

// Private methods: Leading underscore (optional)
class MyClass {
  private _privateProperty: string;
  
  private _privateMethod(): void {
    // ...
  }
}
```

### TypeScript Types

```typescript
// Always use explicit types for function parameters and return values
function processUser(
  user: User,
  options?: ProcessOptions
): ProcessedUser {
  // ...
}

// Use type inference for simple variables
const count = 5; // Type: number (inferred)
const name = 'John'; // Type: string (inferred)

// Use union types for multiple possibilities
type Status = 'pending' | 'active' | 'inactive';

function setStatus(status: Status): void {
  // ...
}

// Use optional properties with ?
interface UserProfile {
  name: string;
  age?: number;
  email?: string;
}

// Use generic types for reusable components
function getItems<T>(items: T[]): T[] {
  return items;
}

// Use Partial, Required, Pick, Omit utilities
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type UserWithoutPassword = Omit<User, 'password'>;
```

### React Components

```typescript
import React, { memo, useState, useEffect } from 'react';

interface UserCardProps {
  userId: number;
  onUserClick?: (userId: number) => void;
}

/**
 * UserCard component displays user information.
 * 
 * @param userId - The ID of the user to display
 * @param onUserClick - Optional callback when card is clicked
 */
export const UserCard: React.FC<UserCardProps> = memo(({ 
  userId, 
  onUserClick 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <ErrorMessage message="User not found" />;
  }

  return (
    <div className="user-card" onClick={() => onUserClick?.(userId)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

UserCard.displayName = 'UserCard';
```

### Imports

```typescript
// React imports first
import React, { useState, useEffect } from 'react';

// Third-party imports
import axios from 'axios';
import { useQuery } from 'react-query';

// Component imports
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Utility imports
import { formatDate } from '@/utils/date';
import { API_BASE_URL } from '@/config';

// Type imports (can be grouped separately)
import type { User } from '@/types/user';
import type { ApiResponse } from '@/types/api';

// Use path aliases (@/ instead of ../..)
import { MyComponent } from '@/components/MyComponent';
// Not: import { MyComponent } from '../../../components/MyComponent';
```

### Async Operations

```typescript
// Use async/await instead of promises
// Bad
function getUser(id: number) {
  return fetch(`/api/users/${id}`)
    .then(res => res.json())
    .then(data => data)
    .catch(err => console.error(err));
}

// Good
async function getUser(id: number): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// Use Promise.all for parallel operations
const [users, products, orders] = await Promise.all([
  fetchUsers(),
  fetchProducts(),
  fetchOrders()
]);
```

---

## File Organization

### Python Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Application entry point
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py    # Main router
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── users.py
│   │           └── auth.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Configuration
│   │   ├── security.py      # Security utilities
│   │   └── deps.py          # Dependencies
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py          # Database base
│   │   ├── session.py       # DB session
│   │   └── models/
│   │       ├── __init__.py
│   │       └── user.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── user.py          # Pydantic schemas
│   └── services/
│       ├── __init__.py
│       └── user.py          # Business logic
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   └── test_services.py
│   └── integration/
│       └── test_api.py
└── requirements.txt
```

### React Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   └── Input.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── features/        # Feature-specific components
│   │       ├── auth/
│   │       │   ├── Login.tsx
│   │       │   └── Register.tsx
│   │       └── dashboard/
│   │           └── Dashboard.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   ├── services/            # API services
│   │   └── api.ts
│   ├── store/               # State management
│   │   ├── slices/
│   │   │   └── authSlice.ts
│   │   └── store.ts
│   ├── types/               # TypeScript types
│   │   ├── user.ts
│   │   └── api.ts
│   ├── utils/               # Utility functions
│   │   └── helpers.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── unit/
│   └── e2e/
├── package.json
└── tsconfig.json
```

## Neo-Specific Code Patterns

### Matrix SDK Wrapper Pattern

Matrix SDK (`matrix-js-sdk`) should never be used directly in React components. Instead, create a wrapper layer in `src/lib/matrix/` with type-safe functions.

```typescript
// ✅ DOĞRU - lib/matrix/messages.ts
import { getMatrixClient } from './client';
import { MessageEvent } from '@/types/matrix';

export async function sendMessage(
  roomId: string,
  text: string
): Promise<MessageEvent> {
  const client = getMatrixClient();
  if (!client) throw new Error('Matrix client not initialized');
  
  if (!text.trim()) throw new Error('Message text is required');
  
  try {
    const event = await client.sendEvent(roomId, 'm.room.message', {
      msgtype: 'm.text',
      body: text,
    });
    return event as MessageEvent;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('Mesaj gönderilemedi');
  }
}

// ❌ YANLIŞ - Direct SDK usage in component
const MessageInput = () => {
  const client = new MatrixClient(...); // Avoid!
  client.sendTextMessage(...); // Avoid!
};
```

### Zustand Store Pattern

Use Zustand for state management with persistence for critical state (auth, UI preferences).

```typescript
// ✅ DOĞRU - lib/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  userId: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (userId: string, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      accessToken: null,
      isAuthenticated: false,
      login: (userId, accessToken) => set({ userId, accessToken, isAuthenticated: true }),
      logout: () => set({ userId: null, accessToken: null, isAuthenticated: false }),
    }),
    { name: 'neo-auth' }
  )
);
```

### Tauri IPC Pattern

Tauri commands must be defined in Rust with proper error handling and input validation.

```rust
// ✅ DOĞRU - src-tauri/src/commands/auth.rs
#[tauri::command]
pub async fn save_session_token(token: String) -> Result<(), String> {
    if token.is_empty() || token.len() > 1024 {
        return Err("Invalid token".to_string());
    }
    
    match save_to_keyring(token) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Token kaydedilemedi: {}", e)),
    }
}
```

```typescript
// ✅ DOĞRU - TypeScript invocation
import { invoke } from '@tauri-apps/api';

async function saveToken(token: string): Promise<void> {
  await invoke<void>('save_session_token', { token });
}
```

### TypeScript Type Definitions

Define comprehensive TypeScript types for Matrix events in `src/types/matrix.ts`.

```typescript
// ✅ DOĞRU - src/types/matrix.ts
export interface MessageEvent {
  event_id: string;
  sender: string;
  room_id: string;
  origin_server_ts: number;
  content: {
    msgtype: 'm.text' | 'm.image' | 'm.file' | 'm.video' | 'm.audio';
    body: string;
    url?: string;
    info?: Record<string, any>;
  };
}

export interface RoomSummary {
  room_id: string;
  name: string;
  canonical_alias?: string;
  avatar_url?: string;
  joined_members: number;
  world_readable: boolean;
  guest_can_join: boolean;
}
```

### Error Handling in Neo

All async operations must include try-catch with user-friendly Turkish error messages.

```typescript
// ✅ DOĞRU
try {
  await sendMessage(roomId, text);
} catch (error) {
  if (error instanceof Error) {
    toast.error(error.message); // Already Turkish
  } else {
    toast.error('Beklenmeyen bir hata oluştu');
  }
}
```

### React Component Pattern

Functional components with TypeScript, memoization where appropriate.

```typescript
// ✅ DOĞRU - components/chat/MessageBubble.tsx
import React, { memo } from 'react';
import { MessageEvent } from '@/types/matrix';

interface MessageBubbleProps {
  message: MessageEvent;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ 
  message, 
  isOwn 
}) => {
  return (
    <div className={`message-bubble ${isOwn ? 'own' : ''}`}>
      <p>{message.content.body}</p>
      <span className="timestamp">
        {new Date(message.origin_server_ts).toLocaleTimeString('tr-TR')}
      </span>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
```

---


## Comments and Documentation

### When to Comment

```python
# Good comments explain WHY, not WHAT

# Bad: Obvious comment
# Increment counter by 1
counter += 1

# Good: Explains reasoning
# We need to skip the first row because it contains headers
data = data[1:]

# Good: Warns about potential issues
# HACK: This is a temporary workaround for API v1 compatibility.
# TODO: Remove this when all clients migrate to API v2.
if api_version == 'v1':
    transform_legacy_response(data)

# Good: Explains complex logic
# Calculate compound interest using formula: A = P(1 + r/n)^(nt)
# where P=principal, r=rate, n=compounds per year, t=years
total = principal * (1 + rate / compounds_per_year) ** (compounds_per_year * years)
```

### TODO/FIXME/HACK Comments

```python
# TODO: Add caching to improve performance
# FIXME: This breaks when user has no profile
# HACK: Temporary workaround until API v2 is ready
# NOTE: This must be called before authentication
# WARNING: This operation is expensive, use sparingly
```

---

## Code Quality Checks

### Pre-commit Hooks

```bash
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
  
  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort
  
  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
  
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.3.0
    hooks:
      - id: mypy
```

### Linting Commands

```bash
# Python
black --check src/ tests/
isort --check-only src/ tests/
flake8 src/ tests/
mypy src/

# JavaScript/TypeScript
eslint src/ --ext .ts,.tsx
prettier --check "src/**/*.{ts,tsx}"
tsc --noEmit
```

---

## Exceptions

### When to Break These Rules

1. **Generated Code**: Auto-generated files (migrations, protobuf, etc.)
2. **Third-party Code**: Vendored dependencies
3. **Legacy Code**: Old code being phased out (document why)
4. **Performance Critical**: When style impacts performance (document reasoning)

Always document why you're deviating from the standard style.

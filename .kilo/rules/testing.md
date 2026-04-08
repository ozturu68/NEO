# Testing Rules

## Purpose
Yüksek kaliteli, güvenilir kod için kapsamlı test stratejisi ve standartları.

---

## Test Coverage Requirements

- **Minimum %80 code coverage** (Overall)
- **%100 coverage** for critical paths (authentication, payment, data integrity)
- Her yeni feature **test ile birlikte** gelmelidir
- Bug fix'ler için **regression test** yazılmalıdır

---

## Test Types

### 1. Unit Tests

**Purpose:** Isolated function/method testing

**Characteristics:**
- No external dependencies (database, API, filesystem)
- Mock all external calls
- Fast execution (**<100ms per test**)
- Test one thing at a time

**Example (Python/pytest):**
```python
import pytest
from unittest.mock import Mock, patch
from app.services.user import UserService

def test_create_user_success():
    """Test successful user creation."""
    # Arrange
    mock_db = Mock()
    user_data = {"email": "test@example.com", "name": "Test User"}
    service = UserService(mock_db)
    
    # Act
    result = service.create(user_data)
    
    # Assert
    assert result.email == user_data["email"]
    assert result.name == user_data["name"]
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()

def test_create_user_duplicate_email_raises_error():
    """Test that duplicate email raises ValueError."""
    # Arrange
    mock_db = Mock()
    mock_db.query.return_value.filter.return_value.first.return_value = Mock()
    service = UserService(mock_db)
    
    # Act & Assert
    with pytest.raises(ValueError, match="Email already registered"):
        service.create({"email": "existing@example.com", "name": "Test"})
```

**Example (Vitest with Matrix SDK mocking):**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { getMatrixClient } from '@/lib/matrix/client';
import { sendMessage } from '@/lib/matrix/messages';
import { MatrixClient } from 'matrix-js-sdk';

// Mock the Matrix client
vi.mock('@/lib/matrix/client', () => ({
  getMatrixClient: vi.fn(),
}));

describe('sendMessage', () => {
  it('should send text message successfully', async () => {
    // Arrange
    const mockClient = {
      sendEvent: vi.fn().mockResolvedValue({ event_id: '$event123' }),
    };
    (getMatrixClient as vi.Mock).mockReturnValue(mockClient);
    
    // Act
    const eventId = await sendMessage({
      roomId: '!room123:example.com',
      text: 'Hello, Matrix!',
    });
    
    // Assert
    expect(mockClient.sendEvent).toHaveBeenCalledWith(
      '!room123:example.com',
      'm.room.message',
      expect.objectContaining({
        msgtype: 'm.text',
        body: 'Hello, Matrix!',
      })
    );
    expect(eventId).toBe('$event123');
  });

  it('should throw error for empty text', async () => {
    await expect(sendMessage({
      roomId: '!room123:example.com',
      text: '',
    })).rejects.toThrow('Message text is required');
  });
});
```

### 2. Integration Tests

**Purpose:** Test interaction between components

**Characteristics:**
- Use real database (test database or in-memory)
- Test API endpoints with actual HTTP calls
- Test service layer with actual database operations
- Slower than unit tests (**<5s per test**)

**Example (Python/pytest with FastAPI):**
```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.db.session import get_db

@pytest.fixture
def client(db: Session):
    """Test client with database."""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)

def test_create_user_endpoint(client: TestClient, db: Session):
    """Test user creation via API endpoint."""
    # Arrange
    user_data = {
        "email": "newuser@example.com",
        "name": "New User",
        "password": "SecurePass123"
    }
    
    # Act
    response = client.post("/api/v1/users", json=user_data)
    
    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == user_data["email"]
    assert "id" in data
    assert "password" not in data  # Password should not be returned
    
    # Verify in database
    from app.db.models.user import User
    user = db.query(User).filter(User.email == user_data["email"]).first()
    assert user is not None
    assert user.name == user_data["name"]
```

### 3. End-to-End (E2E) Tests

**Purpose:** Test complete user flows

**Characteristics:**
- Test from user perspective
- Use real browser (Playwright, Cypress)
- Test critical user journeys
- Slowest tests (**10-30s per test**)

**Example (Playwright):**
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication Flow', () => {
  test('should complete signup and login flow', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');
    
    // Fill signup form
    await page.fill('[name="email"]', 'testuser@example.com');
    await page.fill('[name="password"]', 'SecurePass123');
    await page.fill('[name="name"]', 'Test User');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome, Test User');
    
    // Logout
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL('/login');
    
    // Login again
    await page.fill('[name="email"]', 'testuser@example.com');
    await page.fill('[name="password"]', 'SecurePass123');
    await page.click('button[type="submit"]');
    
    // Should be back in dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

## Test Structure (AAA Pattern)

Her test şu yapıyı takip etmelidir:

```python
def test_function_name():
    # Arrange - Test için gerekli setup
    user_data = {"email": "test@example.com"}
    mock_db = Mock()
    
    # Act - Test edilen aksiyonu çalıştır
    result = create_user(user_data, mock_db)
    
    # Assert - Sonuçları doğrula
    assert result.email == user_data["email"]
    mock_db.add.assert_called_once()
```

---

## Test Naming Convention

### Format
`test_<function_name>_<scenario>_<expected_result>`

### Examples
```python
# Good test names
def test_login_with_valid_credentials_returns_token():
    pass

def test_login_with_invalid_password_returns_401():
    pass

def test_create_user_with_duplicate_email_raises_value_error():
    pass

def test_get_user_by_id_when_not_found_returns_none():
    pass

# Bad test names (too vague)
def test_login():
    pass

def test_user():
    pass

def test_1():
    pass
```

---

## Mocking Strategy

### Database Mocking

**Option 1: In-Memory Database (SQLite)**
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base

@pytest.fixture
def db():
    """Create in-memory database for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    yield db
    db.close()
```

**Option 2: Test Containers (PostgreSQL)**
```python
import pytest
from testcontainers.postgres import PostgresContainer

@pytest.fixture(scope="session")
def postgres():
    """Start PostgreSQL container for testing."""
    with PostgresContainer("postgres:14") as postgres:
        yield postgres
```

### External API Mocking

```python
from unittest.mock import patch, Mock

@patch('app.services.email.send_email')
def test_user_registration_sends_email(mock_send_email):
    """Test that user registration triggers email."""
    mock_send_email.return_value = True
    
    create_user({"email": "test@example.com"})
    
    mock_send_email.assert_called_once()
    call_args = mock_send_email.call_args
    assert call_args[0][0] == "test@example.com"
```

### Time-Dependent Testing

```python
from freezegun import freeze_time
from datetime import datetime

@freeze_time("2024-04-08 12:00:00")
def test_token_expiration():
    """Test JWT token expiration."""
    token = create_token(user_id=1, expires_in_minutes=30)
    
    # Token should be valid now
    assert verify_token(token) is True
    
    # Move time forward 31 minutes
    with freeze_time("2024-04-08 12:31:00"):
        # Token should be expired
        assert verify_token(token) is False
```

---

## Test Fixtures

### Pytest Fixtures

```python
import pytest
from app.db.models.user import User

@pytest.fixture
def sample_user(db):
    """Create a sample user for testing."""
    user = User(
        email="test@example.com",
        name="Test User",
        hashed_password="hashed_password_here"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def authenticated_client(client, sample_user):
    """Client with authenticated user."""
    # Login to get token
    response = client.post("/api/v1/auth/login", json={
        "email": sample_user.email,
        "password": "password123"
    })
    token = response.json()["access_token"]
    
    # Set authorization header
    client.headers = {"Authorization": f"Bearer {token}"}
    return client

# Usage
def test_get_profile(authenticated_client, sample_user):
    response = authenticated_client.get("/api/v1/users/me")
    assert response.status_code == 200
    assert response.json()["email"] == sample_user.email
```

---

## Test Coverage

### Running with Coverage

```bash
# Python
pytest tests/ \
    --cov=app \
    --cov-report=term-missing \
    --cov-report=html \
    --cov-fail-under=80

# JavaScript
jest --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80}}'
```

### Coverage Reports

```bash
# View coverage report in terminal
pytest --cov=app --cov-report=term-missing

# Generate HTML report
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser

# Generate XML report (for CI/CD)
pytest --cov=app --cov-report=xml
```

---

## Performance Testing

### Load Testing (Locust)

```python
from locust import HttpUser, task, between

class APIUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Login before running tasks."""
        response = self.client.post("/api/v1/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        self.token = response.json()["access_token"]
        self.client.headers = {"Authorization": f"Bearer {self.token}"}
    
    @task(3)  # This task runs 3x more often
    def get_users(self):
        """Test getting users list."""
        self.client.get("/api/v1/users")
    
    @task(1)
    def create_user(self):
        """Test creating a user."""
        self.client.post("/api/v1/users", json={
            "email": f"user{self.environment.runner.user_count}@example.com",
            "name": "Test User"
        })
```

**Run load test:**
```bash
locust -f tests/load_test.py --host=http://localhost:8000
# Open http://localhost:8089 to control the test
```

---

## Test Organization

### Directory Structure

```
tests/
├── conftest.py              # Shared fixtures
├── unit/
│   ├── test_services.py     # Service layer tests
│   ├── test_utils.py        # Utility function tests
│   └── test_models.py       # Model tests
├── integration/
│   ├── test_api.py          # API endpoint tests
│   ├── test_database.py     # Database integration tests
│   └── test_auth.py         # Authentication flow tests
├── e2e/
│   ├── test_user_flow.py    # User journey tests
│   └── test_checkout.py     # Checkout flow tests
├── load/
│   └── locustfile.py        # Load testing scenarios
└── fixtures/
    ├── users.json           # Test data
    └── products.json        # Test data
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests with coverage
        run: |
          pytest tests/ \
            --cov=app \
            --cov-report=xml \
            --cov-report=term-missing \
            --cov-fail-under=80
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
```

---

## Best Practices

### 1. Test Isolation

Each test should be independent:

```python
# Bad - Tests depend on each other
def test_1_create_user():
    global user_id
    user_id = create_user({"email": "test@example.com"})

def test_2_get_user():
    user = get_user(user_id)  # Depends on test_1
    assert user is not None

# Good - Each test is independent
def test_create_user(db):
    user = create_user({"email": "test@example.com"}, db)
    assert user.id is not None

def test_get_user(db, sample_user):  # Uses fixture
    user = get_user(sample_user.id, db)
    assert user is not None
```

### 2. Clear Assertions

```python
# Bad - Unclear what's being tested
def test_user():
    result = some_function()
    assert result

# Good - Clear assertion with message
def test_create_user_returns_user_with_id():
    user = create_user({"email": "test@example.com"})
    assert user.id is not None, "Created user should have an ID"
    assert isinstance(user.id, int), "User ID should be an integer"
```

### 3. Test Edge Cases

```python
def test_divide():
    # Happy path
    assert divide(10, 2) == 5
    
    # Edge cases
    assert divide(0, 5) == 0
    assert divide(5, 1) == 5
    assert divide(-10, 2) == -5
    
    # Error cases
    with pytest.raises(ZeroDivisionError):
        divide(10, 0)
```

### 4. Descriptive Test Data

```python
# Bad - Magic numbers
user = User(1, "a@b.c", "x")

# Good - Clear, descriptive test data
user = User(
    id=TEST_USER_ID,
    email="john.doe@example.com",
    name="John Doe"
)
```

### 5. Don't Test Framework/Library Code

```python
# Bad - Testing SQLAlchemy
def test_sqlalchemy_adds_to_session():
    user = User(email="test@example.com")
    db.add(user)
    assert user in db  # Testing SQLAlchemy, not our code

# Good - Test business logic
def test_create_user_validates_email_format():
    with pytest.raises(ValidationError):
        create_user({"email": "invalid-email"})
```

---

## Exceptions

- **Legacy code**: Old code without tests (add tests incrementally)
- **Generated code**: Auto-generated migrations, protobuf files
- **Trivial code**: Simple getters/setters, property definitions
- **Third-party integrations**: When mocking is too complex (use integration tests instead)

Always document why certain code doesn't have tests.

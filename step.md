# Telegram Personal Finance Assistant - Implementation Guide

## Project Goal

Build a Telegram-based personal finance assistant that helps users manage their finances through natural conversations.

The assistant should allow users to:

- Track income and expenses
- Manage recurring bills and payment reminders
- Create monthly budgets
- Set savings goals
- Receive automatic reports and notifications
- Ask financial questions using natural language
- Eventually expand into a complete web and mobile finance platform

---

# Step 1 - Define the MVP

The first version should focus on solving the most common personal finance problems.

Core features:

- Register income
- Register expenses
- View current balance
- View transaction history
- Create payment reminders
- Receive scheduled notifications
- Weekly and monthly financial summaries

User stories:

- As a user, I can register an expense by simply sending a message.
- As a user, I can register income.
- As a user, I can see my available balance.
- As a user, I can review my expenses by category.
- As a user, I receive reminders before bills are due.
- As a user, I can review recent transactions.

---

# Step 2 - Define the Architecture

Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL

Telegram Integration

- Telegram Bot API

Infrastructure

- Docker
- Docker Compose
- Redis
- Scheduler (Cron Jobs)

Future integrations

- AI Assistant
- Web Dashboard
- Mobile Application

Architecture principle:

The Telegram bot should only be the client.

All business logic must live inside the backend API so additional clients (Web, Mobile, WhatsApp) can be added later without duplicating logic.

---

# Step 3 - Design the Database

Users

- id
- telegramId
- name
- currency
- timezone
- createdAt

Transactions

- id
- userId
- type (Income | Expense)
- amount
- categoryId
- description
- transactionDate
- createdAt

Categories

- id
- name
- icon
- color
- type

PaymentReminders

- id
- userId
- serviceName
- amount
- paymentDay
- frequency
- active

Budgets

- id
- userId
- categoryId
- monthlyLimit

SavingGoals

- id
- userId
- name
- targetAmount
- currentAmount
- targetDate

---

# Step 4 - Build the Telegram Bot

Initial setup

- Create the bot using BotFather
- Obtain the Bot Token
- Configure Webhook or Long Polling
- Connect the bot to the backend

---

User registration

When a user sends:

/start

Automatically create a user profile.

---

Expense registration

Users should be able to send messages like:

"I spent 850 on groceries"

"Paid 1200 for gas"

"Internet bill 1800"

The system should automatically detect:

- Amount
- Category
- Description
- Transaction date

Then store the transaction.

---

Income registration

Examples

"I received my salary of 45000"

"Freelance payment 15000"

---

Supported commands

/balance

/income

/expenses

/history

/summary

/help

---

# Step 5 - Payment Reminder System

Allow users to create recurring reminders.

Example

/add-payment

Service:
Internet

Amount:
1800

Due Day:
15

Frequency:
Monthly

Daily scheduled jobs should:

- Check upcoming payments
- Send reminder notifications

Example

🔔 Your Internet bill of RD$1,800 is due tomorrow.

Users should also be able to mark payments as completed.

---

# Step 6 - Budget Management

Users can define monthly budgets.

Example

Food Budget

RD$12,000

The assistant should notify users when they reach:

- 50%
- 80%
- 100%

It should also warn users when they exceed the limit.

---

# Step 7 - Savings Goals

Allow users to create savings goals.

Example

Goal

New Laptop

Target

RD$60,000

Users can add savings over time and monitor progress.

---

# Step 8 - Automatic Reports

Weekly report

Include:

- Total income
- Total expenses
- Current balance
- Largest spending category

Monthly report

Include:

- Spending by category
- Income vs expenses
- Monthly comparison
- Financial recommendations

---

# Step 9 - AI Features

The AI assistant should be able to:

- Automatically categorize transactions
- Detect unusual spending
- Analyze financial habits
- Answer questions using natural language
- Recommend savings opportunities

Example questions

How much did I spend on food this month?

How much money do I have left?

Where am I spending too much?

How can I save more money?

Which subscriptions am I paying for?

---

# Step 10 - Web Dashboard

Future dashboard features

- Authentication
- Financial overview
- Charts
- Payment calendar
- Transactions
- Categories
- Budgets
- Savings goals
- PDF export
- Excel export

The dashboard should consume the same backend API used by Telegram.

---

# Step 11 - Security

Implement

- JWT Authentication
- Input validation
- Rate limiting
- Logging
- Audit logs
- Automated backups

---

# Step 12 - Deployment

Deployment stack

- Docker
- CI/CD
- VPS or Cloud Provider
- HTTPS
- Domain
- Monitoring
- Automatic backups

---

# Future Enhancements

- OCR receipt scanning
- Excel import
- Google Calendar integration
- Google Sheets synchronization
- Email reports
- WhatsApp support
- Mobile applications
- Bank integrations (where available)
- Multi-currency support
- Debt and loan management
- Shared family finances
- Investment tracking
- Subscription detection
- Cash flow forecasting

---

# Development Roadmap

## Phase 1 (MVP)

- User registration
- Income tracking
- Expense tracking
- Categories
- Balance
- Transaction history
- Payment reminders
- Monthly summaries

---

## Phase 2

- Budgets
- Savings goals
- Scheduled reports
- Web dashboard

---

## Phase 3

- AI financial assistant
- OCR receipt recognition
- Advanced analytics
- Predictive insights
- External integrations
- Mobile applications

---

# Long-Term Vision

Build a complete personal finance ecosystem where Telegram serves as the primary user interface while a centralized backend powers all business logic.

The backend should expose reusable APIs that allow future clients—including web, mobile, and messaging platforms—to share the same data model and business rules, ensuring scalability, maintainability, and a consistent user experience across all platforms.

---

# TECHNICAL DOCUMENTATION

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Docker and Docker Compose
- Git

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/finbot.git
cd finbot
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finbot_db

# Redis
REDIS_URL=redis://localhost:6379

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h

# API
API_PORT=3000
API_HOST=localhost
NODE_ENV=development

# Telegram Webhook (Production)
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/bot/webhook

# Currency
DEFAULT_CURRENCY=RD$

# Timezone
DEFAULT_TIMEZONE=America/Santo_Domingo

# Logging
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

4. **Database Setup**

```bash
# Create database
createdb finbot_db

# Run migrations
npx prisma migrate deploy

# Seed initial data (categories, etc.)
npm run seed
```

5. **Start Redis**
```bash
redis-server
```

6. **Start the application**

Development:
```bash
npm run start:dev
```

Production:
```bash
npm run build
npm start
```

### Docker Setup

Use Docker Compose for a complete stack:

```bash
docker-compose up -d
```

**docker-compose.yml structure:**
- PostgreSQL service
- Redis service
- NestJS API service
- Volumes for persistent data

---

## Project Structure

```
finbot/
├── src/
│   ├── modules/
│   │   ├── auth/                 # Authentication & JWT
│   │   ├── users/                # User management
│   │   ├── transactions/         # Income/Expense tracking
│   │   ├── categories/           # Category management
│   │   ├── budgets/              # Budget management
│   │   ├── saving-goals/         # Saving goals
│   │   ├── payment-reminders/    # Reminder system
│   │   ├── reports/              # Report generation
│   │   ├── notifications/        # Notification service
│   │   └── telegram/             # Telegram bot integration
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── filters/
│   │   ├── pipes/
│   │   └── interceptors/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── seeds/
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── telegram.config.ts
│   │   └── redis.config.ts
│   ├── utils/
│   │   ├── logger/
│   │   ├── validators/
│   │   └── helpers/
│   └── main.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── .eslintrc.json
├── tsconfig.json
└── package.json
```

---

## Database Configuration

### Prisma Setup

Prisma ORM is used for database operations.

**Key files:**
- `src/database/prisma/schema.prisma` - Database schema
- `src/database/prisma/migrations/` - Migration history

### Connection Pooling

For PostgreSQL connections, configure:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/finbot_db?schema=public&connection_limit=5
```

### Redis Configuration

Redis is used for:
- Session management
- Caching transaction history
- Job queues for scheduled tasks
- Rate limiting

Configuration file: `src/config/redis.config.ts`

---

## Third-Party Integrations

### Telegram Bot API

**Integration point:** `src/modules/telegram/`

- Uses Telegram Bot API (HTTPS)
- Supports Webhook or Long Polling
- Webhook recommended for production

**Webhook Setup:**
```
POST /bot/webhook
```

**Long Polling (Development):**
```bash
npm run telegram:polling
```

### JWT Authentication

- Algorithm: HS256
- Expiration: 24 hours (configurable)
- Refresh tokens stored in Redis

---

## Key Configuration Files

### .eslintrc.json
- NestJS recommended rules
- TypeScript strict mode

### tsconfig.json
- ES2020 target
- Strict type checking
- Path aliases for imports

### docker-compose.yml
- PostgreSQL 14
- Redis 7
- NestJS API
- Volume management

---

# DEVELOPMENT GUIDE

## Architecture Principles

### 1. Modular Architecture
Each module is self-contained with:
- Controllers (HTTP endpoints)
- Services (business logic)
- Repositories (data access)
- DTOs (data transfer objects)
- Entities (database models)

### 2. Separation of Concerns
- **Controllers** - Handle HTTP requests/responses
- **Services** - Implement business logic
- **Repositories** - Abstract database operations
- **Telegram Module** - Only client, no business logic

### 3. Database First
All business logic resides in the backend. Telegram bot is just a presentation layer.

---

## Module Development Pattern

### Standard Module Structure

```
modules/
└── feature-name/
    ├── dto/
    │   ├── create-feature.dto.ts
    │   ├── update-feature.dto.ts
    │   └── feature.response.dto.ts
    ├── entities/
    │   └── feature.entity.ts
    ├── repositories/
    │   └── feature.repository.ts
    ├── services/
    │   └── feature.service.ts
    ├── controllers/
    │   └── feature.controller.ts
    ├── feature.module.ts
    └── feature.spec.ts
```

### Example Service Implementation

```typescript
// src/modules/transactions/services/transaction.service.ts

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryService: CategoryService,
    private readonly notificationService: NotificationService,
  ) {}

  async createTransaction(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponse> {
    // Validate
    // Create
    // Notify if budget threshold reached
    // Return
  }
}
```

---

## Coding Conventions

### Naming
- Classes: PascalCase
- Methods/Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case.ts

### DTOs (Data Transfer Objects)
All API inputs/outputs use DTOs:

```typescript
export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  description: string;

  @IsEnum(['Income', 'Expense'])
  type: string;
}
```

### Error Handling
Use NestJS exceptions:

```typescript
throw new NotFoundException('Transaction not found');
throw new BadRequestException('Invalid amount');
throw new UnauthorizedException('User not authenticated');
```

### Validation
Use `class-validator` decorators on DTOs.

### Logging
Use injected Logger service:

```typescript
this.logger.log('Transaction created', { userId, amount });
this.logger.error('Transaction failed', error);
```

---

## Git Workflow

### Branch Naming
```
feature/description
bugfix/description
hotfix/description
refactor/description
test/description
```

### Commit Messages
```
type(scope): short description

Detailed explanation if needed.
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `ci`, `chore`

### Pull Request Process
1. Create feature branch
2. Make changes with tests
3. Push and create PR
4. Code review
5. Merge to main

---

## Testing Strategy

### Unit Tests
Test individual services/repositories:

```bash
npm run test:unit
```

### Integration Tests
Test module interactions with database:

```bash
npm run test:integration
```

### E2E Tests
Test complete flows via API:

```bash
npm run test:e2e
```

### Test File Structure
```
src/modules/transactions/services/transaction.service.spec.ts
```

---

## Code Quality

### Linting
```bash
npm run lint
npm run lint:fix
```

### Type Checking
```bash
npm run type-check
```

### Code Coverage
```bash
npm run test:cov
```

Target: 80%+ coverage

---

## Performance Considerations

### Database
- Index frequently queried columns (userId, transactionDate)
- Use pagination for transaction lists
- Implement caching for categories

### Redis
- Cache user settings
- Cache recent transactions (24h TTL)
- Store session data

### API Responses
- Always paginate large datasets
- Use select to limit fields returned
- Implement rate limiting per user

---

# API DOCUMENTATION

## Base URL
```
http://localhost:3000/api
```

## Authentication

All endpoints (except `/auth/register`) require JWT token:

```
Authorization: Bearer <jwt_token>
```

---

## Response Format

All responses follow this format:

**Success:**
```json
{
  "data": {...},
  "message": "Success message",
  "statusCode": 200,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error:**
```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00Z",
  "details": {...}
}
```

---

## Endpoints

### Authentication

#### Register User
```
POST /auth/register

Body:
{
  "telegramId": "123456789",
  "name": "John Doe",
  "currency": "RD$",
  "timezone": "America/Santo_Domingo"
}

Response: 201 Created
{
  "data": {
    "id": "uuid",
    "telegramId": "123456789",
    "name": "John Doe",
    "token": "jwt_token"
  }
}
```

#### Login
```
POST /auth/login

Body:
{
  "telegramId": "123456789"
}

Response: 200 OK
{
  "data": {
    "token": "jwt_token",
    "user": {...}
  }
}
```

#### Refresh Token
```
POST /auth/refresh

Headers:
Authorization: Bearer <refresh_token>

Response: 200 OK
{
  "data": {
    "token": "new_jwt_token"
  }
}
```

---

### Users

#### Get Profile
```
GET /users/profile

Response: 200 OK
{
  "data": {
    "id": "uuid",
    "telegramId": "123456789",
    "name": "John Doe",
    "currency": "RD$",
    "timezone": "America/Santo_Domingo",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Profile
```
PUT /users/profile

Body:
{
  "name": "Jane Doe",
  "currency": "USD",
  "timezone": "America/New_York"
}

Response: 200 OK
{
  "data": {...}
}
```

---

### Transactions

#### Create Transaction
```
POST /transactions

Body:
{
  "type": "Expense",
  "amount": 850,
  "categoryId": "uuid",
  "description": "Groceries",
  "transactionDate": "2024-01-15"
}

Response: 201 Created
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "type": "Expense",
    "amount": 850,
    "category": {...},
    "description": "Groceries",
    "transactionDate": "2024-01-15",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Transactions
```
GET /transactions?page=1&limit=20&type=Expense&category=uuid&startDate=2024-01-01&endDate=2024-01-31

Query Parameters:
- page: 1 (default)
- limit: 20 (default)
- type: Income | Expense (optional)
- category: uuid (optional)
- startDate: ISO date (optional)
- endDate: ISO date (optional)

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "type": "Expense",
      "amount": 850,
      "category": {...},
      "description": "Groceries",
      "transactionDate": "2024-01-15",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Get Single Transaction
```
GET /transactions/:id

Response: 200 OK
{
  "data": {...}
}
```

#### Update Transaction
```
PUT /transactions/:id

Body:
{
  "amount": 900,
  "description": "Groceries - Updated"
}

Response: 200 OK
{
  "data": {...}
}
```

#### Delete Transaction
```
DELETE /transactions/:id

Response: 204 No Content
```

---

### Categories

#### Get All Categories
```
GET /categories?type=Expense

Query Parameters:
- type: Income | Expense (optional)

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "Groceries",
      "icon": "🛒",
      "color": "#FF5733",
      "type": "Expense"
    }
  ]
}
```

#### Create Custom Category
```
POST /categories

Body:
{
  "name": "Entertainment",
  "icon": "🎬",
  "color": "#3366FF",
  "type": "Expense"
}

Response: 201 Created
{
  "data": {...}
}
```

---

### Balance

#### Get Current Balance
```
GET /balance

Response: 200 OK
{
  "data": {
    "userId": "uuid",
    "totalIncome": 50000,
    "totalExpenses": 15000,
    "currentBalance": 35000,
    "currency": "RD$"
  }
}
```

#### Get Balance History
```
GET /balance/history?months=6

Query Parameters:
- months: number of months (default: 6)

Response: 200 OK
{
  "data": [
    {
      "month": "2023-12",
      "income": 50000,
      "expenses": 14000,
      "balance": 36000
    }
  ]
}
```

---

### Budgets

#### Create Budget
```
POST /budgets

Body:
{
  "categoryId": "uuid",
  "monthlyLimit": 12000
}

Response: 201 Created
{
  "data": {
    "id": "uuid",
    "category": {...},
    "monthlyLimit": 12000,
    "currentSpent": 5000,
    "percentageUsed": 42
  }
}
```

#### Get All Budgets
```
GET /budgets

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "category": {...},
      "monthlyLimit": 12000,
      "currentSpent": 5000,
      "percentageUsed": 42,
      "status": "within_limit" | "warning" | "exceeded"
    }
  ]
}
```

#### Update Budget
```
PUT /budgets/:id

Body:
{
  "monthlyLimit": 15000
}

Response: 200 OK
{
  "data": {...}
}
```

#### Delete Budget
```
DELETE /budgets/:id

Response: 204 No Content
```

---

### Saving Goals

#### Create Saving Goal
```
POST /saving-goals

Body:
{
  "name": "New Laptop",
  "targetAmount": 60000,
  "targetDate": "2024-12-31"
}

Response: 201 Created
{
  "data": {
    "id": "uuid",
    "name": "New Laptop",
    "targetAmount": 60000,
    "currentAmount": 0,
    "targetDate": "2024-12-31",
    "percentageReached": 0,
    "daysRemaining": 350
  }
}
```

#### Add Contribution
```
POST /saving-goals/:id/contribute

Body:
{
  "amount": 5000
}

Response: 200 OK
{
  "data": {
    "id": "uuid",
    "name": "New Laptop",
    "targetAmount": 60000,
    "currentAmount": 5000,
    "targetDate": "2024-12-31",
    "percentageReached": 8.33
  }
}
```

#### Get All Goals
```
GET /saving-goals

Response: 200 OK
{
  "data": [...]
}
```

---

### Payment Reminders

#### Create Reminder
```
POST /payment-reminders

Body:
{
  "serviceName": "Internet",
  "amount": 1800,
  "paymentDay": 15,
  "frequency": "monthly",
  "active": true
}

Response: 201 Created
{
  "data": {
    "id": "uuid",
    "serviceName": "Internet",
    "amount": 1800,
    "paymentDay": 15,
    "frequency": "monthly",
    "active": true,
    "nextReminderDate": "2024-01-15"
  }
}
```

#### Get All Reminders
```
GET /payment-reminders

Response: 200 OK
{
  "data": [...]
}
```

#### Mark as Completed
```
POST /payment-reminders/:id/complete

Response: 200 OK
{
  "data": {
    "id": "uuid",
    "lastCompletedDate": "2024-01-15",
    "nextReminderDate": "2024-02-15"
  }
}
```

#### Update Reminder
```
PUT /payment-reminders/:id

Body:
{
  "amount": 2000,
  "active": false
}

Response: 200 OK
{
  "data": {...}
}
```

#### Delete Reminder
```
DELETE /payment-reminders/:id

Response: 204 No Content
```

---

### Reports

#### Get Weekly Report
```
GET /reports/weekly?week=1&year=2024

Query Parameters:
- week: ISO week number (optional, defaults to current)
- year: year (optional, defaults to current)

Response: 200 OK
{
  "data": {
    "period": "Week 1, 2024",
    "totalIncome": 50000,
    "totalExpenses": 15000,
    "netIncome": 35000,
    "largestCategory": {
      "name": "Food",
      "amount": 5000
    },
    "transactionCount": 12
  }
}
```

#### Get Monthly Report
```
GET /reports/monthly?month=01&year=2024

Query Parameters:
- month: 01-12 (optional, defaults to current)
- year: year (optional, defaults to current)

Response: 200 OK
{
  "data": {
    "period": "January 2024",
    "totalIncome": 50000,
    "totalExpenses": 15000,
    "netIncome": 35000,
    "byCategory": [
      {
        "name": "Food",
        "amount": 5000,
        "percentage": 33.3
      }
    ],
    "monthComparison": {
      "previousMonth": "December 2023",
      "expenseChange": -5,
      "incomeChange": 0
    },
    "recommendations": [
      "Your food spending increased by 10%"
    ]
  }
}
```

---

## Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 400 | Bad Request | Invalid input or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per user
- **Endpoints**: Applied globally
- **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

---

## Pagination

All list endpoints support pagination:

```
GET /transactions?page=1&limit=20
```

Response includes:
```json
"pagination": {
  "page": 1,
  "limit": 20,
  "total": 150,
  "pages": 8
}
```

---

## Filtering & Sorting

Transactions endpoint supports advanced filtering:

```
GET /transactions?type=Expense&category=uuid&startDate=2024-01-01&sort=-createdAt
```

Sort format:
- `-` prefix for descending order
- Sortable fields: createdAt, amount, transactionDate

---

## Webhook Events

When using Telegram Webhook integration, POST to:

```
POST /bot/webhook

Body:
{
  "update_id": 123456,
  "message": {
    "message_id": 1,
    "from": {
      "id": "123456789",
      "first_name": "John"
    },
    "chat": {
      "id": "123456789"
    },
    "date": 1234567890,
    "text": "I spent 850 on groceries"
  }
}
```

Response: 200 OK (empty body)

---

# TESTING GUIDE

## Testing Strategy Overview

FinBot uses a three-tier testing approach:

1. **Unit Tests** — Test individual functions and services in isolation
2. **Integration Tests** — Test multiple modules working together with real database
3. **E2E Tests** — Test complete user flows through the API

### Coverage Target
- Unit: 80%+
- Integration: 60%+
- E2E: Critical paths only

---

## Setup & Configuration

### Test Dependencies

```json
{
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "jest-mock-extended": "^3.0.0",
    "supertest": "^6.3.0",
    "testcontainers": "^9.0.0"
  }
}
```

### Jest Configuration

**jest.config.js:**
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
};
```

### Test Environment Setup

**test/setup.ts:**
```typescript
import { config } from 'dotenv';

config({ path: '.env.test' });

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock timers if needed
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
});
```

### Test Environment File

**.env.test:**
```env
DATABASE_URL=postgresql://test:test@localhost:5432/finbot_test
REDIS_URL=redis://localhost:6379/1
TELEGRAM_BOT_TOKEN=test_token_12345
JWT_SECRET=test_secret_key
NODE_ENV=test
LOG_LEVEL=error
```

---

## Unit Tests

Unit tests focus on isolated service logic without external dependencies.

### Running Unit Tests

```bash
npm run test:unit
npm run test:unit -- --watch
npm run test:unit:cov
```

### Example: Transaction Service

**src/modules/transactions/services/transaction.service.spec.ts:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from '../repositories/transaction.repository';
import { CategoryService } from '../../categories/services/category.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let categoryService: jest.Mocked<CategoryService>;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: TransactionRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CategoryService,
          useValue: {
            findById: jest.fn(),
            categorizeExpense: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            notifyBudgetThreshold: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get(TransactionRepository) as jest.Mocked<TransactionRepository>;
    categoryService = module.get(CategoryService) as jest.Mocked<CategoryService>;
    notificationService = module.get(NotificationService) as jest.Mocked<NotificationService>;
  });

  describe('createTransaction', () => {
    it('should create an income transaction', async () => {
      const userId = 'user-123';
      const createDto: CreateTransactionDto = {
        type: 'Income',
        amount: 50000,
        description: 'Salary',
        transactionDate: new Date('2024-01-15'),
        categoryId: 'salary-category',
      };

      const expectedTransaction = {
        id: 'trans-123',
        userId,
        ...createDto,
        createdAt: new Date(),
      };

      transactionRepository.create.mockResolvedValue(expectedTransaction);

      const result = await service.createTransaction(userId, createDto);

      expect(result).toEqual(expectedTransaction);
      expect(transactionRepository.create).toHaveBeenCalledWith({
        userId,
        ...createDto,
      });
      expect(notificationService.notifyBudgetThreshold).not.toHaveBeenCalled();
    });

    it('should create an expense and check budget', async () => {
      const userId = 'user-123';
      const categoryId = 'groceries-123';
      const createDto: CreateTransactionDto = {
        type: 'Expense',
        amount: 5000,
        description: 'Groceries',
        transactionDate: new Date('2024-01-15'),
        categoryId,
      };

      const expectedTransaction = {
        id: 'trans-124',
        userId,
        ...createDto,
        createdAt: new Date(),
      };

      transactionRepository.create.mockResolvedValue(expectedTransaction);
      notificationService.notifyBudgetThreshold.mockResolvedValue(undefined);

      const result = await service.createTransaction(userId, createDto);

      expect(result).toEqual(expectedTransaction);
      expect(notificationService.notifyBudgetThreshold).toHaveBeenCalledWith(
        userId,
        categoryId,
        5000,
      );
    });

    it('should throw BadRequestException for invalid amount', async () => {
      const userId = 'user-123';
      const createDto: CreateTransactionDto = {
        type: 'Expense',
        amount: -100, // Invalid
        description: 'Invalid',
        transactionDate: new Date(),
        categoryId: 'cat-123',
      };

      await expect(
        service.createTransaction(userId, createDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for invalid category', async () => {
      const userId = 'user-123';
      const createDto: CreateTransactionDto = {
        type: 'Expense',
        amount: 5000,
        description: 'Test',
        transactionDate: new Date(),
        categoryId: 'nonexistent',
      };

      categoryService.findById.mockResolvedValue(null);

      await expect(
        service.createTransaction(userId, createDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTransaction', () => {
    it('should return a transaction by id', async () => {
      const transactionId = 'trans-123';
      const userId = 'user-123';
      const transaction = {
        id: transactionId,
        userId,
        type: 'Expense',
        amount: 5000,
        description: 'Test',
        createdAt: new Date(),
      };

      transactionRepository.findById.mockResolvedValue(transaction);

      const result = await service.getTransaction(transactionId, userId);

      expect(result).toEqual(transaction);
      expect(transactionRepository.findById).toHaveBeenCalledWith(transactionId);
    });

    it('should throw NotFoundException for nonexistent transaction', async () => {
      transactionRepository.findById.mockResolvedValue(null);

      await expect(
        service.getTransaction('nonexistent', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction amount', async () => {
      const transactionId = 'trans-123';
      const userId = 'user-123';
      const updateDto = { amount: 6000 };

      const updatedTransaction = {
        id: transactionId,
        userId,
        type: 'Expense',
        amount: 6000,
        description: 'Updated',
        createdAt: new Date(),
      };

      transactionRepository.update.mockResolvedValue(updatedTransaction);

      const result = await service.updateTransaction(
        transactionId,
        userId,
        updateDto,
      );

      expect(result).toEqual(updatedTransaction);
      expect(transactionRepository.update).toHaveBeenCalled();
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      const transactionId = 'trans-123';
      const userId = 'user-123';

      transactionRepository.delete.mockResolvedValue(true);

      await service.deleteTransaction(transactionId, userId);

      expect(transactionRepository.delete).toHaveBeenCalledWith(
        transactionId,
        userId,
      );
    });
  });
});
```

### Example: Mocking with jest-mock-extended

```typescript
import { createMock } from 'jest-mock-extended';

const mockRepository = createMock<TransactionRepository>({
  create: jest.fn().mockResolvedValue({ id: 'trans-123' }),
  findById: jest.fn().mockResolvedValue(null),
});
```

---

## Integration Tests

Integration tests use real database instances (via Docker/testcontainers) to test multiple modules together.

### Running Integration Tests

```bash
npm run test:integration
npm run test:integration -- --watch
npm run test:integration:cov
```

### Integration Test Configuration

**test/integration/setup.ts:**

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostgreSqlContainer } from 'testcontainers';

let postgresContainer: PostgreSqlContainer;

export async function setupTestDatabase() {
  postgresContainer = await new PostgreSqlContainer().start();
  
  return {
    host: postgresContainer.getHost(),
    port: postgresContainer.getPort(),
    username: postgresContainer.getUsername(),
    password: postgresContainer.getUserPassword(),
    database: postgresContainer.getDatabase(),
  };
}

export async function teardownTestDatabase() {
  await postgresContainer?.stop();
}
```

### Example: Transaction Integration Test

**src/modules/transactions/transactions.integration.spec.ts:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('Transactions Integration', () => {
  let app: INestApplication;
  let service: TransactionService;
  let prisma: PrismaService;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Import all needed modules
      ],
      controllers: [TransactionController],
      providers: [TransactionService, PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<TransactionService>(TransactionService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create test user
    const user = await prisma.user.create({
      data: {
        telegramId: '123456789',
        name: 'Test User',
        currency: 'RD$',
        timezone: 'America/Santo_Domingo',
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  describe('Transaction Lifecycle', () => {
    it('should create, read, update, and delete a transaction', async () => {
      // CREATE
      const createDto: CreateTransactionDto = {
        type: 'Expense',
        amount: 5000,
        description: 'Test transaction',
        transactionDate: new Date(),
        categoryId: 'cat-123',
      };

      const created = await service.createTransaction(userId, createDto);
      expect(created.id).toBeDefined();
      expect(created.amount).toBe(5000);

      // READ
      const found = await service.getTransaction(created.id, userId);
      expect(found).toEqual(created);

      // UPDATE
      const updated = await service.updateTransaction(
        created.id,
        userId,
        { amount: 6000 },
      );
      expect(updated.amount).toBe(6000);

      // DELETE
      await service.deleteTransaction(created.id, userId);
      const deleted = await service.getTransaction(created.id, userId);
      expect(deleted).toBeNull();
    });

    it('should calculate correct balance after multiple transactions', async () => {
      // Create income
      await service.createTransaction(userId, {
        type: 'Income',
        amount: 50000,
        description: 'Salary',
        transactionDate: new Date(),
        categoryId: 'salary-cat',
      });

      // Create expenses
      await service.createTransaction(userId, {
        type: 'Expense',
        amount: 5000,
        description: 'Groceries',
        transactionDate: new Date(),
        categoryId: 'food-cat',
      });

      await service.createTransaction(userId, {
        type: 'Expense',
        amount: 2000,
        description: 'Transport',
        transactionDate: new Date(),
        categoryId: 'transport-cat',
      });

      const balance = await service.getUserBalance(userId);
      expect(balance).toBe(43000); // 50000 - 5000 - 2000
    });

    it('should list transactions with filters', async () => {
      const transactions = await service.getTransactions(userId, {
        type: 'Expense',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        page: 1,
        limit: 10,
      });

      expect(transactions.data).toBeDefined();
      expect(transactions.pagination).toBeDefined();
      expect(transactions.data.every(t => t.type === 'Expense')).toBe(true);
    });
  });

  describe('Budget Notifications', () => {
    it('should notify when budget threshold is reached', async () => {
      // Create budget
      const budget = await prisma.budget.create({
        data: {
          userId,
          categoryId: 'food-cat',
          monthlyLimit: 10000,
        },
      });

      // Spend 50% of budget
      await service.createTransaction(userId, {
        type: 'Expense',
        amount: 5000,
        description: 'Groceries',
        transactionDate: new Date(),
        categoryId: 'food-cat',
      });

      // Should not notify yet
      let notifications = await prisma.notification.findMany({
        where: { userId, type: 'BUDGET_WARNING' },
      });
      expect(notifications.length).toBe(0);

      // Spend another 3000 (80% total)
      await service.createTransaction(userId, {
        type: 'Expense',
        amount: 3000,
        description: 'More groceries',
        transactionDate: new Date(),
        categoryId: 'food-cat',
      });

      // Should notify now
      notifications = await prisma.notification.findMany({
        where: { userId, type: 'BUDGET_WARNING' },
      });
      expect(notifications.length).toBeGreaterThan(0);
    });
  });
});
```

---

## E2E Tests

E2E tests verify complete user flows through the API endpoints.

### Running E2E Tests

```bash
npm run test:e2e
npm run test:e2e -- --watch
npm run test:e2e:cov
```

### E2E Test Configuration

**test/e2e/setup.ts:**

```typescript
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

export class E2ETestHelper {
  static async registerUser(app: INestApplication) {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        telegramId: '123456789',
        name: 'Test User',
        currency: 'RD$',
        timezone: 'America/Santo_Domingo',
      })
      .expect(201);

    return response.body.data;
  }

  static getAuthHeader(token: string) {
    return { Authorization: `Bearer ${token}` };
  }
}
```

### Example: E2E Transaction Flow

**test/e2e/transactions.e2e.spec.ts:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { E2ETestHelper } from './setup';

describe('Transactions E2E', () => {
  let app: INestApplication;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const user = await E2ETestHelper.registerUser(app);
    token = user.token;
    userId = user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/transactions (Create)', () => {
    it('should create an expense transaction', () => {
      return request(app.getHttpServer())
        .post('/api/transactions')
        .set(E2ETestHelper.getAuthHeader(token))
        .send({
          type: 'Expense',
          amount: 850,
          description: 'Groceries',
          categoryId: 'groceries-cat',
          transactionDate: '2024-01-15',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.amount).toBe(850);
          expect(res.body.data.type).toBe('Expense');
          expect(res.body.data.description).toBe('Groceries');
        });
    });

    it('should reject invalid amount', () => {
      return request(app.getHttpServer())
        .post('/api/transactions')
        .set(E2ETestHelper.getAuthHeader(token))
        .send({
          type: 'Expense',
          amount: -100,
          description: 'Invalid',
          categoryId: 'cat',
          transactionDate: '2024-01-15',
        })
        .expect(400);
    });

    it('should reject without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/transactions')
        .send({
          type: 'Expense',
          amount: 850,
          description: 'Test',
          categoryId: 'cat',
          transactionDate: '2024-01-15',
        })
        .expect(401);
    });
  });

  describe('GET /api/transactions (List)', () => {
    it('should list user transactions', () => {
      return request(app.getHttpServer())
        .get('/api/transactions?page=1&limit=10')
        .set(E2ETestHelper.getAuthHeader(token))
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.pagination).toBeDefined();
          expect(res.body.pagination.page).toBe(1);
        });
    });

    it('should filter by type', () => {
      return request(app.getHttpServer())
        .get('/api/transactions?type=Expense')
        .set(E2ETestHelper.getAuthHeader(token))
        .expect(200)
        .expect((res) => {
          res.body.data.forEach((t) => {
            expect(t.type).toBe('Expense');
          });
        });
    });

    it('should filter by date range', () => {
      return request(app.getHttpServer())
        .get(
          '/api/transactions?startDate=2024-01-01&endDate=2024-01-31',
        )
        .set(E2ETestHelper.getAuthHeader(token))
        .expect(200);
    });
  });

  describe('GET /api/balance', () => {
    it('should return user balance', () => {
      return request(app.getHttpServer())
        .get('/api/balance')
        .set(E2ETestHelper.getAuthHeader(token))
        .expect(200)
        .expect((res) => {
          expect(res.body.data.totalIncome).toBeGreaterThanOrEqual(0);
          expect(res.body.data.totalExpenses).toBeGreaterThanOrEqual(0);
          expect(res.body.data.currentBalance).toBeDefined();
          expect(res.body.data.currency).toBe('RD$');
        });
    });
  });

  describe('Transaction Workflow', () => {
    let transactionId: string;

    it('should create a transaction', () => {
      return request(app.getHttpServer())
        .post('/api/transactions')
        .set(E2ETestHelper.getAuthHeader(token))
        .send({
          type: 'Expense',
          amount: 5000,
          description: 'Test workflow',
          categoryId: 'cat-123',
          transactionDate: '2024-01-15',
        })
        .expect(201)
        .expect((res) => {
          transactionId = res.body.data.id;
        });
    });

    it('should retrieve the transaction', () => {
      return request(app.getHttpServer())
        .get(`/api/transactions/${transactionId}`)
        .set(E2ETestHelper.getAuthHeader(token))
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(transactionId);
          expect(res.body.data.amount).toBe(5000);
        });
    });

    it('should update the transaction', () => {
      return request(app.getHttpServer())
        .put(`/api/transactions/${transactionId}`)
        .set(E2ETestHelper.getAuthHeader(token))
        .send({
          amount: 6000,
          description: 'Updated workflow',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.amount).toBe(6000);
          expect(res.body.data.description).toBe('Updated workflow');
        });
    });

    it('should delete the transaction', () => {
      return request(app.getHttpServer())
        .delete(`/api/transactions/${transactionId}`)
        .set(E2ETestHelper.getAuthHeader(token))
        .expect(204);
    });
  });
});
```

### Example: E2E Budget Flow

**test/e2e/budgets.e2e.spec.ts:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { E2ETestHelper } from './setup';

describe('Budgets E2E', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const user = await E2ETestHelper.registerUser(app);
    token = user.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a budget and track spending', async () => {
    // Create budget
    const budgetRes = await request(app.getHttpServer())
      .post('/api/budgets')
      .set(E2ETestHelper.getAuthHeader(token))
      .send({
        categoryId: 'food-cat',
        monthlyLimit: 12000,
      })
      .expect(201);

    const budgetId = budgetRes.body.data.id;

    // Spend 50%
    await request(app.getHttpServer())
      .post('/api/transactions')
      .set(E2ETestHelper.getAuthHeader(token))
      .send({
        type: 'Expense',
        amount: 6000,
        description: 'Food',
        categoryId: 'food-cat',
        transactionDate: '2024-01-15',
      })
      .expect(201);

    // Check budget status
    let budgetCheck = await request(app.getHttpServer())
      .get(`/api/budgets/${budgetId}`)
      .set(E2ETestHelper.getAuthHeader(token))
      .expect(200);

    expect(budgetCheck.body.data.percentageUsed).toBe(50);
    expect(budgetCheck.body.data.status).toBe('within_limit');

    // Spend to 85% (should warn)
    await request(app.getHttpServer())
      .post('/api/transactions')
      .set(E2ETestHelper.getAuthHeader(token))
      .send({
        type: 'Expense',
        amount: 4200,
        description: 'More food',
        categoryId: 'food-cat',
        transactionDate: '2024-01-20',
      })
      .expect(201);

    budgetCheck = await request(app.getHttpServer())
      .get(`/api/budgets/${budgetId}`)
      .set(E2ETestHelper.getAuthHeader(token))
      .expect(200);

    expect(budgetCheck.body.data.percentageUsed).toBe(85);
    expect(budgetCheck.body.data.status).toBe('warning');
  });
});
```

---

## Test Fixtures & Factories

Create reusable test data factories:

**test/fixtures/transaction.factory.ts:**

```typescript
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../src/database/prisma.service';

export class TransactionFactory {
  constructor(private prisma: PrismaService) {}

  async createExpense(
    userId: string,
    data?: Partial<Prisma.TransactionCreateInput>,
  ) {
    return this.prisma.transaction.create({
      data: {
        userId,
        type: 'Expense',
        amount: 5000,
        description: 'Test expense',
        transactionDate: new Date(),
        categoryId: 'groceries-cat',
        ...data,
      },
    });
  }

  async createIncome(
    userId: string,
    data?: Partial<Prisma.TransactionCreateInput>,
  ) {
    return this.prisma.transaction.create({
      data: {
        userId,
        type: 'Income',
        amount: 50000,
        description: 'Test income',
        transactionDate: new Date(),
        categoryId: 'salary-cat',
        ...data,
      },
    });
  }

  async createMany(
    userId: string,
    count: number,
    type: 'Income' | 'Expense' = 'Expense',
  ) {
    const transactions = [];
    for (let i = 0; i < count; i++) {
      transactions.push(
        type === 'Expense'
          ? await this.createExpense(userId)
          : await this.createIncome(userId),
      );
    }
    return transactions;
  }
}
```

**test/fixtures/user.factory.ts:**

```typescript
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../src/database/prisma.service';

export class UserFactory {
  constructor(private prisma: PrismaService) {}

  async create(data?: Partial<Prisma.UserCreateInput>) {
    return this.prisma.user.create({
      data: {
        telegramId: Math.random().toString(),
        name: 'Test User',
        currency: 'RD$',
        timezone: 'America/Santo_Domingo',
        ...data,
      },
    });
  }

  async createWithTransactions(transactionCount: number) {
    const user = await this.create();
    const txFactory = new TransactionFactory(this.prisma);
    await txFactory.createMany(user.id, transactionCount);
    return user;
  }
}
```

---

## Test Data Seeding

**test/seeds/seed-test-data.ts:**

```typescript
import { PrismaService } from '../../src/database/prisma.service';

export async function seedTestData(prisma: PrismaService) {
  // Clear existing data
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Groceries', icon: '🛒', color: '#FF5733', type: 'Expense' },
    }),
    prisma.category.create({
      data: { name: 'Food', icon: '🍔', color: '#33FF57', type: 'Expense' },
    }),
    prisma.category.create({
      data: { name: 'Salary', icon: '💰', color: '#3366FF', type: 'Income' },
    }),
  ]);

  // Create user
  const user = await prisma.user.create({
    data: {
      telegramId: '123456789',
      name: 'Test User',
      currency: 'RD$',
      timezone: 'America/Santo_Domingo',
    },
  });

  // Create transactions
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        type: 'Income',
        amount: 50000,
        description: 'Monthly salary',
        transactionDate: new Date('2024-01-01'),
        categoryId: categories[2].id,
      },
      {
        userId: user.id,
        type: 'Expense',
        amount: 5000,
        description: 'Groceries',
        transactionDate: new Date('2024-01-05'),
        categoryId: categories[0].id,
      },
      {
        userId: user.id,
        type: 'Expense',
        amount: 3000,
        description: 'Restaurant',
        transactionDate: new Date('2024-01-10'),
        categoryId: categories[1].id,
      },
    ],
  });

  return { user, categories };
}
```

---

## Mocking Strategies

### Mock External Services

```typescript
// Mock Telegram Bot
const mockTelegramService = {
  sendMessage: jest.fn().mockResolvedValue({ ok: true }),
  editMessage: jest.fn().mockResolvedValue({ ok: true }),
  deleteMessage: jest.fn().mockResolvedValue({ ok: true }),
};

// Mock Notification Service
const mockNotificationService = {
  notify: jest.fn().mockResolvedValue(undefined),
  notifyBudgetThreshold: jest.fn().mockResolvedValue(undefined),
};

// In test
Test.createTestingModule({
  providers: [
    {
      provide: 'TelegramService',
      useValue: mockTelegramService,
    },
    {
      provide: NotificationService,
      useValue: mockNotificationService,
    },
  ],
});
```

### Mock Database

```typescript
// For testing without touching real database
const mockPrisma = {
  transaction: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};
```

---

## Coverage Reports

### Generate Coverage

```bash
npm run test:cov
```

This generates:
- `coverage/coverage-summary.json`
- `coverage/lcov-report/index.html`
- Terminal summary

### Coverage Thresholds

**jest.config.js:**
```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  './src/modules/transactions/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
}
```

### Coverage Badges

Generate badges for README:
```bash
npm run test:cov -- --coverageReporters=text-lcov | coveralls
```

---

## CI/CD Testing

### GitHub Actions Workflow

**.github/workflows/test.yml:**

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
          POSTGRES_DB: finbot_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit:cov
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Testing Best Practices

### 1. Test Independence
- Each test should be independent
- Use `beforeEach` / `afterEach` to set up/tear down
- Don't rely on test execution order

### 2. Clear Test Names
```typescript
// Good
it('should throw BadRequestException when amount is negative', async () => {

// Bad
it('tests amount', async () => {
```

### 3. Test One Thing
```typescript
// Good - focused test
it('should create a transaction with valid data', async () => {
  const result = await service.create(validDto);
  expect(result.id).toBeDefined();
});

// Bad - tests multiple things
it('should create transaction and update balance', async () => {
  // Too many assertions
});
```

### 4. Use Descriptive Assertions
```typescript
// Good
expect(result.amount).toBe(5000);
expect(result.type).toBe('Expense');

// Bad
expect(result).toBeTruthy();
```

### 5. Test Edge Cases
```typescript
describe('Amount validation', () => {
  it('should accept positive amounts', () => {...});
  it('should reject zero amounts', () => {...});
  it('should reject negative amounts', () => {...});
  it('should handle decimal amounts', () => {...});
  it('should handle very large amounts', () => {...});
});
```

### 6. Mock External Dependencies
- Always mock external APIs
- Mock database for unit tests
- Use real database for integration tests

### 7. Use Test Factories
- Create reusable test data
- Reduces test setup code
- Makes tests more maintainable

---

## Test Execution Commands

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Watch mode
npm run test -- --watch

# Coverage report
npm run test:cov

# Specific test file
npm run test -- transaction.spec.ts

# Specific test suite
npm run test -- --testNamePattern="should create"

# Update snapshots
npm test -- --updateSnapshot
```

---

## Debugging Tests

### Debug in VSCode

**.vscode/launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Verbose Output
```bash
npm test -- --verbose
```

### Single Test
```bash
npm test -- transaction.service.spec.ts
```

---

## Test Metrics

Track testing metrics:

| Metric | Target | Current |
|--------|--------|---------|
| Unit Test Coverage | 80% | - |
| Integration Coverage | 60% | - |
| Test Pass Rate | 100% | - |
| Average Test Duration | <5s | - |
| E2E Test Duration | <30s | - |
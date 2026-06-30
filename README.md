# FinBot - Telegram Personal Finance Assistant

A comprehensive personal finance management system accessible through Telegram.

## Project Structure

```
finbot/
├── src/
│   ├── modules/              # Feature modules
│   ├── database/             # Prisma & ORM config
│   ├── config/               # Configuration files
│   ├── common/               # Shared utilities
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── test/                     # Test files
├── docker-compose.yml        # Development stack
├── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose (optional)

### Installation

1. **Clone and install**
```bash
git clone <repo>
cd finbot
npm install
```

2. **Setup environment**
```bash
cp .env.example .env
```

3. **Start services (Docker)**
```bash
docker-compose up -d
```

4. **Setup database**
```bash
npx prisma migrate deploy
npm run db:seed
```

5. **Run development server**
```bash
npm run start:dev
```

API available at `http://localhost:3000`

## Available Scripts

```bash
# Development
npm run start:dev        # Watch mode
npm run build           # Build for production
npm start               # Run production build

# Testing
npm test               # Run all tests
npm run test:unit      # Unit tests only
npm run test:cov       # Coverage report

# Database
npm run db:migrate:dev  # Create migration
npm run db:seed        # Seed initial data
npm run db:studio      # Open Prisma Studio

# Linting
npm run lint           # Check code style
npm run lint:fix       # Fix code style
npm run format         # Format with Prettier
```

## Development

### Module Structure

Each module follows:
- `controllers/` - HTTP handlers
- `services/` - Business logic
- `repositories/` - Data access
- `dto/` - Data transfer objects
- `entities/` - Database models
- `module.ts` - Module definition

### Git Workflow

1. Create feature branch: `git checkout -b feature/description`
2. Make changes with tests
3. Push and create PR
4. Code review before merge

## Documentation

- [Comprehensive Documentation](./step.md) - Complete setup and API guide
- [Testing Guide](./step.md#testing-guide) - Unit, integration, E2E tests
- [API Documentation](./step.md#api-documentation) - Endpoints and responses

## Stack

- **Runtime**: Node.js 18+
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Caching**: Redis
- **Bot**: Telegraf (Telegram Bot API)
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint, Prettier

## Features (Roadmap)

### MVP
- ✅ User registration via Telegram
- ⬜ Income/expense tracking
- ⬜ Categories
- ⬜ Balance management
- ⬜ Payment reminders
- ⬜ Monthly reports

### Phase 2
- ⬜ Budgets
- ⬜ Saving goals
- ⬜ Web dashboard

### Phase 3
- ⬜ AI assistant
- ⬜ Receipt scanning
- ⬜ Mobile app

## License

MIT

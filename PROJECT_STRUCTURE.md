# 📁 Project Structure

```
dapp-wallet/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
│
├── components/            # React components
│   ├── admin-dashboard.tsx
│   ├── user-authorization.tsx
│   ├── transfer-requests.tsx
│   └── ...
│
├── lib/                   # Core libraries
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── supabase.ts       # Supabase client
│   └── config.ts         # Configuration
│
├── contracts/            # Smart contracts
│   └── AdvancedAuthorization.sol
│
├── docs/                 # 📚 Documentation
│   ├── README.md         # Documentation index
│   ├── GUIDE.md          # Setup guide
│   ├── ARCHITECTURE.md   # Architecture docs
│   └── ...
│
├── database/             # 🗄️ SQL files
│   ├── README.md         # Database docs
│   ├── production-schema.sql
│   └── supabase-migration.sql
│
├── public/               # Static assets
│
├── .env.local           # Environment variables
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── README.md            # Main readme
```

## Key Directories

- **`app/`** - Next.js 13+ app router pages
- **`components/`** - Reusable React components
- **`lib/`** - Core business logic and utilities
- **`contracts/`** - Solidity smart contracts
- **`docs/`** - All documentation files
- **`database/`** - SQL schemas and migrations

## Configuration Files

- `.env.local` - Environment variables (not in git)
- `package.json` - NPM dependencies
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration

# Tech Stack

## Framework & Build System

- **Next.js 16** with App Router (React 19)
- **TypeScript** with strict mode enabled
- **Turbopack** for development builds
- **npm** for package management

## Core Libraries

### Web3 & Blockchain
- **wagmi** (v2) - React hooks for Ethereum
- **viem** (v2) - TypeScript Ethereum library
- **RainbowKit** (v2) - Wallet connection UI
- **ethers** (v6) - Ethereum interactions

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- Tables: `authorizations`, `transfer_requests`
- Row Level Security (RLS) enabled

### UI & Styling
- **Tailwind CSS v4** - Utility-first CSS
- **Lucide React** - Icon library
- **clsx** - Conditional class names

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### State Management
- **TanStack Query** (React Query v5) - Server state management

## Smart Contracts

- **Solidity** contracts in `/contracts` directory
- **AdvancedAuthorization.sol** - Authorization logic with expiration and limits
- Compiled artifacts in `/artifacts` directory

## Common Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Configuration Files

- `tsconfig.json` - TypeScript config with path aliases (`@/*`)
- `next.config.ts` - Next.js config with webpack fallbacks for Web3
- `eslint.config.mjs` - ESLint configuration
- `postcss.config.mjs` - PostCSS for Tailwind
- `.env.local` - Environment variables (not in repo)

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_ADMIN_ADDRESS` - Admin wallet address
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID (optional)

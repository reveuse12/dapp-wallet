# Project Structure

## Directory Organization

```
/app                    # Next.js App Router
  /admin               # Admin-specific pages
  layout.tsx           # Root layout with Providers
  page.tsx             # Landing page
  globals.css          # Global styles

/components            # React components
  landing-page.tsx     # Main landing page
  admin-dashboard.tsx  # Admin interface
  user-authorization.tsx  # User authorization UI
  transfer-form.tsx    # Transfer form component
  transfer-requests.tsx   # Transfer request list
  transfer-history.tsx    # Transaction history
  token-balance.tsx    # Balance display
  address-book.tsx     # Address management
  owner-transfer.tsx   # Owner transfer component
  qr-generator.tsx     # QR code generation
  mobile-connect-button.tsx  # Mobile wallet connect
  providers.tsx        # Context providers (RainbowKit, Wagmi, React Query)
  toast.tsx           # Toast notifications

/lib                   # Utility libraries
  config.ts           # Wagmi/RainbowKit config
  chains.ts           # Chain configurations
  contracts.ts        # Contract ABIs and addresses
  supabase.ts         # Supabase client and types
  admin.ts            # Admin utilities
  utils.ts            # General utilities

/contracts             # Solidity smart contracts
  AdvancedAuthorization.sol  # Main authorization contract

/artifacts             # Compiled contract artifacts
  /contracts          # Contract compilation output
  /build-info         # Build metadata

/docs                  # Documentation
  authorization-system.md  # System architecture docs

/public               # Static assets
  *.svg              # SVG icons and images

/cache                # Build cache
  solidity-files-cache.json  # Solidity compilation cache
```

## Key Patterns

### Component Architecture
- Components are organized by feature/functionality
- Shared UI components at root of `/components`
- Feature-specific components grouped logically

### Configuration
- Centralized config in `/lib/config.ts`
- Environment-based configuration via `.env.local`
- Chain configs separated in `/lib/chains.ts`

### Data Layer
- Supabase client initialized in `/lib/supabase.ts`
- TypeScript interfaces defined alongside client
- Real-time subscriptions for live updates

### Styling
- Tailwind utility classes for styling
- Global styles in `app/globals.css`
- Component-scoped styles using Tailwind

### Path Aliases
- `@/*` maps to project root
- Import example: `import { config } from '@/lib/config'`

## File Naming Conventions

- React components: `kebab-case.tsx`
- Utilities/libs: `kebab-case.ts`
- Types/interfaces: Defined inline or in respective files
- Config files: Standard names (`next.config.ts`, `tsconfig.json`)

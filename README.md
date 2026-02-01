# 🍈 Durian - Crypto Payments for Chiang Mai

**Durian** is a crypto payment platform designed for businesses and tourists in Chiang Mai, Thailand. Accept USDC payments, verify with zkTLS, and settle in Thai Baht.

![Durian Platform](./docs/screenshot.png)

## Features

- **Privy Authentication** - Email login with auto-generated embedded wallets
- **USDC Payments** - Accept stablecoin payments on Base Sepolia
- **Primus zkTLS Verification** - Cryptographically verify DurianBank payment data
- **Business Directory** - Mapbox-powered discovery of crypto-friendly businesses
- **Thai Baht Settlement** - Offramp USDC to local bank accounts via PromptPay
- **Beautiful UI** - Premium design with dark mode support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth & Wallets**: Privy SDK
- **Database**: Supabase (PostgreSQL)
- **Payment Verification**: Primus Labs zkTLS
- **Maps**: Mapbox GL JS
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: Base Sepolia (USDC)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your API keys:

```bash
cp .env.local.example .env.local
```

Required keys:
- **Privy**: Get from [app.privy.io](https://app.privy.io)
- **Supabase**: Get from [supabase.com](https://supabase.com)
- **Primus Labs**: Get from [developer.primuslabs.xyz](https://developer.primuslabs.xyz)
- **Mapbox**: Get from [mapbox.com](https://mapbox.com)

### 3. Set Up Database

1. Create a new Supabase project
2. Run the schema in `supabase/schema.sql` via the SQL Editor
3. Enable Row Level Security policies

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
durian/
├── app/
│   ├── (marketing)/          # Landing, directory, legal
│   ├── (auth)/               # Login, profile
│   ├── (business)/           # Dashboard, onboarding
│   ├── (pay)/                # Payment screens
│   └── api/                  # API routes
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── ...                   # Custom components
├── lib/                      # Utils, config, stores
├── types/                    # TypeScript types
├── supabase/                 # Database schema
└── public/                   # Static assets
```

## Key Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Role selection + Privy auth |
| `/directory` | Business directory with map |
| `/place/[id]` | Business profile |
| `/pay/[intentId]` | Payment checkout |
| `/business/dashboard` | Merchant dashboard |
| `/business/onboarding` | 5-step business setup |
| `/profile` | Tourist profile |

## Payment Flow

1. **Generate QR** - Business creates payment intent with amount
2. **Select Method** - Customer chooses USDC or DurianBank
3. **Verify** - Primus zkTLS verifies payment data
4. **Settle** - USDC received, business can offramp to THB

## API Endpoints

- `POST /api/primus/verify` - Verify payment with zkTLS
- `POST /api/durianbank/create-link` - Generate DurianBank payment link
- `POST /api/payment/complete` - Mark payment as completed (webhook)

## Environment Variables

```env
# Privy
NEXT_PUBLIC_PRIVY_APP_ID=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Primus Labs
NEXT_PUBLIC_PRIMUS_APP_ID=
PRIMUS_APP_SECRET=

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=

# Blockchain
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_PLATFORM_WALLET=

# DurianBank (optional)
DURIANBANK_MERCHANT_ID=
DURIANBANK_SECRET=
```

## Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

Make sure to add all environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Hackathon Demo

1. **Tourist Flow**: Browse directory → Select business → Pay with USDC
2. **Merchant Flow**: Register → Complete onboarding → Generate QR → Receive payment
3. **zkTLS Demo**: Pay via DurianBank → Primus verifies → Proof displayed

## Contributing

This project was built for the ETH Chiang Mai 2026 hackathon. Contributions welcome!

## License

MIT

---

Built with 💚 for Chiang Mai by the Durian team

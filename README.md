# School Fee Management Platform

A comprehensive school fee management system with mobile money payments, designed for African educational institutions. Built with Next.js, Supabase, and integrated with MTN Mobile Money and Orange Money.

## Demo

See it in action: [https://school-fee-platform.vercel.app/](https://school-fee-platform.vercel.app/)

![School Fee Management Platform](hero.png)

## Features

### 🏫 School Management
- Multi-school platform with approval workflow
- Department and specialty management
- Student enrollment and tracking
- Fee structure configuration

### 📱 Mobile Money Integration
- **MTN Mobile Money** - Support for 21+ African countries
- **Orange Money** - Coverage across 17+ African markets
- Real-time payment processing and verification
- Webhook notifications for payment status updates

### 👨‍🎓 Student Portal
- Self-service enrollment
- Payment plan management
- Mobile money payment processing
- Payment history and receipts

### 🏛️ School Administration
- Student management (individual and bulk registration)
- Payment tracking and reporting
- Department and specialty management
- Analytics and insights

### 🔧 Super Admin Dashboard
- Platform-wide analytics
- School approval workflow
- Transaction monitoring
- System configuration

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Database:** [Supabase](https://supabase.com/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** Supabase Auth
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Payment Gateways:** MTN Mobile Money & Orange Money APIs
- **Type Safety:** TypeScript throughout

## Mobile Money Coverage

### MTN Mobile Money
- **Countries:** Cameroon, Ghana, Uganda, Rwanda, Zambia, Ivory Coast, Benin, Guinea, Liberia, South Sudan, Eswatini, Afghanistan
- **Currencies:** XAF, GHS, UGX, RWF, ZMW, XOF, USD
- **Features:** Collections, Disbursements, Balance checks

### Orange Money
- **Countries:** Cameroon, Ivory Coast, Mali, Senegal, Burkina Faso, Niger, Madagascar, DRC, Guinea, Sierra Leone, Liberia, CAR, Chad, Egypt, Jordan
- **Currencies:** XAF, XOF, USD, EUR
- **Features:** Payments, Transfers, Balance verification

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Supabase account
- MTN Mobile Money developer account
- Orange Money developer account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/school-fee-platform.git
   cd school-fee-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="your-supabase-database-url"
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   
   # MTN Mobile Money
   MTN_API_KEY="your-mtn-api-key"
   MTN_API_SECRET="your-mtn-api-secret"
   MTN_ENVIRONMENT="sandbox"
   MTN_WEBHOOK_SECRET="your-mtn-webhook-secret"
   
   # Orange Money
   ORANGE_API_KEY="your-orange-api-key"
   ORANGE_API_SECRET="your-orange-api-secret"
   ORANGE_ENVIRONMENT="sandbox"
   ORANGE_WEBHOOK_SECRET="your-orange-webhook-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Drizzle migrations
   pnpm db:generate
   
   # Apply migrations
   pnpm db:migrate
   
   # Seed the database
   pnpm db:seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Management

This project uses Drizzle ORM for type-safe database operations:

```bash
# Generate new migration
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema changes (development)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio

# Seed database with sample data
pnpm db:seed
```

## Mobile Money Integration

### Testing Payments

For sandbox testing, use these test credentials:

**MTN Mobile Money (Sandbox):**
- Phone: Any valid format (e.g., +237612345678)
- Amount: Any amount in supported currency
- The sandbox will simulate payment approval

**Orange Money (Sandbox):**
- Phone: Any valid format for supported countries
- Amount: Test with various amounts
- Sandbox environment simulates different payment scenarios

### Webhook Configuration

Set up webhooks in your mobile money provider dashboards:

- **MTN MoMo:** `https://yourdomain.com/api/webhooks/mobile-money/mtn`
- **Orange Money:** `https://yourdomain.com/api/webhooks/mobile-money/orange`

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard components
│   ├── payments/          # Payment components
│   └── ...
├── lib/
│   ├── db/                # Database schema and queries
│   ├── payment-gateways/  # Mobile money integrations
│   └── utils/
├── styles/                # Global styles
└── utils/                 # Utility functions
```

## API Endpoints

### Payment APIs
- `POST /api/payments/mobile-money` - Initiate mobile money payment
- `POST /api/payments/verify` - Verify payment status
- `POST /api/webhooks/mobile-money/[gateway]` - Handle payment webhooks

### Authentication
- Uses Supabase Auth with email/password and social providers
- Role-based access control (Student, School Admin, Super Admin)

## Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

2. **Set environment variables** in Vercel dashboard

3. **Configure webhooks** with your production domain

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- All payment data is processed securely through official mobile money APIs
- Webhook signatures are verified to ensure authenticity
- Environment variables are used for sensitive configuration
- Database queries use parameterized statements to prevent SQL injection

## Support

For support and questions:
- Create an issue on GitHub
- Contact: support@schoolfeeplatform.com
- Documentation: [docs.schoolfeeplatform.com](https://docs.schoolfeeplatform.com)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [MTN Mobile Money](https://momodeveloper.mtn.com/) for payment processing
- [Orange Money](https://developer.orange.com/) for mobile payment solutions
- [Supabase](https://supabase.com/) for backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
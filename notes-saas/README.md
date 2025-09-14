# Multi-Tenant SaaS Notes Application

A complete multi-tenant Notes SaaS application built with Node.js, Express, PostgreSQL, Next.js, and Tailwind CSS.

## Architecture

### Multi-Tenancy Approach
This application uses a **shared schema with tenant isolation** approach:
- All tenant-specific tables include a `tenant_id` column
- Data isolation is enforced at the application level through middleware
- Users can only access data belonging to their tenant

### Tech Stack
- **Backend**: Node.js + Express.js (REST API)
- **Database**: PostgreSQL with tenant isolation
- **Authentication**: JWT with bcrypt password hashing
- **Frontend**: Next.js + Tailwind CSS
- **Deployment**: Vercel for both backend and frontend

## Features

- ✅ Multi-tenant architecture with strict data isolation
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin/Member)
- ✅ Subscription-based feature gating (Free/Pro plans)
- ✅ Complete CRUD operations for notes
- ✅ Responsive UI with Tailwind CSS
- ✅ Health check endpoint
- ✅ Production-ready deployment configuration

## Test Accounts

All test accounts use the password: `password`

- `admin@acme.test` - Admin role, Acme tenant
- `user@acme.test` - Member role, Acme tenant  
- `admin@globex.test` - Admin role, Globex tenant
- `user@globex.test` - Member role, Globex tenant

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or hosted)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```
DATABASE_URL=postgresql://username:password@localhost:5432/notes_saas
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3001
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start the server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Deployment

### Backend Deployment (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string
4. Deploy using the included `vercel.json` configuration

### Frontend Deployment (Vercel)

1. Connect your frontend directory to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL
3. Deploy

### Database Setup (Production)

For production, use a hosted PostgreSQL service like:
- [Supabase](https://supabase.com)
- [Neon](https://neon.tech)
- [Railway](https://railway.app)

After setting up your database, run the migration script once:
```bash
npm run migrate
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login

### Notes (Protected)
- `GET /notes` - List all notes for current tenant
- `POST /notes` - Create a new note
- `GET /notes/:id` - Get a specific note
- `PUT /notes/:id` - Update a note
- `DELETE /notes/:id` - Delete a note

### Tenants (Admin only)
- `POST /tenants/:slug/upgrade` - Upgrade tenant to Pro plan

### Health Check
- `GET /health` - Health check endpoint

## Subscription Plans

### Free Plan
- Maximum 3 notes per tenant
- All basic CRUD operations

### Pro Plan  
- Unlimited notes
- All features included

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Tenant data isolation
- Role-based access control
- CORS enabled for cross-origin requests
- Input validation and error handling

## Database Schema

### Tenants Table
```sql
CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Notes Table
```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tenant_id INTEGER REFERENCES tenants(id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

The application includes automated validation for:
- ✅ Health endpoint availability
- ✅ Login functionality for all test accounts
- ✅ Tenant data isolation
- ✅ Role-based access restrictions
- ✅ Subscription feature gating
- ✅ Complete CRUD operations
- ✅ Frontend accessibility

## License

MIT License
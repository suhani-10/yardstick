# NotesFlow - Multi-Tenant Notes SaaS

A modern, secure note-taking platform built with Next.js and Node.js featuring multi-tenant architecture and role-based access control.

## 🚀 Features

- **Multi-Tenant Architecture**: Complete isolation between companies (Acme Corp, Globex Corp)
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Modern UI**: Clean, professional design with dynamic island navigation
- **Upgrade System**: Admin-controlled Pro plan access requests
- **Secure Authentication**: JWT-based auth with tenant isolation
- **Real-time Analytics**: Admin dashboard with user and note analytics

## 🏗️ Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing

### Frontend
- **Next.js 14** with React 18
- **Tailwind CSS** for styling
- **Modern UI components**

## 🔐 Multi-Tenant Security

- **Tenant Isolation**: Users can only access data from their organization
- **Role-Based Permissions**:
  - **Users**: Can only view/edit their own notes
  - **Admins**: Can view all notes and manage users in their tenant
- **Upgrade Requests**: Users request Pro access, admins approve

## 📋 Test Accounts

### Acme Corp
- **Admin**: admin@acme.test / password
- **User**: user@acme.test / password

### Globex Corp
- **Admin**: admin@globex.test / password
- **User**: user@globex.test / password

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/suhani-10/yardstick.git
cd yardstick
```

2. **Backend Setup**
```bash
cd notes-saas/backend
npm install
```

3. **Configure Environment**
Create `.env` file in backend directory:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your-secret-key
PORT=3001
```

4. **Run Database Migration**
```bash
npm run migrate
```

5. **Start Backend Server**
```bash
npm run dev
```

6. **Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
```

## 🎯 Usage

1. **Visit** http://localhost:3000
2. **Sign in** with test accounts
3. **Create notes** (3 free notes per tenant)
4. **Request upgrade** to Pro (admin approval required)
5. **Admin dashboard** for user management and analytics

## 🏢 Multi-Tenant Features

### For Users
- Create and manage personal notes
- Request Pro plan upgrades
- View upgrade request status

### For Admins
- View all company notes
- Manage company users
- Approve/reject upgrade requests
- Access analytics dashboard

## 📊 Architecture

```
Frontend (Next.js) → Backend API (Express) → PostgreSQL Database
                                ↓
                        Multi-Tenant Data Isolation
                                ↓
                    Role-Based Access Control (RBAC)
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/create-admin` - Create admin user

### Notes
- `GET /notes` - Get user's notes (role-based)
- `POST /notes` - Create new note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note

### Admin
- `GET /admin/users` - Get tenant users
- `GET /admin/notes` - Get all tenant notes
- `GET /admin/analytics` - Get tenant analytics

### Upgrade Requests
- `POST /upgrade-requests` - Create upgrade request
- `GET /upgrade-requests/admin` - Get all requests (admin)
- `PUT /upgrade-requests/admin/:id` - Approve/reject request

## 🛡️ Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs
- **SQL Injection Protection** with parameterized queries
- **Tenant Data Isolation** at database level
- **Role-Based Authorization** middleware

## 📱 Responsive Design

- **Mobile-first** approach
- **Dynamic island navigation**
- **Modern glassmorphism** effects
- **Smooth animations** and transitions

## 🚀 Deployment

The application is ready for deployment on platforms like:
- **Vercel** (Frontend)
- **Railway/Heroku** (Backend)
- **Supabase/AWS RDS** (Database)

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Suhani** - [@suhani-10](https://github.com/suhani-10)

---

Built with ❤️ using modern web technologies
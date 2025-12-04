# WizdomMaster Quiz API

Interactive Quiz Application Backend - Production-ready REST API

## 🚀 Overview

WizdomMaster is a scalable, production-ready REST API for an Interactive Quiz Application supporting Web, Android, and iOS clients. The application supports three question types (Multiple Choice, Checkbox, Yes/No), rich media, user management, and admin controls.

## 🛠️ Tech Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 4.18+
- **Language**: TypeScript 5.3+
- **Database**: PostgreSQL 16+
- **ORM**: Prisma 5.7+
- **Cache**: Redis 7.2+
- **Storage**: AWS S3 + CloudFront
- **Auth**: JWT + Passport.js
- **Validation**: Zod
- **Testing**: Jest + Supertest

## 📋 Features

- User Authentication (Register, Login, JWT Refresh)
- Three Question Types: Multiple Choice, Checkbox, Yes/No
- Configurable Quizzes with time limits
- Rich Media Support (Image upload to S3)
- User Progress Tracking
- Certificate Generation
- Admin Dashboard for Content Management
- Comprehensive Analytics

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- PostgreSQL
- Redis
- AWS S3 Bucket

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd wizdommaster-quiz-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Update the .env file with your actual configuration values.

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Build the application:
```bash
npm run build
```

6. Run the application:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User Registration
- `POST /api/v1/auth/login` - User Login
- `POST /api/v1/auth/refresh` - Refresh Access Token
- `POST /api/v1/auth/logout` - User Logout
- `POST /api/v1/auth/forgot-password` - Forgot Password
- `POST /api/v1/auth/reset-password` - Reset Password

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get specific category
- `POST /api/v1/admin/categories` - Create category (Admin)
- `PUT /api/v1/admin/categories/:id` - Update category (Admin)
- `DELETE /api/v1/admin/categories/:id` - Delete category (Admin)

### Quizzes
- `GET /api/v1/quizzes` - Get all quizzes
- `GET /api/v1/quizzes/:id` - Get specific quiz
- `POST /api/v1/quizzes/:id/start` - Start quiz
- `POST /api/v1/quizzes/:id/submit` - Submit quiz answers
- `POST /api/v1/admin/quizzes` - Create quiz (Admin)
- `PUT /api/v1/admin/quizzes/:id` - Update quiz (Admin)
- `DELETE /api/v1/admin/quizzes/:id` - Delete quiz (Admin)

### Questions
- `GET /api/v1/admin/questions` - Get all questions (Admin)
- `GET /api/v1/admin/questions/:id` - Get specific question (Admin)
- `POST /api/v1/admin/questions` - Create question (Admin)
- `PUT /api/v1/admin/questions/:id` - Update question (Admin)
- `DELETE /api/v1/admin/questions/:id` - Delete question (Admin)

### User Progress
- `GET /api/v1/users/me/progress` - Get user progress
- `GET /api/v1/users/me/attempts` - Get user quiz attempts
- `GET /api/v1/users/me/certificates` - Get user certificates

### Admin Analytics
- `GET /api/v1/admin/analytics` - Get analytics (Admin)
- `GET /api/v1/admin/users` - Get all users (Admin)
- `GET /api/v1/admin/users/:id` - Get specific user (Admin)

### File Upload
- `POST /api/v1/admin/upload/image` - Upload image (Admin)

## 🔐 Authentication

The API uses JWT-based authentication. After successful login, users receive an access token (15 minutes expiry) and a refresh token (7 days expiry). Include the access token in the Authorization header for protected routes:

```
Authorization: Bearer <access_token>
```

## 🧪 Testing

Run unit tests:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 🚀 Deployment

For production deployment on AWS Lightsail:

1. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Install PM2:
```bash
sudo npm install -g pm2
```

3. Clone and setup the application:
```bash
git clone <repo-url>
cd quiz-api
npm install
npm run build
npx prisma migrate deploy
```

4. Start with PM2:
```bash
pm2 start dist/server.js --name quiz-api
pm2 save
pm2 startup
```

## 📊 Performance Targets

- API response time: < 200ms (average)
- Database query time: < 50ms (average)
- Concurrent users: 3000+
- Uptime: 99.9%

## 🛡️ Security

- HTTPS only
- JWT with short expiration (15min)
- Bcrypt password hashing (12 rounds)
- Input validation (Zod)
- SQL injection prevention (Prisma ORM)
- XSS protection (Helmet)
- CORS configuration
- Rate limiting (100 req/min)
- Environment variables for secrets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact your development team.
# 🚀 KoneksiKarir

Welcome to **KoneksiKarir**! This is a modern job connection platform built with Next.js, Prisma, and PostgreSQL. It helps job seekers and companies connect, manage profiles, and streamline recruitment processes.

---

## 📦 General Project Overview

KoneksiKarir is designed to:

- Connect job seekers with companies
- Manage user and company profiles
- Handle job applications and events
- Provide admin dashboards for management

---

## 💡 Use Cases

- **Job Seekers:** Create and manage professional profiles, upload documents, track applications, and connect with companies.
- **Companies:** Post job openings, manage company profiles, review applicants, and organize recruitment events.
- **Admins:** Oversee platform activity, manage users and companies, and generate reports.

---

## 🛠️ Getting Started (Basic Tutorial)

### 1. Clone the Repository

```bash
git clone https://github.com/AbyanCore/KoneksiKarir.git
cd KoneksiKarir
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory. Example:

```env
DATABASE_URL="postgres://admin:letmein@localhost:5432/db-koneksikarir-demo"
JWT_SECRET="your_jwt_secret"
NODE_ENV="development"
ADMIN_EMAIL="admin@koneksikarir.com"
ADMIN_PASSWORD="your_admin_password"
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🌱 Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT authentication
- `NODE_ENV`: Node environment (`development`/`production`)
- `ADMIN_EMAIL`: Default admin email
- `ADMIN_PASSWORD`: Default admin password

---

## 📚 Folder Structure

```
├── prisma/           # Prisma schema & migrations
├── src/              # Source code
│   ├── app/          # Next.js app routes & pages
│   ├── components/   # React components
│   ├── lib/          # Utility libraries
│   ├── server/       # Server logic & routers
│   └── types/        # Type definitions
├── public/           # Static assets
├── data/             # Sample data
├── .env              # Environment variables
├── package.json      # Project metadata & scripts
```

---

## 🐳 Docker Setup

You can run KoneksiKarir using Docker for easy local development and deployment.

### 1. Build and Start Services

Make sure you have Docker and Docker Compose installed.

```bash
docker-compose up --build
```

This will start the Next.js app and a PostgreSQL database using the configuration in `docker-compose.yml`.

### 2. Environment Variables

Edit the `.env` file as needed. The default `docker-compose.yml` expects:

- `DATABASE_URL` (should match the database service in docker-compose)
- `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc.

### 3. Access the App

Once started, visit [http://localhost:3000](http://localhost:3000).

---

## 🧑‍💻 Tech Stack

- **Next.js** (React framework)
- **Prisma** (ORM)
- **PostgreSQL** (Database)
- **TypeScript**
- **Docker** (optional for deployment)

---

## 📝 More Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📧 Contact

For questions or support, email: [danishabyanpratista@gmail.com](mailto:danishabyanpratista@gmail.com)

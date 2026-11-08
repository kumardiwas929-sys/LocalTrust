# LocalTrust – Local Service Booking Platform

LocalTrust is a full-stack service marketplace platform that connects customers with local service providers. Customers can discover services, book appointments, and track their bookings, while service providers can manage shops, services, employees, and customer requests.

## 🚀 Features

### Customer
- User registration and login
- Browse local services
- Book services
- Track booking status
- Manage profile
- Payment functionality

### Service Provider / Shop Admin
- Manage shop profile
- Add, update and delete services
- Set individual service prices
- Receive customer booking requests
- Accept or reject bookings
- Assign employees
- Track service progress

### Employee
- View assigned tasks
- Accept assigned work
- Update work status
- Manage profile

### Main Admin
- Manage customers and providers
- Manage shops and employees
- Monitor bookings
- Manage platform activities
- View analytics

## 🛠️ Technology Stack

- Frontend: React.js, Vite
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT
- Icons: Lucide React

## 📁 Project Structure

```text
LocalTrust/
├── client/
│   ├── src/
│   └── package.json
├── server/
│   ├── src/
│   └── package.json
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/kumardiwas929-sys/LocalTrust.git
cd LocalTrust
```

### 2. Setup Frontend

```bash
cd client
npm install
npm run dev
```

### 3. Setup Backend

Open another terminal:

```bash
cd server
npm install
npm run dev
```

### 4. Environment Configuration

Configure your environment variables in the appropriate `.env` files. Add your MongoDB connection string, JWT secret and other required settings.

Never upload secrets or passwords to GitHub.

## 🌐 Application

Frontend: http://localhost:5173

Backend: http://localhost:5000

## 👨‍💻 Developer

Developed as a full-stack service marketplace project.

## 📄 License

This project is currently available for educational and development purposes.

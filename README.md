# Full-Stack To-Do Application

> **Note:** This project was generated using Vibe Coding AI on Vercel v0. It's intended as a hands-on example for Cloud and DevOps deployment practice.

A complete todo application built with vanilla HTML/CSS/JavaScript frontend, Node.js/Express backend, MySQL database, and Nginx reverse proxy.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Docker Setup](#option-1-docker-setup-recommended)
  - [Manual Setup](#option-2-manual-setup)
  - [Individual Docker Containers](#option-3-individual-docker-containers)
- [Security Features](#security-features)

## ✨ Features

- ✅ **User Authentication**
  - Register new accounts
  - Login with username/password
  - Secure logout
  - JWT token-based authentication
  
- ✅ **Todo Management**
  - Create new todos
  - View all your todos
  - Update todo content and status
  - Delete unwanted todos
  
- ✅ **Modern UI/UX**
  - Dark mode interface
  - Responsive design for all devices
  - Clean, intuitive user interface
  
- ✅ **DevOps Ready**
  - Docker containerization
  - Nginx reverse proxy configuration
  - MySQL database integration
  - Comprehensive logging system

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Vanilla HTML, CSS, JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL |
| **Reverse Proxy** | Nginx |
| **Containerization** | Docker |

## 📁 Project Structure

```
.
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── server.js               # Express server setup
│   ├── package.json            # Backend dependencies
│   ├── .env                    # Environment variables
│   ├── Dockerfile              # Backend container config
│   └── .dockerignore           # Files to exclude from container
├── frontend/
│   ├── index.html              # Main HTML page
│   ├── style.css               # Styles (dark mode)
│   ├── script.js               # Frontend JavaScript
│   ├── nginx.conf              # Nginx configuration
│   ├── Dockerfile              # Frontend container config
│   └── .dockerignore           # Files to exclude from container
├── .gitignore                  # Git ignore file
└── README.md                   # This documentation
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/auth/register` | Register a new user | `{ username, password }` | `{ message, userId }` |
| `POST` | `/auth/login` | Login user | `{ username, password }` | `{ message, token, user }` |
| `POST` | `/auth/logout` | Logout user | None (requires auth token) | `{ message }` |

### Todos

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/todos` | Get all todos | None (requires auth token) | Array of todo objects |
| `POST` | `/todos` | Create a new todo | `{ title, description }` | Created todo object |
| `PUT` | `/todos/:id` | Update a todo | `{ title?, description?, completed? }` | Updated todo object |
| `DELETE` | `/todos/:id` | Delete a todo | None (requires auth token) | `{ message }` |

## 🚀 Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) (for Docker setup)
- [Node.js](https://nodejs.org/) v18+ (for manual setup)
- [MySQL](https://dev.mysql.com/downloads/) (for manual setup)

### Option 1: Docker Setup (Recommended)

This is the easiest way to get started with minimal configuration.

#### 1. Clone the repository

```bash
git clone <repository-url>
cd fullstack-todo-app
```

#### 2. Create a Docker Compose file

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: todoapp
      MYSQL_USER: todouser
      MYSQL_PASSWORD: todopassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build: ./backend
    environment:
      DB_HOST: mysql
      DB_USER: todouser
      DB_PASSWORD: todopassword
      DB_NAME: todoapp
      JWT_SECRET: your-super-secret-jwt-key-change-this-in-production
    ports:
      - "3000:3000"
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

#### 3. Build and run with Docker Compose

```bash
docker-compose up --build
```

This command will:
- Build the Docker images for frontend and backend
- Start the MySQL database
- Connect all services together
- Expose the application on port 80

#### 4. Access the application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **MySQL**: localhost:3306

### Option 2: Manual Setup

If you prefer to run the application without Docker, follow these steps:

#### 1. Setup MySQL Database

```bash
# Install MySQL and create database
mysql -u root -p

# Then in MySQL shell:
CREATE DATABASE todoapp;
CREATE USER 'todouser'@'localhost' IDENTIFIED BY 'todopassword';
GRANT ALL PRIVILEGES ON todoapp.* TO 'todouser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file
cat > .env << EOL
PORT=3000
DB_HOST=localhost
DB_USER=todouser
DB_PASSWORD=todopassword
DB_NAME=todoapp
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EOL

# Start the server
npm start
```

#### 3. Setup Frontend

```bash
cd frontend

# Option 1: Using Python's built-in HTTP server
python3 -m http.server 8080

# Option 2: Using Node.js serve package
npx serve .
```

#### 4. Setup Nginx (Optional)

Install Nginx and copy the `frontend/nginx.conf` configuration to your Nginx configuration directory.

### Option 3: Individual Docker Containers

If you want more control over each container:

#### 1. Run MySQL

```bash
docker run -d \
  --name todo-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=todoapp \
  -e MYSQL_USER=todouser \
  -e MYSQL_PASSWORD=todopassword \
  -p 3306:3306 \
  mysql:8.0
```

#### 2. Build and run Backend

```bash
cd backend
docker build -t todo-backend .
docker run -d \
  --name todo-backend \
  --link todo-mysql:mysql \
  -e DB_HOST=mysql \
  -e DB_USER=todouser \
  -e DB_PASSWORD=todopassword \
  -e DB_NAME=todoapp \
  -e JWT_SECRET=your-secret-key \
  -p 3000:3000 \
  todo-backend
```

#### 3. Build and run Frontend

```bash
cd frontend
docker build -t todo-frontend .
docker run -d \
  --name todo-frontend \
  --link todo-backend:backend \
  -p 80:80 \
  todo-frontend
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for proper cross-origin resource sharing
- **Input Validation**: Thorough validation of all user inputs
- **SQL Injection Prevention**: Parameterized queries for all database operations
- **XSS Protection**: HTML escaping for user-generated content

---

Built with ❤️ using Vibe Coding AI on Vercel v0

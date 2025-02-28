<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# UPSRJ Landing Backend

## Prerequisites

Before you download the project, make sure you have the following installed:

### Node.js
Node.js is an open-source, cross-platform runtime environment that allows you to run JavaScript code on the server-side.
```
https://nodejs.org/es
```

### pnpm
pnpm is a fast, disk space-efficient package manager for JavaScript and Node.js.
```bash
npm install -g pnpm
```

### NestJS CLI
The Nest CLI is a command-line interface tool that helps you initialize, develop, and maintain your Nest applications.
```bash
npm i -g @nestjs/cli
```

## Project Setup

### 1. Clone the project
```bash
$ git clone <NombreDelProyecto>
```

### 2. Install dependencies
```bash
$ pnpm install
```

### 3. Configure Environment Variables
This environment will help you with the connection to the database (Postgres).
"This connection is for when you use it with Postgres directly installed on your system."
#### Option A: For direct Postgres installation
Create a `.env` file in the project root with:
```bash
JWT_SECRET='Secreto'
PORT=3002
DB_PASSWORD=root
DB_NAME=NameOFTheDatabase
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
CONTAINER_NAME=NameOFTheContainer

# Password for seed creation
PASSWORD_SEED='SecretoContraseña'
```

#### Option B: For Docker setup
Create a `.env` file in the project root with:
```bash
JWT_SECRET='Secreto'
PORT=3002
DB_PASSWORD=root
DB_NAME=NameOFTheDatabase
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=postgres
CONTAINER_NAME=NameOFTheContainer

# Password for seed creation
PASSWORD_SEED='SecretoContraseña'
```

### 4. Database Setup with Docker
```bash
$ docker-compose up -d
```

## Running the Application

```bash
# Development mode
$ pnpm run start

# Watch mode (auto-reload)
$ pnpm run start:dev

# Production mode
$ pnpm run start:prod
```

## Deployment Guide

1. Create the `.env` file
2. Configure production environment variables
3. Build the Docker image:
```
docker-compose -f docker-compose.prod.yaml --env-file .env up --build
```
4. Reload existing image:
```
docker-compose -f docker-compose.prod.yaml --env-file .env.prod up -d
```

## Technology Stack

* Postgres
* MongoDB
```
npm i mongodb@5.9.2
```
* NodeJs
* Docker / Docker Compose
* NestJS

## Development Notes

### For MAC users (remove prettier)
```
pnpm remove prettier eslint-config-prettier eslint-plugin-prettier
```

### Bcrypt migration
```
pnpm i bcryptjs
```

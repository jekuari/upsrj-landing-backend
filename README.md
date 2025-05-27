<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# UPSRJ Landing Backend

## Environment Setup

Before you download the project, make sure you have the following installed:

### Node.js (v22)
Node.js is an open-source, cross-platform runtime environment that allows you to run JavaScript code on the server-side. Install [here](https://nodejs.org/es).

```
nvm install 22
nvm use 22
```

### Typescript
TypeScript checks a program for errors before execution, and does so based on the kinds of values, making it a static type checker
```bash
npm install -g typescript
```

### PNPM (v10.10)
pnpm is a fast, disk space-efficient package manager for JavaScript and Node.js.
```bash
npm install -g pnpm@latest-10
```

### NestJS CLI
The Nest CLI is a command-line interface tool that helps you initialize, develop, and maintain your Nest applications.
```bash
npm i -g @nestjs/cli
```

### MongoDB 
Install MongoDB [here](https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.6-signed.msi).
```
pnpm i mongodb@5.9.2
```

## Project Setup

### 1. Clone repository
```bash
$ git clone https://github.com/KirbyMondragon/upsrj-landing-backend
```

### 2. Install dependencies
```bash
$ pnpm install
```

### 3. Database Setup with Docker
```bash
$ docker-compose up -d
```

### 4. Running the Application
```bash
# Development mode
$ pnpm run start

# Watch mode (auto-reload)
$ pnpm run start:dev

# Production mode
$ pnpm run start:prod
```

## Testing with Postman

Get the endpoint testing collection [here](https://backend-landing-upsrj.postman.co/workspace/Backend-Landing-UPSRJ-Workspace~6884a801-57c1-435a-bc4a-c245965c628f/collection/40218342-a8abcfdc-cb4f-4540-baea-bf89c7bb98f9?action=share&creator=40218342). Or download it [here](https://drive.google.com/file/d/1QHFINBt2jAIs7_jX0EVPjtZb7MsdDKYD/view?usp=sharing).

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

* MongoDB
* NodeJs
* Docker Compose
* NestJS

---

## Development Notes

### For MAC users (remove prettier)
```
pnpm remove prettier eslint-config-prettier eslint-plugin-prettier
```

### Bcrypt migration
```
pnpm i bcryptjs
```

### Image Module with GridFS

The backend uses **GridFS with MongoDB** to efficiently store and manage images. This module facilitates integration with **Puck** for image display on the frontend.

#### Features
- Image processing with **Sharp** (resizing and optimization)
- Storage in MongoDB **GridFS**
- Automatic conversion to **WebP** format for better performance
- **REST API** to upload, retrieve, and delete images

#### Required Dependencies
```bash
# Install Sharp for image processing
pnpm add sharp

# Approve Sharp build scripts
pnpm approve-builds sharp

```

### Usage on the Frontend with Puck

1. **Uploading an image:**:
   ```typescript
   // Example of how to upload an image from the frontend
   async function uploadImage(file) {
     // Convert file to base64
     const base64 = await fileToBase64(file);
     
     const response = await fetch('http://localhost:3000/api/images', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
       },
       body: JSON.stringify({
         base64Image: base64,
         width: 500,  // optional
         height: 300  // optional
       })
     });
     
     const data = await response.json();
     return data.imageUrl; // URL to use in Puck
   }
   
   // Helper function to convert file to base64
   function fileToBase64(file) {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.readAsDataURL(file);
       reader.onload = () => resolve(reader.result);
       reader.onerror = error => reject(error);
     });
   }
   ```

2. **Using the image in Puck:**:
   ```typescript
   // Inside your Puck component
   const MyPuckComponent = {
     defaultProps: {
       imageUrl: '',
     },
     render: ({ imageUrl }) => (
       <div>
         {imageUrl && <img src={`http://localhost:3000/api${imageUrl}`} alt="Uploaded image" />}
       </div>
     )
   }
   ```

3. **Direct image requests**:
   - Access a specific image: `http://localhost:3000/api/images/{uuid}`
   - List all images: `http://localhost:3000/api/images`


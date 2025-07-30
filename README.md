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

## Api Module Documentation

### Images Module

Handles image storage (GridFS) with processing (Sharp).
Base Route: /api/files/images

#### Entity
```typescript
class Image {
  id: string;           // UUID
  filename: string;     // Original name (e.g., "banner.png")
  gridFsId: ObjectId;   // MongoDB GridFS reference
  contentType: string;  // MIME type (e.g., "image/webp")
  createdAt: Date;
}
```
#### Endpoints

| Method | Endpoint            | Description                                                                 |
|--------|---------------------|-----------------------------------------------------------------------------|
| POST   | /api/images         | Upload an image (auto-converts to WebP, resizes to max 1080px height).     |
| GET    | /api/images/{id}    | Stream an image by ID (directly usable in `<img>` tags).                   |
| GET    | /api/images/list    | List all images (paginated, with URLs).                                    |
| DELETE | /api/images/{id}    | Delete an image and its metadata.                                          |

#### Examples 

Upload (front)

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/images', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' },
  body: formData
});
// Response: { "id": "abc123", "url": "/api/images/abc123" }
```

Display in HTML

```typescript
<img src="http://localhost:3000/api/images/abc123" alt="Uploaded Image" />
```

### Files Module

Manages PDF file storage (GridFS). 
Base Route: /api/files/pdf

#### Entity

```typescript
class Files {
  id: string;           // UUID
  filename: string;     // Original name (e.g., "report.pdf")
  gridFsId: ObjectId;   // GridFS reference
  contentType: string;  // Always "application/pdf"
  createdAt: Date;
}
```

#### Endpoints

```typescript
| Method | Endpoint           | Description                            |
|--------|--------------------|----------------------------------------|
| POST   | /api/files         | Upload a PDF (validates MIME type).    |
| GET    | /api/files/{id}    | Stream a PDF by ID.                    |
| GET    | /api/files/list    | List PDFs (paginated, with metadata).  |
| DELETE | /api/files/{id}    | Delete a PDF and its metadata.         |
```

#### Examples

Download PDF (front)

```typescript
// Fetch PDF as a blob
const response = await fetch('/api/files/abc123', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
const blob = await response.blob();

// Open in new tab
const url = URL.createObjectURL(blob);
window.open(url);
```
### Puck Components Module

Stores reusable UI components (JSON configurations).
Base Route: /api/puck-components

####Entity

```typescript
class PuckComponent {
  id?: ObjectId;      // Auto-generated
  slug: string;       // URL-safe ID (e.g., "hero-banner")
  root: {             // Puck-compatible JSON
    type: string;
    props: Record<string, any>;
  };
  createdAt: Date;
}
```

#### Endpoints

| Method | Endpoint                          | Description                                 |
|--------|-----------------------------------|---------------------------------------------|
| POST   | /api/puck-components              | Create/update a component (auto-slugifies names). |
| GET    | /api/puck-components/{slug}       | Fetch a component by slug.                  |
| GET    | /api/puck-components/list         | List all components (paginated).            |
| DELETE | /api/puck-components/{slug}       | Delete a component.                         |

#### Examples

Save a component 

```typescript
const response = await fetch('/api/puck-components', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    slug: 'hero-banner', // Optional (auto-generated if omitted)
    root: {
      type: 'HeroBanner',
      props: { title: 'Welcome', color: 'blue' }
    }
  })
});
// Response: { "slug": "hero-banner", ... }
```

---

## Key Notes for Frontend Devs

1. Authentication: All endpoints require:

```http
Authorization: Bearer YOUR_TOKEN
```

2. Error Handling: Check for:

- 400 Bad Request (invalid file/MIME type).
- 404 Not Found (invalid ID/slug).

3. Pagination: Use ?limit=10&offset=0 in list endpoints.

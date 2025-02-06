<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>



## Before that you download the project

### 0.- Node installation
Node.js is an open-source, cross-platform runtime environment that allows you to run JavaScript code on the server-side, outside of the browser. 

```
https://nodejs.org/es

```

### 1.- pnpm installation (If you don't have the package manager install)
pnpm is a fast, disk space-efficient package manager for JavaScript and Node.js. It stands for Performant Node Package Manager and is an alternative to npm and Yarn.

```bash
npm install -g pnpm

```

### 2.- NestJs Installation (If you don't have the ClI install)

To get started, you can either scaffold the project with the Nest CLI, or clone a starter project (both will produce the same outcome).
[Nest](https://docs.nestjs.com/first-steps) First Steps.
```bash
npm i -g @nestjs/cli

```



### Inside of the project

## 0.- Clone the project

```bash

$ git clone <NombreDelProyecto>

```

## 1.- Installation

```bash
$ pnpm install

```

## 2.- Create the  __.env__ 
This environment will help you with the connection to the database (Postgres).
"This connection is for when you use it with Postgres directly installed on your system."

```bash
JWT_SECRET='Secreto'
PORT=3002
DB_PASSWORD=root
DB_NAME=NameOFTheDatabase
DB_HOST=localhost
#Con Postgres directo
DB_PORT=5432
DB_USERNAME=postgres
CONTAINER_NAME=NameOFTheContainer

#Esta contraseña es para la creacion del seed , se mandan en el @param
PASSWORD_SEED='SecretoContraseña'

```

## 2.1.- Create the  __.env__ 
This environment will help you with the connection to the database (Postgres).
"This connection is for when you use it with Docker."

```bash
JWT_SECRET='Secreto'
PORT=3002
DB_PASSWORD=root
DB_NAME=NameOFTheDatabase
DB_HOST=localhost
#Con Docker-compose
DB_PORT=5434

DB_USERNAME=postgres
CONTAINER_NAME=NameOFTheContainer

#Esta contraseña es para la creacion del seed , se mandan en el @param
PASSWORD_SEED='SecretoContraseña'

```

## 2.2.- Set up the database with the project in Docker (Dockerize)

```bash

$ docker-compose up -d

```


## 3.-Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```


## 4.-Manera de hacer despliegue 

1. Crear el archivo ``` .env ```
2. Llenar las variables de entorno de prod
3. Crear la imagen 
```

 docker-compose -f docker-compose.prod.yaml --env-file .env up --build

```

4. recargar la imagen si ya la tenias 
```
 docker-compose -f docker-compose.prod.yaml --env-file .env.prod up -d
```

* Nest


## STACK Utilizado


* Postgres
* AHORA MONGODB
```
npm i mongodb@5.9.2
```
* NodeJs
* Docker / Docker Compose
* Nest

## MAC (borrar prettier)

```
pnpm remove prettier eslint-config-prettier eslint-plugin-prettier
```

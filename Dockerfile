FROM node:18.20.4-alpine3.20
WORKDIR /usr/app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
EXPOSE 3000
RUN npm run build
ENV NODE_ENV=production

CMD ["npm", "run", "start"]

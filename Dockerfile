FROM node:22-alpine
WORKDIR /app
COPY ./ .
RUN npm install --production

WORKDIR /app/client
RUN npm install

WORKDIR /app

EXPOSE 3000
CMD ["npm", "run", "dev"]

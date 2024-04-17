FROM node AS worterbuch-explorer-builder
WORKDIR /src
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM nginx:alpine
WORKDIR /app
COPY --from=worterbuch-explorer-builder /src/dist /usr/share/nginx/html

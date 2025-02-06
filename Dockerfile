# Estágio de construção
FROM node:18 AS builder

WORKDIR /app

# Copiar package.json e package-lock.json (melhora o cache)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Passar argumento para configurar ambiente de build
ARG BUILD_ENV=production
RUN echo "O valor de BUILD_ENV é: $BUILD_ENV"

# Executar o build
RUN npm run build -- --configuration=production

# Estágio final
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist/fuse /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Estágio de construção
FROM node:18 AS builder

WORKDIR /app

# Copiar arquivos necessários
COPY . .


# Passar argumento para configurar ambiente de build
ARG BUILD_ENV

RUN echo "O valor de BUILD_ENV é: $BUILD_ENV"

# Executar build de acordo com a branch
RUN echo "O valor de BUILD_ENV é: $BUILD_ENV"

RUN npm run build -- --configuration=$BUILD_ENV

# Estágio final
FROM nginx:alpine

COPY --from=builder /app/dist/fuse /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

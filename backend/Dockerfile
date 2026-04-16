# Usamos la versión oficial estable de Node.js (20 LTS es muy segura)
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalamos las dependencias
RUN npm install

# Copiamos todo el resto del código
COPY . .

# Exponemos el puerto de nuestro servidor
EXPOSE 4000

# El comando que ejecutaremos será el definido en docker-compose
CMD ["npm", "run", "dev"]

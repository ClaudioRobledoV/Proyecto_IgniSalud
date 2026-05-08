# Usamos una imagen de Node.js liviana
FROM node:20-slim

# Definimos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias primero para aprovechar el cache de Docker
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código (aunque en desarrollo usaremos volúmenes)
COPY . .

# Exponemos el puerto de Vite
EXPOSE 5173

# Comando para iniciar el entorno de desarrollo
CMD ["npm", "run", "dev"]

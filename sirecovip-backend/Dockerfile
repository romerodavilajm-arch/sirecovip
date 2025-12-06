# Imagen base ligera y segura
FROM node:24-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto de la API
EXPOSE 3000

# Comando por defecto para desarrollo
CMD ["npm", "run", "dev"]
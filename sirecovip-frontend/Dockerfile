FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# --host es vital para verlo desde Windows
CMD ["npm", "run", "dev", "--", "--host"]
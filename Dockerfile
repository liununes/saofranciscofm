# Usar Node como base
FROM node:18

# Criar diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar restante do projeto
COPY . .

# Expor porta
EXPOSE 5173

# Comando padrão para rodar app
CMD ["npm", "run", "dev"]
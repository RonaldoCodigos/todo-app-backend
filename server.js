// Em: server.js (na raiz do projeto)

// 1. Carrega as variáveis de ambiente (do .env)
// DEVE ser a primeira linha do seu código
require('dotenv').config();

// 2. Importa os pacotes
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 3. Importa os arquivos de rotas que criamos
const userRoutes = require('./routes/userRoutes');
const todoRoutes = require('./routes/todoRoutes');

// --- Configuração do Aplicativo ---
const app = express();
const PORT = process.env.PORT || 3000; // Pega a porta do .env ou usa 3000

// 4. Middlewares Globais
app.use(cors()); // Permite que o front-end (React) acesse esta API de outro domínio
app.use(express.json()); // Permite que o servidor entenda o formato JSON

// 5. Define as rotas principais da API
// Quando alguém acessar "/api/users", o Express vai usar o 'userRoutes'
app.use('/api/users', userRoutes);
// Quando alguém acessar "/api/todos", o Express vai usar o 'todoRoutes'
app.use('/api/todos', todoRoutes);

// Rota de teste simples
app.get('/', (req, res) => {
  res.send('API da To-Do List (Full-Stack) está no ar!');
});

// --- Conexão com o Banco de Dados e Início do Servidor ---
// 6. Pega a string de conexão do .env
const MONGODB_URI = process.env.MONGODB_URI;

// 7. Conecta ao MongoDB
// (Usamos .then() para garantir que o servidor só suba DEPOIS que o banco conectar)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado com sucesso!');
    
    // 8. Sobe o servidor
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1); // Encerra o processo se não conseguir conectar ao banco
  });
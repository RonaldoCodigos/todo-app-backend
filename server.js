// Em: server.js (na raiz do projeto)
// VERSÃO FINAL COM CORS EXPLÍCITO

// 1. Carrega as variáveis de ambiente (do .env)
require('dotenv').config();

// 2. Importa os pacotes
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importa o pacote CORS

// 3. Importa os arquivos de rotas
const userRoutes = require('./routes/userRoutes');
const todoRoutes = require('./routes/todoRoutes');

// --- Configuração do Aplicativo ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES GLOBAIS ---

// 4. Configuração CORS explícita
const allowedOrigins = [
  'https://todo-app-frontend-ten-nu.vercel.app', // Sua URL principal da Vercel
  // Adicione outras URLs Vercel se necessário
  'https://todo-app-frontend-git-main-ronaldocodigos-projects.vercel.app'
  // Você também pode adicionar localhost para testes locais se quiser:
  // 'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (como apps mobile ou Postman/Insomnia)
    // OU se a origem está na lista de permitidas
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
  credentials: true, // Se você precisar enviar cookies ou cabeçalhos de autorização complexos
  optionsSuccessStatus: 204 // Para requisições preflight (OPTIONS)
};

app.use(cors(corsOptions));

app.use(express.json()); // Permite que o servidor entenda o formato JSON

// --- FIM MIDDLEWARES ---


// 5. Define as rotas principais da API (DEPOIS do CORS)
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);

// Rota de teste simples
app.get('/', (req, res) => {
  res.send('API da To-Do List (Full-Stack) está no ar!');
});

// --- Conexão com o Banco de Dados e Início do Servidor ---
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado com sucesso!');
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });
// Em: routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/userModel'); // Importa o "molde" do usuário
const bcrypt = require('bcrypt'); // Importa o bcrypt para comparar senhas
const jwt = require('jsonwebtoken'); // Importa o JWT para criar o token

// --- Função Auxiliar para gerar o Token ---
// Nós passamos o ID do usuário para o token
// O 'secret' vem do .env e o 'expiresIn' define a validade
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // O token expira em 30 dias
  });
};


// --- Rota 1: REGISTRO ---
// URL: POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verifica se o e-mail ou senha foram enviados
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos' });
    }

    // 2. Verifica se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este e-mail já está em uso' });
    }

    // 3. Cria o novo usuário
    // (O 'userModel' vai automaticamente criptografar a senha graças ao 'hook' que criamos)
    const user = await User.create({
      email,
      password,
    });

    // 4. Se o usuário foi criado, responde com os dados + o Token
    if (user) {
      res.status(201).json({ // 201 = Created
        _id: user._id,
        email: user.email,
        token: generateToken(user._id), // Gera e envia o token de login
      });
    } else {
      res.status(400).json({ message: 'Dados de usuário inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});


// --- Rota 2: LOGIN ---
// URL: POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Busca o usuário pelo e-mail
    const user = await User.findOne({ email });

    // 2. Se encontrou o usuário, compara a senha enviada (password)
    //    com a senha criptografada (user.password) que está no banco.
    if (user && (await bcrypt.compare(password, user.password))) {
      // 3. Se as senhas baterem, responde com os dados + o Token
      res.json({
        _id: user._id,
        email: user.email,
        token: generateToken(user._id), // Gera e envia o token de login
      });
    } else {
      // 4. Se o usuário não existir ou a senha estiver errada
      res.status(401).json({ message: 'E-mail ou senha inválidos' }); // 401 = Não Autorizado
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});


// Exporta o roteador
module.exports = router;
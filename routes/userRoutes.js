const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt'); // Corrigido de bcrypt.js
const jwt = require('jsonwebtoken');

// Função para gerar o token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/users/register (Sem logs extras, assume-se que está ok)
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) { return res.status(400).json({ message: 'Por favor, preencha todos os campos' }); }
    const userExists = await User.findOne({ email });
    if (userExists) { return res.status(400).json({ message: 'Este e-mail já está em uso' }); }
    const user = await User.create({ email, password });
    if (user) {
      res.status(201).json({ _id: user._id, email: user.email, token: generateToken(user._id) });
    } else {
      res.status(400).json({ message: 'Dados de usuário inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

// POST /api/users/login (COM MAIS LOGS)
router.post('/login', async (req, res) => {
  console.log("Recebida requisição POST /api/users/login"); // Log 1
  const { email, password } = req.body;
  console.log("Email recebido:", email); // Log 2

  try {
    console.log("Tentando encontrar usuário..."); // Log 3
    const user = await User.findOne({ email });
    console.log("Resultado de User.findOne:", user ? `Usuário ${user.email} encontrado` : "Usuário não encontrado"); // Log 4

    if (user) {
      console.log("Tentando comparar senhas..."); // Log 5
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Resultado de bcrypt.compare:", isMatch); // Log 6

      if (isMatch) {
        console.log("Senhas compatíveis. Gerando token..."); // Log 7
        const token = generateToken(user._id);
        console.log("Token gerado com sucesso."); // Log 8
        res.json({ _id: user._id, email: user.email, token: token });
      } else {
        console.log("Senha incorreta."); // Log 9
        res.status(401).json({ message: 'E-mail ou senha inválidos' });
      }
    } else {
      // Usuário não encontrado
      res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }
  } catch (error) {
    console.error("ERRO DETALHADO NO CATCH (Login):", error); // Log 10 (ERRO!)
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

module.exports = router;
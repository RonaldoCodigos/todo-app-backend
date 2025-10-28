// Em: routes/userRoutes.js
// VERSÃO FINAL LIMPA

const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Função para gerar o token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
     console.error('ERRO FATAL: JWT_SECRET não definido!'); // Mantém um log de erro crítico
     throw new Error('JWT_SECRET não definido');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/users/register
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
    console.error("Erro em /register:", error.message); // Mantém um log de erro básico
    res.status(500).json({ message: 'Erro no servidor durante o registro', error: error.message });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({ _id: user._id, email: user.email, token: generateToken(user._id) });
    } else {
      res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }
  } catch (error) {
    console.error("Erro em /login:", error.message); // Mantém um log de erro básico
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

module.exports = router;
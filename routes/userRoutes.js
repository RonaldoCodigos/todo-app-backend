const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt'); // Nome correto do pacote
const jwt = require('jsonwebtoken');

// Função para gerar o token
const generateToken = (id) => {
  // Adiciona um log para verificar se JWT_SECRET está sendo lido
  console.log("[generateToken] JWT_SECRET:", process.env.JWT_SECRET ? "Encontrado" : "NÃO ENCONTRADO!");
  if (!process.env.JWT_SECRET) {
     throw new Error('JWT_SECRET não definido nas variáveis de ambiente!');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- Rota 1: REGISTRO (COM MAIS LOGS) ---
router.post('/register', async (req, res) => {
  console.log("[POST /register] Requisição recebida."); // Log R1
  const { email, password } = req.body;
  console.log("[POST /register] Email:", email); // Log R2

  try {
    // 1. Verifica se o e-mail ou senha foram enviados
    if (!email || !password) {
      console.log("[POST /register] Erro: Campos faltando."); // Log R3
      return res.status(400).json({ message: 'Por favor, preencha todos os campos' });
    }

    // 2. Verifica se o usuário já existe
    console.log("[POST /register] Verificando se usuário existe..."); // Log R4
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("[POST /register] Erro: Usuário já existe."); // Log R5
      return res.status(400).json({ message: 'Este e-mail já está em uso' });
    }
    console.log("[POST /register] Usuário não existe. OK."); // Log R6

    // 3. Cria o novo usuário
    console.log("[POST /register] Tentando User.create..."); // Log R7
    const user = await User.create({
      email,
      password, // A senha será 'hashed' pelo hook no userModel
    });
    console.log("[POST /register] User.create concluído. User ID:", user?._id); // Log R8

    // 4. Se o usuário foi criado, responde com os dados + o Token
    if (user) {
      console.log("[POST /register] Gerando token..."); // Log R9
      const token = generateToken(user._id); // Chama a função auxiliar
      console.log("[POST /register] Token gerado. Enviando resposta 201."); // Log R10
      res.status(201).json({
        _id: user._id,
        email: user.email,
        token: token,
      });
    } else {
      console.log("[POST /register] Erro: User.create retornou falsy?"); // Log R11
      res.status(400).json({ message: 'Dados de usuário inválidos' });
    }
  } catch (error) {
    // Log MUITO DETALHADO do erro no catch
    console.error("[POST /register] ERRO DETALHADO NO CATCH:", error); // Log R12 (ERRO!)
    console.error("[POST /register] Error Message:", error.message);
    console.error("[POST /register] Error Stack:", error.stack);
    res.status(500).json({ message: 'Erro no servidor durante o registro', error: error.message });
  }
});

// --- Rota 2: LOGIN (COM MAIS LOGS) ---
router.post('/login', async (req, res) => {
  console.log("Recebida requisição POST /api/users/login"); // Log L1
  const { email, password } = req.body;
  console.log("Email recebido:", email); // Log L2

  try {
    console.log("Tentando encontrar usuário..."); // Log L3
    const user = await User.findOne({ email });
    console.log("Resultado de User.findOne:", user ? `Usuário ${user.email} encontrado` : "Usuário não encontrado"); // Log L4

    if (user) {
      console.log("Tentando comparar senhas..."); // Log L5
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Resultado de bcrypt.compare:", isMatch); // Log L6

      if (isMatch) {
        console.log("Senhas compatíveis. Gerando token..."); // Log L7
        const token = generateToken(user._id);
        console.log("Token gerado com sucesso."); // Log L8
        res.json({ _id: user._id, email: user.email, token: token });
      } else {
        console.log("Senha incorreta."); // Log L9
        res.status(401).json({ message: 'E-mail ou senha inválidos' });
      }
    } else {
      res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }
  } catch (error) {
    console.error("ERRO DETALHADO NO CATCH (Login):", error); // Log L10 (ERRO!)
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Importa o crypto

// Função para gerar o token de LOGIN
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
     console.error('ERRO FATAL: JWT_SECRET não definido!');
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
    console.error("Erro em /register:", error.message);
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
    console.error("Erro em /login:", error.message);
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

// --- ROTA: Solicitar Redefinição de Senha ---
// URL: POST /api/users/forgot-password
router.post('/forgot-password', async (req, res) => {
  let user; // Declara user fora do try para usar no catch
  try {
    user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Mesmo se não achar, retorna sucesso para segurança
      return res.status(200).json({ message: 'Se o e-mail existir na nossa base de dados, um link de redefinição será logado no servidor.' });
    }

    // Gera o token de reset (chama o método do userModel)
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Salva token hashed e data no DB

    // --- SIMULAÇÃO DO ENVIO DE E-MAIL ---
    // (Use a URL DO SEU FRONT-END VERCEL!)
    const resetURL = `https://todo-app-frontend-ten-nu.vercel.app/reset-password/${resetToken}`; // Adapte a URL se necessário

    console.log("------------------------------------------");
    console.log("LINK PARA REDEFINIR SENHA (COPIE E COLE NO NAVEGADOR):");
    console.log(resetURL);
    console.log("------------------------------------------");
    // --- FIM DA SIMULAÇÃO ---

    res.status(200).json({ message: 'Link de redefinição logado no console do servidor.' });

  } catch (error) {
    // Limpa token/data se der erro
    if (user) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        try { // Adiciona try/catch para o save dentro do catch
          await user.save({ validateBeforeSave: false });
        } catch (saveError) {
           console.error("Erro ao limpar token após falha em forgot-password:", saveError);
        }
    }
    console.error("Erro em /forgot-password:", error); // Log detalhado do erro
    res.status(500).json({ message: 'Erro ao processar a solicitação de redefinição de senha.' });
  }
});


// --- ROTA: Redefinir a Senha ---
// URL: PATCH /api/users/reset-password/:token
router.patch('/reset-password/:token', async (req, res) => {
  try {
    // 1. Pega o token da URL e faz o HASH dele
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 2. Encontra o usuário pelo token HASHED e verifica se NÃO expirou
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() } // Maior que a data atual
    });

    // 3. Se não encontrar (token inválido ou expirado)
    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    // 4. Se encontrou, atualiza a senha e limpa os campos de reset
    user.password = req.body.password; // A nova senha
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); // Salva (o hook vai criptografar a nova senha)

    // 5. Opcional: Gera um novo token de LOGIN e envia
    const loginToken = generateToken(user._id);
    res.status(200).json({ token: loginToken, message: 'Senha redefinida com sucesso.' });

  } catch (error) {
    console.error("Erro em /reset-password:", error); // Log detalhado do erro
    res.status(500).json({ message: 'Erro ao redefinir a senha.', error: error.message });
  }
});

module.exports = router;
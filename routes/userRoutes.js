// Em: routes/userRoutes.js
// VERSÃO FINAL COM ENVIO DE E-MAIL REAL

const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/emailSender'); // 1. IMPORTA a função de envio

// Função para gerar o token de LOGIN
const generateToken = (id) => { /* ... (código igual) ... */ };

// POST /api/users/register
router.post('/register', async (req, res) => { /* ... (código igual) ... */ });

// POST /api/users/login
router.post('/login', async (req, res) => { /* ... (código igual) ... */ });

// --- ROTA: Solicitar Redefinição de Senha (MODIFICADA) ---
router.post('/forgot-password', async (req, res) => {
  let user;
  try {
    user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Mesmo se não achar, retorna sucesso para segurança
      console.log("[Forgot Password] E-mail não encontrado:", req.body.email);
      // IMPORTANTE: Não informe ao usuário se o e-mail existe ou não
      return res.status(200).json({ message: 'Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.' });
    }

    // Gera o token de reset
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Salva token hashed e data no DB

    // Cria a URL de reset (Use a URL DO SEU FRONT-END VERCEL!)
    const resetURL = `https://todo-app-frontend-ten-nu.vercel.app/reset-password/${resetToken}`; // Adapte se necessário

    // --- ENVIO DE E-MAIL REAL ---
    // 2. Prepara o conteúdo do e-mail
    const subject = 'Link para Redefinição de Senha (Validade: 10 min)';
    const textContent = `Olá ${user.email},\n\nVocê solicitou a redefinição da sua senha. Por favor, clique no link a seguir ou cole-o no seu navegador para completar o processo (válido por 10 minutos):\n\n${resetURL}\n\nSe você não solicitou isso, por favor ignore este e-mail.\n`;
    const htmlContent = `
      <p>Olá ${user.email},</p>
      <p>Você solicitou a redefinição da sua senha. Por favor, clique no link a seguir para completar o processo (válido por 10 minutos):</p>
      <a href="${resetURL}">Redefinir Senha</a>
      <p>Se você não conseguir clicar no link, copie e cole a seguinte URL no seu navegador:</p>
      <p>${resetURL}</p>
      <p>Se você não solicitou isso, por favor ignore este e-mail.</p>
    `;

    // 3. CHAMA a função sendEmail
    await sendEmail({
      to: user.email,
      subject: subject,
      text: textContent,
      html: htmlContent
    });
    // --- FIM DO ENVIO DE E-MAIL ---

    // 4. Resposta de sucesso (agora informa sobre o e-mail)
    res.status(200).json({ message: 'E-mail com link de redefinição enviado com sucesso!' });

  } catch (error) {
    // Limpa token/data se der erro no envio do email ou antes
    if (user) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        try { await user.save({ validateBeforeSave: false }); }
        catch (saveError) { console.error("Erro ao limpar token após falha:", saveError); }
    }
    console.error("Erro em /forgot-password:", error);
    // Não envie o erro detalhado para o cliente em caso de falha no e-mail
    res.status(500).json({ message: 'Erro ao processar a solicitação. Tente novamente mais tarde.' });
  }
});


// --- ROTA: Redefinir a Senha ---
// URL: PATCH /api/users/reset-password/:token
router.patch('/reset-password/:token', async (req, res) => { /* ... (código igual, sem mudanças aqui) ... */ });

module.exports = router;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // 1. Precisa importar o 'crypto'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Por favor, insira um e-mail'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Por favor, insira uma senha'],
    minlength: [6, 'A senha deve ter no mínimo 6 caracteres']
  },
  // --- CAMPOS QUE FALTAM NO SEU CÓDIGO ---
  passwordResetToken: String,   // Guarda o token HASHED
  passwordResetExpires: Date    // Guarda a data de expiração
  // --- FIM DOS CAMPOS QUE FALTAM ---
});

// Hook para criptografar a senha (Este está correto no seu código)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- MÉTODO QUE FALTA NO SEU CÓDIGO ---
// Método para gerar o token de reset de senha
userSchema.methods.createPasswordResetToken = function() {
  // 1. Gera um token aleatório (string simples)
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2. CRIPTOGRAFA (hash) o token ANTES de salvar no banco
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Define a data de expiração (10 minutos a partir de agora)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log({ resetToken_NaoCriptografado: resetToken }, { resetToken_Criptografado_Salvo_No_DB: this.passwordResetToken }); // Log de debug

  // 4. Retorna o token NÃO CRIPTOGRAFADO (original)
  return resetToken;
};
// --- FIM DO MÉTODO QUE FALTA ---

const User = mongoose.model('User', userSchema);
module.exports = User;
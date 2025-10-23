// Em: models/userModel.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Importa o bcrypt para criptografar

// 1. O "molde" do usuário
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'E-mail é obrigatório'], 
    unique: true, // Garante que não haja e-mails duplicados
    lowercase: true // Salva sempre em minúsculas
  },
  password: { 
    type: String, 
    required: [true, 'Senha é obrigatória'], 
    minlength: [6, 'A senha deve ter no mínimo 6 caracteres'] 
  }
});

// 2. O "Hook" de Criptografia (A Mágica)
// Esta função roda AUTOMATICAMENTE antes de 'save' (salvar) um novo usuário
userSchema.pre('save', async function(next) {
  // 'this' é o documento (usuário) que está prestes a ser salvo
  
  // Se a senha não foi modificada (ex: o usuário só mudou o email),
  // não precisamos criptografar de novo.
  if (!this.isModified('password')) {
    return next();
  }

  // 3. Criptografa a senha
  try {
    // Gera o "salt" (um fator aleatório para a criptografia)
    const salt = await bcrypt.genSalt(10);
    // Substitui a senha de texto puro (ex: "senha123") pela senha criptografada
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 3. Exporta o modelo
const User = mongoose.model('User', userSchema);
module.exports = User;
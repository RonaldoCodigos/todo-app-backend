// Em: models/todoModel.js

const mongoose = require('mongoose');

// 1. O "molde" da tarefa
const todoSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: [true, 'O texto da tarefa é obrigatório'] 
  },
  completed: { 
    type: Boolean, 
    default: false // Começa como "não concluída" por padrão
  },

  // 2. A LINHA MAIS IMPORTANTE (Autorização)
  // Esta linha conecta esta tarefa a um usuário específico.
  user: {
    type: mongoose.Schema.Types.ObjectId, // Salva o ID único do usuário
    ref: 'User', // Faz referência ao 'userModel' que criamos antes
    required: true // Uma tarefa DEVE pertencer a um usuário
  }
}, {
  // Adiciona automaticamente os campos "createdAt" e "updatedAt"
  timestamps: true 
});

// 3. Exporta o modelo
const Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;
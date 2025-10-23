// Em: routes/todoRoutes.js
// VERSÃO CORRIGIDA (SEM A ROTA 3 DUPLICADA)

const express = require('express');
const router = express.Router();
const Todo = require('../models/todoModel'); // Importa o "molde" da tarefa
const { protect } = require('../middleware/authMiddleware'); // Importa o "segurança"

// --- IMPORTANTE ---
// Colocamos o 'protect' aqui em cima.
// Isso significa que TODAS as rotas definidas NESTE ARQUIVO
// são protegidas. O 'protect' vai rodar antes de qualquer uma delas.
router.use(protect);

// --- Rota 1: Buscar todas as tarefas ---
// URL: GET /api/todos/
router.get('/', async (req, res) => {
  try {
    // req.user foi adicionado pelo middleware 'protect'
    // Busca no banco todas as tarefas ONDE o campo 'user'
    // é igual ao ID do usuário que está logado.
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 }); // (Mais novos primeiro)
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

// --- Rota 2: Criar uma nova tarefa ---
// URL: POST /api/todos/
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'O texto é obrigatório' });
    }

    const todo = new Todo({
      text,
      user: req.user.id, // Associa a tarefa ao usuário logado
      completed: false,
    });

    const createdTodo = await todo.save();
    res.status(201).json(createdTodo); // 201 = Created
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

// --- Rota 4: Deletar uma tarefa ---
// URL: DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // --- Verificação de Autorização ---
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    await todo.deleteOne(); // Deleta a tarefa
    res.json({ message: 'Tarefa removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

// --- Rota 5: Atualizar uma tarefa (EDITAR / CONCLUIR) ---
// (Esta é a ÚNICA rota PUT, e agora será executada)
router.put('/:id', async (req, res) => {
  try {
    // 1. Busca a tarefa
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // 2. Verificação de Autorização (ESSENCIAL)
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // 3. Prepara os campos que serão atualizados
    const updates = {};
    if (req.body.text !== undefined) {
      updates.text = req.body.text;
    }
    if (req.body.completed !== undefined) {
      updates.completed = req.body.completed;
    }

    // 4. Executa a atualização no banco de dados
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id, // O ID da tarefa a ser atualizada
      updates,        // Os dados a serem modificados
      { new: true }   // Opção para retornar o documento novo
    );

    res.json(updatedTodo); // Retorna o documento atualizado

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Todo = require('../models/todoModel');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// --- Rota 1: Buscar todas as tarefas (COM MAIS LOGS) ---
router.get('/', async (req, res) => {
  console.log(`[GET /api/todos] Requisição recebida do usuário ID: ${req.user.id}`); // Log 1
  try {
    console.log("[GET /api/todos] Tentando buscar tarefas no MongoDB..."); // Log 2
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
    console.log(`[GET /api/todos] Busca no MongoDB concluída. Encontradas ${todos.length} tarefas.`); // Log 3
    res.json(todos);
    console.log("[GET /api/todos] Resposta JSON enviada com sucesso."); // Log 4
  } catch (error) {
    console.error("[GET /api/todos] ERRO DETALHADO NO CATCH:", error); // Log 5 (ERRO!)
    res.status(500).json({ message: 'Erro no servidor ao buscar tarefas', error: error.message });
  }
});

// --- Rota 2: Criar uma nova tarefa ---
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) { return res.status(400).json({ message: 'O texto é obrigatório' }); }
    const todo = new Todo({ text, user: req.user.id, completed: false });
    const createdTodo = await todo.save();
    res.status(201).json(createdTodo);
  } catch (error) {
     console.error("[POST /api/todos] ERRO:", error); // Log de erro adicionado
     res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

// --- Rota 4: Deletar uma tarefa ---
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) { return res.status(404).json({ message: 'Tarefa não encontrada' }); }
    if (todo.user.toString() !== req.user.id) { return res.status(401).json({ message: 'Não autorizado' }); }
    await todo.deleteOne();
    res.json({ message: 'Tarefa removida com sucesso' });
  } catch (error) {
    console.error("[DELETE /api/todos/:id] ERRO:", error); // Log de erro adicionado
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

// --- Rota 5: Atualizar uma tarefa (EDITAR / CONCLUIR) ---
router.put('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) { return res.status(404).json({ message: 'Tarefa não encontrada' }); }
    if (todo.user.toString() !== req.user.id) { return res.status(401).json({ message: 'Não autorizado' }); }
    const updates = {};
    if (req.body.text !== undefined) { updates.text = req.body.text; }
    if (req.body.completed !== undefined) { updates.completed = req.body.completed; }
    const updatedTodo = await Todo.findByIdAndUpdate( req.params.id, updates, { new: true } );
    res.json(updatedTodo);
  } catch (error) {
    console.error("[PUT /api/todos/:id] ERRO:", error); // Log de erro adicionado
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

module.exports = router;
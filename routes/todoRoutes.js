// Em: routes/todoRoutes.js
// VERSÃO FINAL LIMPA

const express = require('express');
const router = express.Router();
const Todo = require('../models/todoModel');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/todos
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error("Erro em GET /todos:", error.message); // Log de erro básico
    res.status(500).json({ message: 'Erro no servidor ao buscar tarefas', error: error.message });
  }
});

// POST /api/todos
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) { return res.status(400).json({ message: 'O texto é obrigatório' }); }
    const todo = new Todo({ text, user: req.user.id, completed: false });
    const createdTodo = await todo.save();
    res.status(201).json(createdTodo);
  } catch (error) {
     console.error("Erro em POST /todos:", error.message); // Log de erro básico
     res.status(500).json({ message: 'Erro no servidor ao criar tarefa', error: error.message });
  }
});

// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) { return res.status(404).json({ message: 'Tarefa não encontrada' }); }
    if (todo.user.toString() !== req.user.id) { return res.status(401).json({ message: 'Não autorizado' }); }
    await todo.deleteOne();
    res.json({ message: 'Tarefa removida com sucesso' });
  } catch (error) {
    console.error("Erro em DELETE /todos/:id:", error.message); // Log de erro básico
    res.status(500).json({ message: 'Erro no servidor ao deletar tarefa', error: error.message });
  }
});

// PUT /api/todos/:id
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
    console.error("Erro em PUT /todos/:id:", error.message); // Log de erro básico
    res.status(500).json({ message: 'Erro no servidor ao atualizar tarefa', error: error.message });
  }
});

module.exports = router;
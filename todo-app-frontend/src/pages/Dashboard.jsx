// Em: src/pages/Dashboard.jsx
// VERSÃO FINAL LIMPA (com tema)

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';
import { useAppTheme } from '../context/ThemeContext';

// Importações do Material-UI
import {
  Container, Box, Typography, TextField, Button, List, ListItem,
  ListItemText, IconButton, AppBar, Toolbar, Alert, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function Dashboard() {
  const { logout } = useAuth();
  const { mode, toggleThemeMode } = useAppTheme();
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState(null);
  const [newText, setNewText] = useState('');

  // --- Efeito: Carregar Tarefas ---
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/todos');
        setTodos(response.data);
      } catch (err) {
        setSnackbar({ open: true, message: 'Erro ao carregar tarefas.', severity: 'error' });
        console.error("Erro fetchTodos:", err); // Mantém log de erro
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, []); // Roda só uma vez

  // --- Função: Criar nova tarefa ---
  const handleCreateTodo = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const response = await apiClient.post('/todos', { text });
      setTodos([response.data, ...todos]);
      setText('');
      setSnackbar({ open: true, message: 'Tarefa adicionada com sucesso!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao criar tarefa.', severity: 'error' });
      console.error("Erro handleCreateTodo:", err); // Mantém log de erro
    }
  };

  // --- Funções: Deletar Tarefa ---
  const handleOpenDeleteDialog = (id) => { setTodoToDelete(id); setOpenDeleteDialog(true); };
  const handleCloseDeleteDialog = () => { setOpenDeleteDialog(false); setTodoToDelete(null); };
  const handleConfirmDelete = async () => {
    try {
      await apiClient.delete(`/todos/${todoToDelete}`);
      setTodos(todos.filter((todo) => todo._id !== todoToDelete));
      setSnackbar({ open: true, message: 'Tarefa deletada com sucesso!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao deletar tarefa.', severity: 'error' });
      console.error("Erro handleConfirmDelete:", err); // Mantém log de erro
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // --- Funções: Editar Tarefa (Modal) ---
  const handleOpenEditDialog = (todo) => { setTodoToEdit(todo); setNewText(todo.text); setOpenEditDialog(true); };
  const handleCloseEditDialog = () => { setOpenEditDialog(false); setTodoToEdit(null); setNewText(''); };
  const handleConfirmEdit = async () => {
    try {
      const response = await apiClient.put(`/todos/${todoToEdit._id}`, { text: newText });
      setTodos(todos.map(todo => todo._id === todoToEdit._id ? response.data : todo ));
      setSnackbar({ open: true, message: 'Tarefa atualizada com sucesso!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao atualizar tarefa.', severity: 'error' });
      console.error("Erro handleConfirmEdit:", err); // Mantém log de erro
    } finally {
      handleCloseEditDialog();
    }
  };

  // --- Função: Marcar como Concluído (Checkbox) ---
  const handleToggleComplete = async (todo) => {
    try {
      const response = await apiClient.put(`/todos/${todo._id}`, { completed: !todo.completed });
      setTodos(todos.map(t => t._id === todo._id ? response.data : t ));
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao atualizar status.', severity: 'error' });
      console.error("Erro handleToggleComplete:", err); // Mantém log de erro
    }
  };

  // --- Funções de UI (Snackbar e Logout) ---
  const handleSnackbarClose = (event, reason) => { if (reason === 'clickaway') return; setSnackbar({ ...snackbar, open: false }); };
  const handleLogout = () => logout();

  // --- Renderização ---
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
         <Toolbar>
           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}> Minhas Tarefas </Typography>
           <IconButton sx={{ ml: 1 }} onClick={toggleThemeMode} color="inherit" title={mode === 'dark' ? "Mudar para tema claro" : "Mudar para tema escuro"}>
             {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
           </IconButton>
           <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}> Sair </Button>
         </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
        <Box component="form" onSubmit={handleCreateTodo} sx={{ display: 'flex', gap: 2, mb: 4 }}>
           <TextField fullWidth variant="outlined" label="Adicionar nova tarefa..." value={text} onChange={(e) => setText(e.target.value)} />
           <Button type="submit" variant="contained" size="large"> Adicionar </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}> <CircularProgress /> </Box>
        ) : (
          <List>
            {todos.length === 0 && ( <Typography align="center"> Nenhuma tarefa encontrada. Crie sua primeira tarefa! </Typography> )}
            {todos.map((todo) => (
              <ListItem key={todo._id} divider secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(todo)}> <EditIcon /> </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(todo._id)}> <DeleteIcon /> </IconButton>
                  </>
                } >
                <Checkbox edge="start" checked={todo.completed} onChange={() => handleToggleComplete(todo)} tabIndex={-1} />
                <ListItemText primary={todo.text} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }} />
              </ListItem>
            ))}
          </List>
        )}
      </Container>

      {/* Modais e Snackbar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent> <DialogContentText> Você tem certeza que deseja excluir esta tarefa? </DialogContentText> </DialogContent>
        <DialogActions> <Button onClick={handleCloseDeleteDialog}>Cancelar</Button> <Button onClick={handleConfirmDelete} color="error" autoFocus>Excluir</Button> </DialogActions>
      </Dialog>
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
         <DialogTitle>Editar Tarefa</DialogTitle>
         <DialogContent>
           <DialogContentText> Digite o novo texto para a sua tarefa: </DialogContentText>
           <TextField autoFocus margin="dense" id="name" label="Texto da Tarefa" type="text" fullWidth variant="standard" value={newText} onChange={(e) => setNewText(e.target.value)} />
         </DialogContent>
         <DialogActions> <Button onClick={handleCloseEditDialog}>Cancelar</Button> <Button onClick={handleConfirmEdit}>Salvar</Button> </DialogActions>
       </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
         <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}> {snackbar.message} </Alert>
       </Snackbar>
    </Box>
  );
}
export default Dashboard;
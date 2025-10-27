import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig'; // Usa o apiClient configurado

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

function Dashboard() {
  const { logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true); // Começa carregando
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState(null);
  const [newText, setNewText] = useState('');

  // --- Efeito: Carregar Tarefas (COM LOGS DETALHADOS) ---
  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    console.log("[Dashboard useEffect] Iniciando. Token atual:", currentToken ? "Existe" : "NÃO Existe"); // Log A

    const fetchTodos = async () => {
      if (!currentToken) {
        console.log("[Dashboard useEffect] Token NÃO disponível no início. Abortando fetch."); // Log B
        setLoading(false);
        return;
      }
      try {
        console.log("[Dashboard useEffect] Token disponível. Setando loading=true..."); // Log C
        setLoading(true);
        console.log("[Dashboard useEffect] Fazendo chamada GET /todos..."); // Log D
        // Passa a configuração do token manualmente para ter certeza (opcional com interceptor)
        // const config = { headers: { Authorization: `Bearer ${currentToken}` } };
        // const response = await apiClient.get('/todos', config);
        const response = await apiClient.get('/todos'); // Confia no interceptor
        console.log("[Dashboard useEffect] Chamada GET /todos BEM-SUCEDIDA. Resposta:", response.data); // Log E
        setTodos(response.data);
        console.log("[Dashboard useEffect] Estado 'todos' atualizado."); // Log F
      } catch (err) {
        setSnackbar({ open: true, message: 'Erro ao carregar tarefas.', severity: 'error' });
        console.error("[Dashboard useEffect] ERRO na chamada GET /todos:", err); // Log G (ERRO!)
        if (err.response) { console.error("[Dashboard useEffect] Erro - Status:", err.response.status); console.error("[Dashboard useEffect] Erro - Data:", err.response.data); }
        else if (err.request) { console.error("[Dashboard useEffect] Erro - Sem resposta:", err.request); }
        else { console.error("[Dashboard useEffect] Erro - Configuração:", err.message); }
      } finally {
        console.log("[Dashboard useEffect] Entrando no finally. Setando loading=false..."); // Log H
        setLoading(false);
        console.log("[Dashboard useEffect] Finalizado."); // Log I
      }
    };
    fetchTodos();
  }, []); // Roda só uma vez

  // --- Função: Criar nova tarefa (COM LOGS) ---
  const handleCreateTodo = async (e) => {
    e.preventDefault();
    console.log("[handleCreateTodo] Iniciado. Texto:", text); // Log Create 1
    if (!text.trim()) {
      console.log("[handleCreateTodo] Texto vazio, abortando."); // Log Create 1a
      return;
    }
    try {
      console.log("[handleCreateTodo] Tentando chamar apiClient.post..."); // Log Create 2
      const response = await apiClient.post('/todos', { text });
      console.log("[handleCreateTodo] Chamada POST bem-sucedida:", response.data); // Log Create 3
      setTodos([response.data, ...todos]);
      setText('');
      const successSnackbarState = { open: true, message: 'Tarefa adicionada com sucesso!', severity: 'success' };
      setSnackbar(successSnackbarState);
      console.log("[handleCreateTodo] Estado Snackbar definido:", successSnackbarState); // Log Create 4
    } catch (err) {
      console.error("[handleCreateTodo] ERRO no catch:", err); // Log Create 5 (ERRO!)
      if (err.response) { console.error("[handleCreateTodo] Erro - Status:", err.response.status); console.error("[handleCreateTodo] Erro - Data:", err.response.data); }
      else if (err.request) { console.error("[handleCreateTodo] Erro - Sem resposta:", err.request); }
      else { console.error("[handleCreateTodo] Erro - Configuração:", err.message); }
      setSnackbar({ open: true, message: 'Erro ao criar tarefa.', severity: 'error' });
    }
  };

  // --- Funções: Deletar Tarefa (COM LOGS) ---
  const handleOpenDeleteDialog = (id) => {
    console.log("[handleOpenDeleteDialog] Chamada com ID:", id); // Log Delete Modal 1
    setTodoToDelete(id);
    setOpenDeleteDialog(true);
  };
  const handleCloseDeleteDialog = () => { setOpenDeleteDialog(false); setTodoToDelete(null); };
  const handleConfirmDelete = async () => {
    console.log("[handleConfirmDelete] Iniciado. ID para deletar:", todoToDelete); // Log Delete 1
    try {
      console.log("[handleConfirmDelete] Tentando chamar apiClient.delete..."); // Log Delete 2
      await apiClient.delete(`/todos/${todoToDelete}`);
      console.log("[handleConfirmDelete] Chamada DELETE bem-sucedida."); // Log Delete 3
      setTodos(todos.filter((todo) => todo._id !== todoToDelete));
      setSnackbar({ open: true, message: 'Tarefa deletada com sucesso!', severity: 'success' });
    } catch (err) {
      console.error("[handleConfirmDelete] ERRO no catch:", err); // Log Delete 4 (ERRO!)
      if (err.response) { console.error("[handleConfirmDelete] Erro - Status:", err.response.status); console.error("[handleConfirmDelete] Erro - Data:", err.response.data); }
      else if (err.request) { console.error("[handleConfirmDelete] Erro - Sem resposta:", err.request); }
      else { console.error("[handleConfirmDelete] Erro - Configuração:", err.message); }
      setSnackbar({ open: true, message: 'Erro ao deletar tarefa.', severity: 'error' });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // --- Funções: Editar Tarefa (Modal) (COM LOGS) ---
  const handleOpenEditDialog = (todo) => {
     console.log("[handleOpenEditDialog] Abrindo modal para tarefa:", todo); // Log Edit Modal 1
     setTodoToEdit(todo); setNewText(todo.text); setOpenEditDialog(true);
  };
  const handleCloseEditDialog = () => { setOpenEditDialog(false); setTodoToEdit(null); setNewText(''); };
  const handleConfirmEdit = async () => {
    console.log("[handleConfirmEdit] Iniciado. ID:", todoToEdit?._id, "Novo texto:", newText); // Log Edit 1
    try {
      console.log("[handleConfirmEdit] Tentando chamar apiClient.put..."); // Log Edit 2
      const response = await apiClient.put(`/todos/${todoToEdit._id}`, { text: newText });
      console.log("[handleConfirmEdit] Chamada PUT bem-sucedida:", response.data); // Log Edit 3
      setTodos(todos.map(todo => todo._id === todoToEdit._id ? response.data : todo ));
      setSnackbar({ open: true, message: 'Tarefa atualizada com sucesso!', severity: 'success' });
    } catch (err) {
      console.error("[handleConfirmEdit] ERRO no catch:", err); // Log Edit 4 (ERRO!)
      if (err.response) { console.error("[handleConfirmEdit] Erro - Status:", err.response.status); console.error("[handleConfirmEdit] Erro - Data:", err.response.data); }
      else if (err.request) { console.error("[handleConfirmEdit] Erro - Sem resposta:", err.request); }
      else { console.error("[handleConfirmEdit] Erro - Configuração:", err.message); }
      setSnackbar({ open: true, message: 'Erro ao atualizar tarefa.', severity: 'error' });
    } finally {
      handleCloseEditDialog();
    }
  };

  // --- Função: Marcar como Concluído (Checkbox) (COM LOGS) ---
  const handleToggleComplete = async (todo) => {
    console.log("[handleToggleComplete] Iniciado para tarefa ID:", todo._id, "Status atual:", todo.completed); // Log Toggle 1
    try {
      console.log("[handleToggleComplete] Tentando chamar apiClient.put com completed:", !todo.completed); // Log Toggle 2
      const response = await apiClient.put(`/todos/${todo._id}`, { completed: !todo.completed });
      console.log("[handleToggleComplete] Chamada PUT bem-sucedida:", response.data); // Log Toggle 3
      setTodos(todos.map(t => t._id === todo._id ? response.data : t ));
    } catch (err) {
      console.error("[handleToggleComplete] ERRO no catch:", err); // Log Toggle 4 (ERRO!)
      if (err.response) { console.error("[handleToggleComplete] Erro - Status:", err.response.status); console.error("[handleToggleComplete] Erro - Data:", err.response.data); }
      else if (err.request) { console.error("[handleToggleComplete] Erro - Sem resposta:", err.request); }
      else { console.error("[handleToggleComplete] Erro - Configuração:", err.message); }
      setSnackbar({ open: true, message: 'Erro ao atualizar status.', severity: 'error' });
    }
  };

  // --- Funções de UI (Snackbar e Logout) ---
  const handleSnackbarClose = (event, reason) => { if (reason === 'clickaway') return; setSnackbar({ ...snackbar, open: false }); };
  const handleLogout = () => logout();

  // Log para debug do modal de delete
  console.log("[Dashboard Render] Estado openDeleteDialog:", openDeleteDialog);

  // --- Renderização ---
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
         <Toolbar>
           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}> Minhas Tarefas </Typography>
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

      {/* Modal de Delete */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent> <DialogContentText> Você tem certeza que deseja excluir esta tarefa? </DialogContentText> </DialogContent>
        <DialogActions> <Button onClick={handleCloseDeleteDialog}>Cancelar</Button> <Button onClick={handleConfirmDelete} color="error" autoFocus>Excluir</Button> </DialogActions>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
         <DialogTitle>Editar Tarefa</DialogTitle>
         <DialogContent>
           <DialogContentText> Digite o novo texto para a sua tarefa: </DialogContentText>
           <TextField autoFocus margin="dense" id="name" label="Texto da Tarefa" type="text" fullWidth variant="standard" value={newText} onChange={(e) => setNewText(e.target.value)} />
         </DialogContent>
         <DialogActions> <Button onClick={handleCloseEditDialog}>Cancelar</Button> <Button onClick={handleConfirmEdit}>Salvar</Button> </DialogActions>
       </Dialog>

      {/* Snackbar de Notificação */}
      <Snackbar open={snackbar.open} autoHideDuration={10000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
         <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}> {snackbar.message} </Alert>
       </Snackbar>

    </Box>
  );
}

export default Dashboard;
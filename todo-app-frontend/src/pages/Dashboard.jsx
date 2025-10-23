import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios'; // Importa o axios diretamente

// Importações do Material-UI
import {
  Container, Box, Typography, TextField, Button, List, ListItem,
  ListItemText, IconButton, AppBar, Toolbar, Alert, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, Checkbox 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit'; // Importa o Ícone de Edição

function Dashboard() {
  const { userToken, logout } = useAuth(); // Pega o token do "cérebro"
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Estados de Notificação
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estados do Modal de Delete
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  // Estados para o Modal de Edição
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState(null);
  const [newText, setNewText] = useState(''); 

  // --- Função para configurar o 'Authorization' header ---
  // (Trouxemos esta função de volta)
  const getAuthConfig = () => {
    return {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    };
  };

  // --- Efeito: Carregar Tarefas ---
  useEffect(() => {
    const fetchTodos = async () => {
      if (!userToken) return;
      try {
        setLoading(true);
        const response = await axios.get(
          'http://localhost:3000/api/todos',
          getAuthConfig() // Usa a função
        ); 
        setTodos(response.data);
      } catch (err) {
        setSnackbar({ open: true, message: 'Erro ao carregar tarefas.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, [userToken]); 

  // --- Função: Criar nova tarefa ---
  const handleCreateTodo = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const response = await axios.post(
        'http://localhost:3000/api/todos', 
        { text }, 
        getAuthConfig()
      );
      setTodos([response.data, ...todos]);
      setText('');
      setSnackbar({ open: true, message: 'Tarefa adicionada com sucesso!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao criar tarefa.', severity: 'error' });
    }
  };

  // --- Funções: Deletar Tarefa ---
  const handleOpenDeleteDialog = (id) => {
    setTodoToDelete(id);
    setOpenDeleteDialog(true);
  };
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTodoToDelete(null);
  };
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/todos/${todoToDelete}`, 
        getAuthConfig()
      );
      setTodos(todos.filter((todo) => todo._id !== todoToDelete));
      setSnackbar({ open: true, message: 'Tarefa deletada com sucesso!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao deletar tarefa.', severity: 'error' });
    } finally {
      handleCloseDeleteDialog();
    }
  };
  
  // --- Funções: Editar Tarefa (Modal) ---
  const handleOpenEditDialog = (todo) => {
    setTodoToEdit(todo); 
    setNewText(todo.text); 
    setOpenEditDialog(true);
  };
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setTodoToEdit(null);
    setNewText('');
  };
  const handleConfirmEdit = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/todos/${todoToEdit._id}`, 
        { text: newText }, 
        getAuthConfig()
      );
      setTodos(todos.map(todo => 
        todo._id === todoToEdit._id ? response.data : todo
      ));
      setSnackbar({ open: true, message: 'Tarefa atualizada com sucesso!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao atualizar tarefa.', severity: 'error' });
    } finally {
      handleCloseEditDialog();
    }
  };

  // --- Função: Marcar como Concluído (Checkbox) ---
  const handleToggleComplete = async (todo) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/todos/${todo._id}`, 
        { completed: !todo.completed }, // Envia o status oposto
        getAuthConfig()
      );
      setTodos(todos.map(t => 
        t._id === todo._id ? response.data : t
      ));
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao atualizar status.', severity: 'error' });
    }
  };

  // --- Funções de UI (Snackbar e Logout) ---
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };
  const handleLogout = () => logout();

  // --- Renderização ---
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Minhas Tarefas
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
        <Box component="form" onSubmit={handleCreateTodo} sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Adicionar nova tarefa..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" variant="contained" size="large">
            Adicionar
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {todos.length === 0 && (
              <Typography align="center">
                Nenhuma tarefa encontrada. Crie sua primeira tarefa!
              </Typography>
            )}
            {todos.map((todo) => (
              <ListItem
                key={todo._id}
                divider
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(todo)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(todo._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <Checkbox
                  edge="start"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo)}
                  tabIndex={-1}
                />
                <ListItemText
                  primary={todo.text}
                  style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Container>
      
      {/* Modal de Delete */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você tem certeza que deseja excluir esta tarefa?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>Excluir</Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de Edição */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Tarefa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Digite o novo texto para a sua tarefa:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Texto da Tarefa"
            type="text"
            fullWidth
            variant="standard"
            value={newText} 
            onChange={(e) => setNewText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button onClick={handleConfirmEdit}>Salvar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar de Notificação */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Dashboard;
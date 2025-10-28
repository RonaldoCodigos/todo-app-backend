// Em: src/context/ThemeContext.jsx

import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';

// Cria o Contexto
const ThemeContext = createContext({
  toggleThemeMode: () => {}, // Função vazia como padrão
  mode: 'light', // Modo padrão inicial
});

// Função para criar o tema MUI (baseado no modo)
const getMuiTheme = (mode) =>
  createTheme({
    palette: {
      mode, // 'light' ou 'dark'
      // ... (você pode adicionar suas cores primárias/secundárias aqui se quiser)
    },
  });

// Cria o Provedor do Contexto
export function AppThemeProvider({ children }) {
  // 1. Detecta preferência do sistema
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // 2. Estado para o modo atual ('light' ou 'dark')
  //    Tenta ler do localStorage, senão usa a preferência do sistema
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    // Define o estado inicial baseado no localStorage ou preferência do sistema
    return savedMode || (prefersDarkMode ? 'dark' : 'light');
  });

  // 3. Efeito para ATUALIZAR o modo se a PREFERÊNCIA DO SISTEMA mudar
  //    (mas só se o usuário NÃO tiver escolhido um modo manualmente antes)
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (!savedMode) { // Só atualiza se não houver escolha manual salva
        setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode]); // Roda sempre que a preferência do sistema mudar

  // 4. Função para alternar o modo MANUALMENTE e salvar no localStorage
  const toggleThemeMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode); // Salva a escolha manual
      return newMode;
    });
  };

  // 5. Cria o tema MUI dinamicamente
  const theme = useMemo(() => getMuiTheme(mode), [mode]);

  // 6. Valor a ser compartilhado pelo contexto
  const contextValue = useMemo(() => ({ toggleThemeMode, mode }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

// Hook customizado para usar o contexto facilmente
export const useAppTheme = () => useContext(ThemeContext);
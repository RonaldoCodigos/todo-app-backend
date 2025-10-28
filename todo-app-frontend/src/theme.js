// Em: src/theme.js
// VERSÃO COM TEMA DINÂMICO (Claro/Escuro)

import { createTheme } from '@mui/material/styles';

// Esta função AGORA irá criar o tema baseado no modo preferido
const getTheme = (prefersDarkMode) =>
  createTheme({
    palette: {
      // Define o modo (dark ou light) com base na preferência do sistema
      mode: prefersDarkMode ? 'dark' : 'light', 

      // Você pode definir cores específicas para cada modo aqui,
      // mas as cores padrão do MUI já se adaptam bem.
      // Exemplo (opcional):
      /*
      primary: {
        main: prefersDarkMode ? '#90caf9' : '#1976d2', 
      },
      secondary: {
        main: prefersDarkMode ? '#f48fb1' : '#dc004e',
      },
      background: {
          default: prefersDarkMode ? '#121212' : '#fff', // Cor de fundo principal
          paper: prefersDarkMode ? '#1d1d1d' : '#fff', // Cor de fundo de "papéis" (Cards, Modais)
      },
      */
    },
  });

// Exporta a FUNÇÃO que cria o tema, não mais o objeto do tema diretamente
export default getTheme;
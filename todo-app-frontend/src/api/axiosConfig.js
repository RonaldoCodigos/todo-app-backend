// Em: src/api/axiosConfig.js
// VERSÃO FINAL LIMPA

import axios from 'axios';

// Pega a URL da API da variável de ambiente VITE_API_URL
const apiURL = import.meta.env.VITE_API_URL;

// Cria uma "instância" do axios pré-configurada
const apiClient = axios.create({
  baseURL: `${apiURL}/api`, // Define a base para todas as chamadas
});

// Interceptor: Adiciona o token JWT automaticamente em todas as requisições
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Apenas rejeita o erro para ser tratado onde a chamada foi feita
    return Promise.reject(error);
  }
);

// Exporta a instância configurada
export default apiClient;
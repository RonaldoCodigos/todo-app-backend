import axios from 'axios';

// 1. Pega a URL da API do arquivo .env
const apiURL = import.meta.env.VITE_API_URL;

// 2. Cria uma "instância" do axios pré-configurada
const apiClient = axios.create({
  baseURL: `${apiURL}/api`, // Define a base de todas as chamadas
});

// 3. (Opcional, mas profissional)
// Adiciona um "Interceptor" que vai anexar o token
// em TODAS as requisições automaticamente.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
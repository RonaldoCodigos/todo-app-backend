import axios from 'axios';

// 1. Pega a URL da API do arquivo .env
const apiURL = 'https://todo-app-backend-uyb2.onrender.com';

// ----- DEBUGGING -----
console.log("API URL usada pelo Axios:", apiURL); 
// ----- FIM DEBUGGING -----

// 2. Cria uma "instância" do axios pré-configurada
const apiClient = axios.create({
  baseURL: `${apiURL}/api`, 
});

// ... (o resto do código com o interceptor continua igual) ...

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
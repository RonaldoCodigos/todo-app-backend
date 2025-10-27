import axios from 'axios';

// 1. Pega a URL da API da variável de ambiente VITE_API_URL
const apiURL = import.meta.env.VITE_API_URL;

// ----- DEBUGGING -----
console.log("[axiosConfig] VITE_API_URL lida no topo:", apiURL);
// ----- FIM DEBUGGING -----

// 2. Cria uma "instância" do axios pré-configurada
const apiClient = axios.create({
  baseURL: `${apiURL}/api`,
});

// ----- DEBUGGING 2 -----
console.log("[axiosConfig] Axios baseURL inicial configurada:", apiClient.defaults.baseURL);
// ----- FIM DEBUGGING 2 -----

// 3. Interceptor: Adiciona o token JWT automaticamente
apiClient.interceptors.request.use(
  (config) => {
    // ----- DEBUGGING INTERCEPTOR -----
    console.log("[Interceptor] Interceptando requisição para:", config.url);
    const currentApiUrl = import.meta.env.VITE_API_URL; // Re-ler para garantir
    console.log("[Interceptor] VITE_API_URL lida no interceptor:", currentApiUrl);
    // ----- FIM DEBUGGING INTERCEPTOR -----

    // Adiciona o token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log("[Interceptor] Header Authorization ADICIONADO.");
    } else {
      console.warn("[Interceptor] Header Authorization NÃO adicionado (sem token).");
    }

    console.log("[Interceptor] Config Final da Requisição:", config);
    return config;
  },
  (error) => {
    console.error("[Interceptor] ERRO na configuração da requisição:", error);
    return Promise.reject(error);
  }
);

export default apiClient;
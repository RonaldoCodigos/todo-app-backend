// Em: middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Precisamos verificar se o usuário do token ainda existe

const protect = async (req, res, next) => {
  let token;

  // 1. Verifica se o 'Authorization' header existe e começa com 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Separa o token do "Bearer "
      // O header virá como: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
      token = req.headers.authorization.split(' ')[1]; // Pega só a parte do token

      // 3. Verifica se o token é válido
      // jwt.verify decodifica o token usando o nosso segredo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Se for válido, busca o usuário no banco de dados pelo ID (que estava no token)
      // Adiciona este usuário ao objeto 'req' (requisição)
      // .select('-password') garante que a senha (mesmo criptografada) não seja anexada
      req.user = await User.findById(decoded.id).select('-password');
      
      // Se req.user for encontrado, tudo deu certo.
      if (!req.user) {
        throw new Error('Usuário não encontrado');
      }

      // 5. Deixa a requisição continuar para a rota final (ex: buscar tarefas)
      next();

    } catch (error) {
      console.error(error);
      res.status(401); // 401 = Não Autorizado
      // Manda o 'throw new Error' para o 'catch'
      // Joga um novo erro para ser pego pelo handler de erro do Express (se tivermos um)
      // ou apenas envia a resposta de erro
      res.json({ message: 'Não autorizado, token falhou' });
    }
  }

  // Se não encontrou 'Bearer' ou o 'Authorization' header
  if (!token) {
    res.status(401);
    res.json({ message: 'Não autorizado, nenhum token fornecido' });
  }
};

module.exports = { protect };
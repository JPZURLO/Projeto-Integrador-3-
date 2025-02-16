const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');  // Importa o modelo de usuário

const app = express();
const port = 5500;

// Middleware para lidar com JSON
app.use(express.json());

// Conectar ao MongoDB (substitua pela URL de conexão do seu MongoDB)
mongoose.connect('mongodb://localhost:27017/usuarios', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado ao MongoDB');
}).catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
});

// Endpoint de login (simples exemplo)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Verificar se o usuário já existe no banco
    const user = await User.findOne({ email });

    if (user && user.password === password) {
        return res.json({ message: 'Login bem-sucedido!' });
    } else {
        return res.status(400).json({ message: 'Credenciais inválidas!' });
    }
});

// Endpoint de registro (para salvar novos usuários)
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Usuário já existe!' });
    }

    // Criar um novo usuário
    const newUser = new User({ email, password });
    
    try {
        await newUser.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar usuário', error });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

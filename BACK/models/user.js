const mongoose = require('mongoose');

// Definindo o esquema de dados para o usuário
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,  // Garante que o email será único
    },
    password: {
        type: String,
        required: true,
    },
});

// Criando o modelo de usuário com base no esquema
const User = mongoose.model('User', userSchema);

module.exports = User;

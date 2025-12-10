const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const argon2 = require('argon2');

const app = express();
app.use(cors())
app.use(express.json())

const PORT = 3000;

const MongoURL = 'mongodb+srv://felipegustavo042009_db_user:yourfeed042207@cluster0.abplfu6.mongodb.net/?appName=Cluster0';

mongoose.connect(MongoURL)
    .then(console.log('Coneção feita com sucesso com o Mongo DB'))
    .catch(error => {
        console.log(`Erro ao fazer conceção ${error}`)
    })


//Modelo dos Locais/Ocupação
const Ocupacao = mongoose.model('ocupacao', new mongoose.Schema(
    {
        id: String,
        Nome: String,
        Sobre: String,
        Categoria: {
            type: String,
            enum: ['esporte', 'palestra', 'sala'],
            required: true
        }
    }
))


//Modelo das Reservas
const Reserva = mongoose.model('reserva', new mongoose.Schema({
    id: String,
    OcupacaoId: String,
    Data: Date
}))


// Modelo com estrutura e regras dos tokens
const TokenSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    TokenEnviado: String,
    TokenExpira: {
        type: Date,
        required: true
    }
})
//Criando Data de Expiração
TokenSchema.pre('save', function (next) {
    this.TokenExpira = new Date(Date.now() + 10 * 60 * 1000);
    next()
})
//Criando Data de Expiração
TokenSchema.index({ TokenExpira: 1 }, { expireAfterSeconds: 0 })
//Abrindo/Criando o documento
const Token = mongoose.model('token', TokenSchema)

//Modelo dos usuarios
const Usuario = mongoose.model('usuario', new mongoose.Schema({
    id: String,
    Nome: String,
    Email: String,
    Senha: String,
    EmailVerificado: Boolean,
    Tipo: {
        type: String,
        enum: ['adm', 'funcionario', 'usuario'],
        default: 'usuario',
        required: true
    },
}))


//APP(mechendo com os dados)...

//Usuario
app.post('/usuarios', async (req, res) => {

})
app.get('/usuarios', async (req, res) => {

})
app.delete('/usuarios', async (req, res) => {

})
app.patch('/usuarios', async (req, res) => {

})


//Token
app.post('/enviar-token', async (req, res) =>{

})
app.post('/validar-token', async (req, res) =>{
    
})



//Sala
app.post('/sala', async (req, res) => {

})
app.get('/sala', async (req, res) => {

})
app.delete('/sala', async (req, res) => {

})
app.patch('/sala', async (req, res) => {

})

//Reserva

app.post('/reserva', async (req, res) => {

})
app.get('/reserva', async (req, res) => {

})
app.delete('/reserva', async (req, res) => {

})
app.patch('/reserva', async (req, res) => {

})





app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`)
})
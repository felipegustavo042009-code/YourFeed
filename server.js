const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const argon2 = require('argon2');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname, 'biuld'))

const PORT = 5000;

// Salva imagens na pasta 'uploads/'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath); // Pasta onde as imagens vão
    },
    filename: function (req, file, cb) {
        // Gera nome único: 'imagem-123456789.jpg'
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // Pega extensão (.jpg, .png)
        cb(null, 'imagem-' + uniqueSuffix + ext);
    }
});

// Configura o upload (limite 5MB, apenas imagens)
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    fileFilter: function (req, file, cb) {
        // Aceita apenas: jpeg, jpg, png, gif, webp
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype); // Tipo do arquivo
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true); // Aceita arquivo
        }
        cb(new Error('Apenas imagens são permitidas!')); // Rejeita
    }
});

// Permite acessar imagens via URL: http://localhost:5000/uploads/nome-da-imagem.jpg
app.use('/uploads', express.static('uploads'));

// ======== CONEXÃO COM O BANCO DE DADOS ========
const MongoURL = 'mongodb+srv://felipegustavo042009_db_user:yourfeed042207@cluster0.abplfu6.mongodb.net/?appName=Cluster0';

mongoose.connect(MongoURL)
    .then(console.log('Conexão feita com sucesso com o MongoDB'))
    .catch(error => {
        console.log(`Erro ao fazer conexão: ${error}`);
    });

// Modelos dos dados do Banco
// 1. Sala/Espaço (Ocupacao)
const Ocupacao = mongoose.model('ocupacao', new mongoose.Schema({
    id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
    Nome: { type: String, required: true }, // Nome da sala
    Sobre: String, // Descrição
    Categoria: { type: String, enum: ['esporte', 'palestra', 'sala', 'reuniao'], required: true },
    Imagem: { type: String, default: '' }, // Nome do arquivo da imagem
    QuantidadeMaxima: { type: Number, required: true, min: 1 } // Capacidade
}, { timestamps: true }));

// 2. Reserva
const Reserva = mongoose.model('reserva', new mongoose.Schema({
    id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
    OcupacaoId: String, // ID da sala reservada
    Data: Date, // Data e hora da reserva
    NomeEvento: { type: String, required: true }, // Nome do evento
    Quantidade: { type: Number, required: true, min: 1 }, // Número de pessoas
    UsuarioId: String // ID do usuário que fez a reserva
}));

// 3. Token de verificação (para cadastro)
const TokenSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    TokenEnviado: String, // Código de 6 dígitos
    TokenExpira: { type: Date, required: true }, // Expira em 10 minutos
});
TokenSchema.pre('save', function (next) {
    this.TokenExpira = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    next();
});
TokenSchema.index({ TokenExpira: 1 }, { expireAfterSeconds: 0 }); // Apaga automaticamente após expirar
const Token = mongoose.model('token', TokenSchema);

// 4. Usuário
const Usuario = mongoose.model('usuario', new mongoose.Schema({
    id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
    Nome: String, // Nome do usuário
    Email: String, // Email único
    Senha: String, // Senha criptografada
    EmailVerificado: { type: Boolean, default: false },
    Tipo: { type: String, enum: ['adm', 'funcionario', 'usuario'], default: 'usuario', required: true }
}));



// Rotas

// USUÁRIOS
// GET /ListenUsuarios - Lista todos usuários (somente admin)
app.get('/ListenUsuarios', async (req, res) => {
    try {
        const { idUsuario } = req.query;
        const verificarAdm = await Usuario.findOne({ id: idUsuario });

        if (!verificarAdm || verificarAdm.Tipo !== 'adm') {
            return res.status(400).json('Somente o adm pode ver os dados dos usuarios');
        }

        const todosUsuarios = await Usuario.find();
        return res.status(200).json({
            mensagem: 'Mostrando todos usuarios',
            quantidade: todosUsuarios.length,
            usuarios: todosUsuarios.map(u => ({
                id: u.id,
                nome: u.Nome,
                email: u.Email,
                tipo: u.Tipo
            }))
        });
    } catch (error) {
        return res.status(400).json('Não foi possível pegar os usuarios');
    }
});

// POST /LoginUsuario - Faz login
app.post('/LoginUsuario', async (req, res) => {
    try {
        const { Email, Senha } = req.query;
        if (!Email || !Senha) {
            return res.status(400).json('Email e senha são obrigatórios');
        }

        const contaUsuario = await Usuario.findOne({ Email: Email });
        if (!contaUsuario) {
            return res.status(400).json('Email não encontrado');
        }

        // Verifica senha criptografada
        const verificarSenha = await argon2.verify(contaUsuario.Senha, Senha);
        if (!verificarSenha) {
            return res.status(400).json('Senha inválida');
        }

        res.status(200).json({
            id: contaUsuario.id.toString(),
            nome: contaUsuario.Nome.toString(),
            tipo: contaUsuario.Tipo.toString()
        });
    } catch (error) {
        res.status(400).json('Erro ao entrar na conta do usuario');
    }
});

// POST /RegisterUsuarios-validarToken - Valida token e cria conta
app.post('/RegisterUsuarios-validarToken', async (req, res) => {
    try {
        const { email, senha, nome, token } = req.query;
        if (!token) {
            return res.status(400).json({ error: 'Token é obrigatório' });
        }
        if (!email || !senha || !nome) {
            return res.status(400).json('Nome, email e senha são obrigatórios');
        }

        // Verifica se token é válido
        const tokenDoc = await Token.findOne({ email: email, TokenEnviado: token });
        if (!tokenDoc) {
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }

        // Verifica se email já existe
        const emailExiste = await Usuario.findOne({ Email: email });
        if (emailExiste) {
            return res.status(400).json('Email já cadastrado');
        }

        // Criptografa senha
        const hashSenha = await argon2.hash(senha, { type: argon2.argon2id });

        const novoUsuario = new Usuario({
            Nome: nome,
            Email: email,
            Senha: hashSenha
        });

        await novoUsuario.save();

        res.status(200).json({
            id: novoUsuario.id.toString(),
            tipo: novoUsuario.Tipo.toString(),
            nome: novoUsuario.Nome.toString(),
        });
    } catch (error) {
        console.log('Erro ao criar usuario', error);
        res.status(400).json('Erro ao cadastrar usuario');
    }
});

// DELETE /DeleteUsuarios - Exclui usuário (somente admin)
app.delete('/DeleteUsuarios', async (req, res) => {
    try {
        const { idUsuario, idAdm } = req.query;
        const validarTipo = await Usuario.findOne({ id: idAdm, Tipo: 'adm' });
        if (!validarTipo) {
            return res.status(400).json('Somente o admin pode apagar dados');
        }

        const existenciaUsuario = await Usuario.findOne({ id: idUsuario });
        if (!existenciaUsuario) {
            return res.status(400).json('Usuário não encontrado');
        }

        await Usuario.deleteOne({ id: idUsuario });
        return res.status(200).json('Dados do usuario apagados com sucesso');
    } catch (error) {
        return res.status(400).json('Não foi possível apagar usuario');
    }
});

// PATCH /AtualizarUsuariosTipo - Altera tipo de usuário (somente admin)
app.patch('/AtualizarUsuariosTipo', async (req, res) => {
    try {
        const { idUsuario, tipoNovo, idAdm } = req.query;
        if (!idUsuario || !tipoNovo || !idAdm) {
            return res.status(400).json('Dados incompletos');
        }

        const adm = await Usuario.findOne({ id: idAdm });
        if (!adm) {
            return res.status(403).json('Somente administradores podem alterar usuários');
        }

        const usuario = await Usuario.findOne({ id: idUsuario });
        if (!usuario) {
            return res.status(404).json('Usuário não encontrado');
        }

        await Usuario.updateOne({ id: idUsuario }, { Tipo: tipoNovo });
        return res.status(200).json('Tipo alterado com sucesso');
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

// PATCH /AtualizarUsuariosDados - Atualiza nome e/ou senha do próprio usuário
app.patch('/AtualizarUsuariosDados', async (req, res) => {
    try {
        const { idUsuario, novaSenha, novoNome } = req.query;
        // Valida força da senha
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,50}$/;
        if (novaSenha && novaSenha !== '' && !regex.test(novaSenha)) {
            return res.status(400).json('Senha muito fraca para ser usada');
        }

        const existenciaUsuario = await Usuario.findOne({ id: idUsuario });
        if (!existenciaUsuario) {
            return res.status(400).json('Usuário não encontrado');
        }

        const updateFields = {};
        if (novoNome && novoNome.trim() !== '') {
            updateFields.Nome = novoNome.trim();
        }
        if (novaSenha && novaSenha.trim() !== '') {
            updateFields.Senha = await argon2.hash(novaSenha, { type: argon2.argon2id });
        }

        if (Object.keys(updateFields).length > 0) {
            await Usuario.updateOne({ id: idUsuario }, updateFields);
            return res.status(200).json('Dados do usuario atualizados com sucesso');
        } else {
            return res.status(400).json('Nenhum dado fornecido para atualização');
        }
    } catch (error) {
        return res.status(400).json('Não foi possível atualizar usuario');
    }
});



// TOKENS 

// POST /enviar-token - Envia código de verificação por email
app.post('/enviar-token', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'Email é obrigatório' });
        }

        // Verifica se email já está cadastrado
        const usuarioExistente = await Usuario.findOne({ Email: email });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'Este email já está cadastrado' });
        }

        // Gera código aleatório de 6 dígitos
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let token = '';
        for (let i = 0; i < 6; i++) {
            const randomIndex = crypto.randomInt(0, chars.length);
            token += chars[randomIndex];
        }

        // Salva token no banco
        await Token.findOneAndUpdate(
            { email: email },
            { email: email, TokenEnviado: token },
            { upsert: true, new: true }
        );

        // Configura envio de email
        const transporte = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL, // Email do .env
                pass: process.env.EMAIL_SENHA // Senha do .env
            }
        });

        await transporte.verify(); // Testa conexão

        // Envia email com o código
        await transporte.sendMail({
            from: `"Sistema de Reservas" <${process.env.EMAIL}>`,
            to: email,
            subject: "Seu código de verificação",
            html: `<div>Seu código: <strong>${token}</strong> (expira em 10 minutos)</div>`
        });

        res.status(200).json({
            success: true,
            message: 'Token enviado com sucesso para o email'
        });

    } catch (error) {
        console.error('Erro ao enviar email:', error);
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
});



// SALAS/ESPAÇOS 

// GET /ListarSala - Lista todas as salas ou uma específica
app.get('/ListarSala', async (req, res) => {
    try {
        const { idSala } = req.query;
        let salas;

        if (!idSala || idSala === "") {
            salas = await Ocupacao.find(); // Todas as salas
        } else {
            salas = await Ocupacao.find({ id: idSala }); // Sala específica
        }

        const salasFormatadas = salas.map(sala => ({
            id: sala.id,
            nome: sala.Nome,
            sobre: sala.Sobre,
            categoria: sala.Categoria,
            imagem: sala.Imagem ? `/uploads/${path.basename(sala.Imagem)}` : null,
            quantidadeMaxima: sala.QuantidadeMaxima
        }));

        return res.status(200).json({
            mensagem: 'Dados encontrados com sucesso',
            salas: salasFormatadas,
            total: salas.length
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro ao listar salas", erro: error.message });
    }
});

// POST /CriarSala - Cria nova sala (somente admin)
app.post('/CriarSala', upload.single('imagem'), async (req, res) => {
    try {
        const { idUsuarios, nome, sobre, tipo, quantidadeMaxima } = req.query;

        // Valida dados obrigatórios
        if (!nome || !tipo || !quantidadeMaxima) {
            if (req.file) fs.unlinkSync(req.file.path); // Remove imagem se houver erro
            return res.status(400).json({ mensagem: 'Nome, tipo e quantidade máxima são obrigatórios' });
        }

        // Verifica se usuário é admin
        const validarTipo = await Usuario.findOne({ id: idUsuarios, Tipo: 'adm' });
        if (!validarTipo) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(403).json({ mensagem: 'Usuário precisa ser administrador' });
        }

        // Cria nova sala
        const novaSala = new Ocupacao({
            Nome: nome,
            Sobre: sobre || '',
            Categoria: tipo,
            Imagem: req.file ? req.file.filename : '', // Nome do arquivo
            QuantidadeMaxima: parseInt(quantidadeMaxima)
        });

        await novaSala.save();

        return res.status(201).json({
            mensagem: "Sala criada com sucesso",
            sala: {
                id: novaSala.id,
                nome: novaSala.Nome,
                sobre: novaSala.Sobre,
                categoria: novaSala.Categoria,
                imagem: req.file ? `/uploads/${req.file.filename}` : '',
                quantidadeMaxima: novaSala.QuantidadeMaxima
            }
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error(error);
        return res.status(500).json({ mensagem: "Erro ao criar sala", erro: error.message });
    }
});

// DELETE /DeletarSala - Exclui sala (somente admin)
app.delete('/DeletarSala', async (req, res) => {
    try {
        const { idUsuario, idSala } = req.query;

        // Verifica permissão
        const validarUsuario = await Usuario.findOne({ id: idUsuario, Tipo: 'adm' });
        if (!validarUsuario) {
            return res.status(403).json({ mensagem: "Usuário não tem permissão para deletar sala" });
        }

        if (!idSala) {
            return res.status(400).json({ mensagem: "ID da sala é obrigatório" });
        }

        // Busca sala
        const salaExistente = await Ocupacao.findOne({ id: idSala });
        if (!salaExistente) {
            return res.status(404).json({ mensagem: "Sala não encontrada" });
        }

        // Remove imagem associada
        if (salaExistente.Imagem) {
            const imagePath = path.join('uploads', salaExistente.Imagem);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await Ocupacao.deleteOne({ id: idSala });
        return res.status(200).json({ mensagem: "Sala deletada com sucesso" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro ao deletar sala", erro: error.message });
    }
});

// PATCH /AtualizarSala - Atualiza dados da sala (somente admin)
app.patch('/AtualizarSala', upload.single('imagem'), async (req, res) => {
    try {
        const { idUsuario, idSala, nome, sobre, quantidadeMaxima } = req.query;

        // Verifica permissão
        const validarUsuario = await Usuario.findOne({ id: idUsuario, Tipo: 'adm' });
        if (!validarUsuario) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(403).json({ mensagem: "Usuário não tem permissão para atualizar sala" });
        }

        if (!idSala) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ mensagem: "ID da sala é obrigatório" });
        }

        // Busca sala
        const salaExistente = await Ocupacao.findOne({ id: idSala });
        if (!salaExistente) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ mensagem: "Sala não encontrada" });
        }

        // Prepara dados para atualização
        const dadosAtualizacao = {};
        if (nome) dadosAtualizacao.Nome = nome;
        if (sobre !== undefined) dadosAtualizacao.Sobre = sobre;
        if (quantidadeMaxima !== undefined) dadosAtualizacao.QuantidadeMaxima = parseInt(quantidadeMaxima);

        // Se nova imagem foi enviada, remove a antiga
        if (req.file) {
            if (salaExistente.Imagem) {
                const oldImagePath = path.join('uploads', salaExistente.Imagem);
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
            dadosAtualizacao.Imagem = req.file.filename;
        }

        // Atualiza no banco
        await Ocupacao.updateOne({ id: idSala }, { $set: dadosAtualizacao });
        const salaAtualizada = await Ocupacao.findOne({ id: idSala });

        return res.status(200).json({
            mensagem: "Sala atualizada com sucesso",
            sala: {
                id: salaAtualizada.id,
                nome: salaAtualizada.Nome,
                sobre: salaAtualizada.Sobre,
                categoria: salaAtualizada.Categoria,
                imagem: salaAtualizada.Imagem ? `/uploads/${salaAtualizada.Imagem}` : '',
                quantidadeMaxima: salaAtualizada.QuantidadeMaxima
            }
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error(error);
        return res.status(500).json({ mensagem: "Erro ao atualizar sala", erro: error.message });
    }
});



// RESERVAS

// GET /ListarReserva - Lista reservas
app.get('/ListarReserva', async (req, res) => {
    try {
        const { idReserva, idUsuario } = req.query;

        if (!idUsuario) {
            return res.status(400).json({ mensagem: "ID do usuário é obrigatório" });
        }

        // Verifica usuário
        const usuarioValido = await Usuario.findOne({ id: idUsuario });
        if (!usuarioValido) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        // Busca reservas
        let reservas;
        if (idReserva) {
            reservas = await Reserva.find({ id: idReserva }); // Reserva específica
        } else {
            reservas = await Reserva.find(); // Todas as reservas
        }

        // Adiciona informações da sala e do usuário
        const reservasComDetalhes = await Promise.all(reservas.map(async (reserva) => {
            const sala = await Ocupacao.findOne({ id: reserva.OcupacaoId });
            const usuario = await Usuario.findOne({ id: reserva.UsuarioId });

            return {
                id: reserva.id,
                ocupacaoId: reserva.OcupacaoId,
                salaNome: sala ? sala.Nome : 'Sala não encontrada',
                nomeEvento: reserva.NomeEvento,
                data: reserva.Data,
                quantidade: reserva.Quantidade,
                usuarioId: reserva.UsuarioId,
                usuarioNome: usuario ? usuario.Nome : 'Usuário não encontrado',
                usuarioTipo: usuario ? usuario.Tipo : ''
            };
        }));

        return res.status(200).json({
            mensagem: 'Reservas listadas com sucesso',
            reservas: reservasComDetalhes,
            total: reservas.length
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro ao listar reservas", erro: error.message });
    }
});

// POST /CriarReserva - Cria nova reserva
app.post('/CriarReserva', async (req, res) => {
    try {
        const { idUsuario, idOcupacao, data, quantidade, nomeEvento } = req.query;

        // Valida dados obrigatórios
        if (!idUsuario || !idOcupacao || !data || !quantidade || !nomeEvento) {
            return res.status(400).json({ mensagem: "Dados incompletos" });
        }

        // Verifica usuário
        const usuarioExistente = await Usuario.findOne({ id: idUsuario });
        if (!usuarioExistente) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        // Verifica permissão: apenas admin e funcionários podem reservar
        if (usuarioExistente.Tipo !== 'adm' && usuarioExistente.Tipo !== 'funcionario') {
            return res.status(403).json({ mensagem: "Somente administradores e funcionários podem fazer reservas" });
        }

        // Verifica se sala existe
        const ocupacaoExistente = await Ocupacao.findOne({ id: idOcupacao });
        if (!ocupacaoExistente) {
            return res.status(404).json({ mensagem: "Sala não encontrada" });
        }

        // Valida data
        const dataReserva = new Date(data);
        if (isNaN(dataReserva.getTime())) {
            return res.status(400).json({ mensagem: "Data inválida" });
        }

        // Valida quantidade
        if (quantidade < 1) {
            return res.status(400).json({ mensagem: "Quantidade deve ser maior que zero" });
        }

        // Valida nome do evento
        if (!nomeEvento || nomeEvento.trim() === '') {
            return res.status(400).json({ mensagem: "Nome do evento é obrigatório" });
        }

        // VERIFICAÇÃO IMPORTANTE: Não pode reservar a mesma sala no mesmo dia
        const dataInicio = new Date(dataReserva);
        dataInicio.setHours(0, 0, 0, 0); // Início do dia
        const dataFim = new Date(dataReserva);
        dataFim.setHours(23, 59, 59, 999); // Fim do dia

        const reservasMesmoDia = await Reserva.find({
            OcupacaoId: idOcupacao,
            Data: { $gte: dataInicio, $lte: dataFim }
        });

        // Se já existe reserva neste dia, rejeita
        if (reservasMesmoDia.length > 0) {
            return res.status(400).json({
                mensagem: "Esta sala já está reservada para este dia",
                reservasExistentes: reservasMesmoDia.map(r => ({
                    nomeEvento: r.NomeEvento,
                    data: r.Data,
                    quantidade: r.Quantidade
                }))
            });
        }

        // Verifica se quantidade não excede capacidade da sala
        if (parseInt(quantidade) > ocupacaoExistente.QuantidadeMaxima) {
            return res.status(400).json({
                mensagem: "Quantidade excede o limite máximo da sala",
                disponivel: ocupacaoExistente.QuantidadeMaxima
            });
        }

        // Cria reserva
        const novaReserva = new Reserva({
            OcupacaoId: idOcupacao,
            Data: dataReserva,
            NomeEvento: nomeEvento.trim(),
            Quantidade: parseInt(quantidade),
            UsuarioId: idUsuario
        });

        await novaReserva.save();

        return res.status(201).json({
            mensagem: "Reserva criada com sucesso",
            reserva: {
                id: novaReserva.id,
                ocupacaoId: novaReserva.OcupacaoId,
                data: novaReserva.Data,
                nomeEvento: novaReserva.NomeEvento,
                quantidade: novaReserva.Quantidade,
                usuarioId: novaReserva.UsuarioId
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro ao criar reserva", erro: error.message });
    }
});

// DELETE /DeletarReserva - Exclui reserva
app.delete('/DeletarReserva', async (req, res) => {
    try {
        const { idUsuario, idReserva } = req.query;

        if (!idUsuario || !idReserva) {
            return res.status(400).json({ mensagem: "Dados incompletos" });
        }

        // Verifica usuário
        const usuarioValido = await Usuario.findOne({ id: idUsuario });
        if (!usuarioValido) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        // Verifica reserva
        const reservaExistente = await Reserva.findOne({ id: idReserva });
        if (!reservaExistente) {
            return res.status(404).json({ mensagem: "Reserva não encontrada" });
        }

        // Permissões: admin ou funcionário pode deletar qualquer, usuário só a própria
        if (usuarioValido.Tipo !== 'adm' && usuarioValido.Tipo !== 'funcionario' && reservaExistente.UsuarioId !== idUsuario) {
            return res.status(403).json({ mensagem: "Não tem permissão para deletar esta reserva" });
        }

        await Reserva.deleteOne({ id: idReserva });
        return res.status(200).json({ mensagem: "Reserva deletada com sucesso" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro ao deletar reserva", erro: error.message });
    }
});

// PATCH /AtualizarReserva - Atualiza reserva (nome evento e quantidade)
app.patch('/AtualizarReserva', async (req, res) => {
    try {
        const { idUsuario, idReserva, quantidade, nomeEvento } = req.query;

        if (!idUsuario || !idReserva) {
            return res.status(400).json({ mensagem: "ID do usuário e reserva são obrigatórios" });
        }

        // Verifica usuário
        const usuarioValido = await Usuario.findOne({ id: idUsuario });
        if (!usuarioValido) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        // Verifica reserva
        const reservaExistente = await Reserva.findOne({ id: idReserva });
        if (!reservaExistente) {
            return res.status(404).json({ mensagem: "Reserva não encontrada" });
        }

        // Permissões: admin ou funcionário pode editar qualquer, usuário só a própria
        if (usuarioValido.Tipo !== 'adm' && usuarioValido.Tipo !== 'funcionario' && reservaExistente.UsuarioId !== idUsuario) {
            return res.status(403).json({ mensagem: "Usuário não tem permissão para atualizar esta reserva" });
        }

        // Prepara dados para atualização
        const updateFields = {};
        if (nomeEvento && nomeEvento.trim() !== '') {
            updateFields.NomeEvento = nomeEvento.trim();
        }

        if (quantidade) {
            if (quantidade < 1) {
                return res.status(400).json({ mensagem: "Quantidade deve ser maior que zero" });
            }

            // Verifica capacidade da sala
            const ocupacaoExistente = await Ocupacao.findOne({ id: reservaExistente.OcupacaoId });
            if (!ocupacaoExistente) {
                return res.status(404).json({ mensagem: "Sala não encontrada" });
            }

            if (parseInt(quantidade) > ocupacaoExistente.QuantidadeMaxima) {
                return res.status(400).json({
                    mensagem: "Quantidade excede o limite máximo da sala",
                    disponivel: ocupacaoExistente.QuantidadeMaxima
                });
            }

            updateFields.Quantidade = parseInt(quantidade);
        }

        // Se não há dados para atualizar
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ mensagem: "Nenhum dado fornecido para atualização" });
        }

        // Atualiza reserva
        await Reserva.updateOne({ id: idReserva }, { $set: updateFields });
        const reservaAtualizada = await Reserva.findOne({ id: idReserva });

        return res.status(200).json({
            mensagem: "Reserva atualizada com sucesso",
            reserva: {
                id: reservaAtualizada.id,
                ocupacaoId: reservaAtualizada.OcupacaoId,
                data: reservaAtualizada.Data,
                nomeEvento: reservaAtualizada.NomeEvento,
                quantidade: reservaAtualizada.Quantidade,
                usuarioId: reservaAtualizada.UsuarioId
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro ao atualizar reserva", erro: error.message });
    }
});



// INICIA SERVIDOR 
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
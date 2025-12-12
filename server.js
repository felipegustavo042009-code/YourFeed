const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const argon2 = require('argon2');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv')

dotenv.config();
const app = express();
app.use(cors())
app.use(express.json())

const PORT = 5000;

// Configuração do multer para upload de imagens Pesquisar sistema depois(deeepseek)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'imagem-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Apenas imagens são permitidas!'));
    }
});

app.use('/uploads', express.static('uploads'));

const MongoURL = 'mongodb+srv://felipegustavo042009_db_user:yourfeed042207@cluster0.abplfu6.mongodb.net/?appName=Cluster0';

mongoose.connect(MongoURL)
    .then(console.log('Coneção feita com sucesso com o Mongo DB'))
    .catch(error => {
        console.log(`Erro ao fazer conceção ${error}`)
    })

const Ocupacao = mongoose.model('ocupacao', new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            default: () => new mongoose.Types.ObjectId().toString()
        },
        Nome: {
            type: String,
            required: true
        },
        Sobre: String,
        Categoria: {
            type: String,
            enum: ['esporte', 'palestra', 'sala'],
            required: true
        },
        Imagem: {
            type: String,
            default: ''
        },
        QuantidadeMaxima: {
            type: Number,
            required: true,
            min: 1
        }
    },
    { timestamps: true }
));

const Reserva = mongoose.model('reserva', new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    OcupacaoId: String,
    Data: Date,
    Quantidade: {
        type: Number,
        required: true,
        min: 1
    },
    UsuarioId: String
}))

const TokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    TokenEnviado: String,
    TokenExpira: {
        type: Date,
        required: true
    },
});

TokenSchema.pre('save', function (next) {
    this.TokenExpira = new Date(Date.now() + 10 * 60 * 1000);
    next()
})

TokenSchema.index({ TokenExpira: 1 }, { expireAfterSeconds: 0 })

const Token = mongoose.model('token', TokenSchema)

const Usuario = mongoose.model('usuario', new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    Nome: String,
    Email: String,
    Senha: String,
    EmailVerificado: {
        type: Boolean,
        default: false,
    },
    Tipo: {
        type: String,
        enum: ['adm', 'funcionario', 'usuario'],
        default: 'usuario',
        required: true
    },
}))


//App, mechendo com os dados

//Usuarios
app.get('/ListenUsuarios', async (req, res) => {
    try {
        const { idUsuario } = req.query;

        const verificarAdm = await Usuario.findOne({ id: idUsuario })

        if (!verificarAdm || verificarAdm.Tipo !== 'adm') {
            return res.status(400).json('Somente o adm pode pegar/ver os dados dos usuarios')
        }

        const todosUsuarios = await Usuario.find()

        return res.status(200).json({
            mensagem: 'Monstrando todos usuarios',
            quantidade: todosUsuarios.length,
            usuarios: todosUsuarios.map(u => ({
                id: u.id,
                nome: u.Nome,
                email: u.Email,
                tipo: u.Tipo
            }))
        })
    }
    catch (error) {
        return res.status(400).json('Não foi possivel pegar os usuarios')
    }
})

app.post('/LoginUsuario', async (req, res) => {
    try {
        const { Email, Senha } = req.query;

        if (!Email || !Senha) {
            return res.status(400).json('Não se pode achar usuarios sem o email ou senha')
        }

        const contaUsuario = await Usuario.findOne({ Email: Email });

        if (!contaUsuario) {
            return res.status(400).json('Email não achado')
        }

        const verificarSenha = await argon2.verify(contaUsuario.Senha, Senha)
        if (!verificarSenha) {
            return res.status(400).json('Erro senha invalida')
        }

        const usuarioObjeto = contaUsuario.toObject()

        res.status(200).json({
            id: usuarioObjeto.id.toString(),
            nome: usuarioObjeto.Nome.toString(),
            tipo: usuarioObjeto.Tipo.toString()
        })
    }
    catch (error) {
        res.status(400).json('Erro ao entrar na conta do usuario')
    }
})

app.post('/RegisterUsuarios-validarToken', async (req, res) => {
    try {
        const { email, senha, nome, token } = req.query;

        if (!token) {
            return res.status(400).json({
                error: 'Token são obrigatórios'
            });
        }

        if (!email || !senha || !nome) {
            return res.status(400).json('Não se pode criar usuarios sem nome, email ou senha')
        }

        const tokenDoc = await Token.findOne({
            email: email,
            TokenEnviado: token
        });

        if (!tokenDoc) {
            return res.status(400).json({
                error: 'Token inválido ou expirado'
            });
        }

        const emailExiste = await Usuario.findOne({ Email: email });
        if (emailExiste) {
            return res.status(400).json('Email ja cadastrado')
        }

        const hashSenha = await argon2.hash(senha, { type: argon2.argon2id })

        const novoUsuario = new Usuario({
            Nome: nome,
            Email: email,
            Senha: hashSenha
        })

        await novoUsuario.save()

        const usuarioobjeto = novoUsuario.toObject()

        res.status(200).json({
            id: usuarioobjeto.id.toString(),
            tipo: usuarioobjeto.tipo.toString(),
        })
    }
    catch (error) {
        console.log('Erro ao criar usario', error)
        res.status(400).json('Erro ao cadastrar usuario')
    }
})

app.delete('/DeleteUsuarios', async (req, res) => {
    try {
        const { idUsuario } = req.query;

        const existenciaUsuario = await Usuario.findOne({ id: idUsuario })
        if (!existenciaUsuario) {
            return res.status(400).json('Erro ao achar usuario')
        }

        await Usuario.deleteOne({ id: idUsuario })

        return res.status(200).json('Dados do usuario apagados com sucesso')
    }
    catch (error) {
        return res.status(400).json('Não foi possivel apagar usuario')
    }
})

app.patch('/AtualizarUsuarios', async (req, res) => {
    try {
        const { idUsuario, tipoNovo } = req.query;

        const existenciaUsuario = await Usuario.findOne({ id: idUsuario })
        if (!existenciaUsuario) {
            return res.status(400).json('Erro ao achar usuario')
        }

        await Usuario.updateOne({ id: idUsuario }, { Tipo: tipoNovo })

        return res.status(200).json('Dados do usuario atualizados com sucesso')
    }
    catch (error) {
        return res.status(400).json('Não foi possivel atualizar usuario')
    }
})

//Token
app.post('/enviar-token', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                error: 'Email é obrigatório'
            });
        }

        const usuarioExistente = await Usuario.findOne({ Email: email });
        if (usuarioExistente) {
            return res.status(400).json({
                error: 'Este email já está cadastrado'
            });
        }

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let token = '';
        for (let i = 0; i < 6; i++) {
            const randomIndex = crypto.randomInt(0, chars.length);
            token += chars[randomIndex];
        }

        await Token.findOneAndUpdate(
            { email: email },
            {
                email: email,
                TokenEnviado: token
            },
            { upsert: true, new: true }
        );

        //Deepsek, verificar o que esta pegando
        console.log('Email config:', process.env.EMAIL);
        console.log('Senha config:', process.env.EMAIL_SENHA ? '***' : 'NÃO DEFINIDA');

        //Criando transporter para pegar e enviar email/, somente para gmail.com
        const transporte = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_SENHA
            }
        });

        // Teste a conexão
        await transporte.verify();

        const info = await transporte.sendMail({
            from: `"Sistema de Reservas" <${process.env.EMAIL}>`,
            to: email,
            subject: "Seu código de verificação",
            html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Código de Verificação</h2>
                    <p>Seu código de verificação é: <strong style="font-size: 24px;">${token}</strong></p>
                    <p>Este código expira em 10 minutos.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">Não responda a este email.</p>
                   </div>`
        });

        console.log('Email enviado:', info.messageId);

        res.status(200).json({
            success: true,
            message: 'Token enviado com sucesso para o email'
        });

    } catch (error) {
        console.error('Erro detalhado ao enviar email:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});


app.get('/ListarSala', async (req, res) => {
    try {
        const { idSala } = req.query;
        let salas;

        if (!idSala || idSala === "") {
            salas = await Ocupacao.find();
        } else {
            salas = await Ocupacao.find({ id: idSala });
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
            mensagem: 'Dados achados com sucesso',
            salas: salasFormatadas,
            total: salas.length
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao listar salas",
            erro: error.message
        });
    }
});

app.post('/CriarSala', upload.single('imagem'), async (req, res) => {
    try {
        const { idUsuarios, nome, sobre, tipo, quantidadeMaxima } = req.query;

        if (!nome || !tipo || !quantidadeMaxima) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                mensagem: 'Nome, tipo e quantidade máxima são obrigatórios'
            });
        }

        const validarTipo = await Usuario.findOne({
            id: idUsuarios,
            Tipo: 'adm'
        });

        if (!validarTipo) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(403).json({
                mensagem: 'Usuário precisa ser administrador'
            });
        }

        let imagemPath = '';
        if (req.file) {
            imagemPath = req.file.filename;
        }

        const novaSala = new Ocupacao({
            Nome: nome,
            Sobre: sobre || '',
            Categoria: tipo,
            Imagem: imagemPath,
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
                imagem: imagemPath ? `/uploads/${imagemPath}` : '',
                quantidadeMaxima: novaSala.QuantidadeMaxima
            }
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao criar sala",
            erro: error.message
        });
    }
});

app.delete('/DeletarSala', async (req, res) => {
    try {
        const { idUsuario, idSala } = req.query;

        const validarUsuario = await Usuario.findOne({
            id: idUsuario,
            Tipo: 'adm'
        });

        if (!validarUsuario) {
            return res.status(403).json({
                mensagem: "Usuário não tem permissão para deletar sala"
            });
        }

        if (!idSala) {
            return res.status(400).json({
                mensagem: "ID da sala é obrigatório"
            });
        }

        const salaExistente = await Ocupacao.findOne({ id: idSala });
        if (!salaExistente) {
            return res.status(404).json({
                mensagem: "Sala não encontrada"
            });
        }

        if (salaExistente.Imagem) {
            const imagePath = path.join('uploads', salaExistente.Imagem);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Ocupacao.deleteOne({ id: idSala });

        return res.status(200).json({
            mensagem: "Sala deletada com sucesso"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao deletar sala",
            erro: error.message
        });
    }
});

app.patch('/AtualizarSala', upload.single('imagem'), async (req, res) => {
    try {
        const { idUsuario, idSala, nome, sobre, quantidadeMaxima } = req.query;

        const validarUsuario = await Usuario.findOne({
            id: idUsuario,
            Tipo: 'adm'
        });

        if (!validarUsuario) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(403).json({
                mensagem: "Usuário não tem permissão para atualizar sala"
            });
        }

        if (!idSala) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                mensagem: "ID da sala é obrigatório"
            });
        }

        const salaExistente = await Ocupacao.findOne({ id: idSala });
        if (!salaExistente) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                mensagem: "Sala não encontrada"
            });
        }

        const dadosAtualizacao = {};

        if (nome) dadosAtualizacao.Nome = nome;
        if (sobre !== undefined) dadosAtualizacao.Sobre = sobre;
        if (quantidadeMaxima !== undefined) dadosAtualizacao.QuantidadeMaxima = parseInt(quantidadeMaxima);

        if (req.file) {
            if (salaExistente.Imagem) {
                const oldImagePath = path.join('uploads', salaExistente.Imagem);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            dadosAtualizacao.Imagem = req.file.filename;
        }

        await Ocupacao.updateOne(
            { id: idSala },
            { $set: dadosAtualizacao }
        );

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
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao atualizar sala",
            erro: error.message
        });
    }
});


//Reservas
app.get('/ListarReserva', async (req, res) => {
    try {
        const { idReserva, idUsuario } = req.query;

        if (!idUsuario) {
            return res.status(400).json({
                mensagem: "ID do usuário é obrigatório"
            });
        }

        const usuarioValido = await Usuario.findOne({ id: idUsuario });

        if (!usuarioValido) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado"
            });
        }

        if (usuarioValido.Tipo !== 'adm' && usuarioValido.Tipo !== 'funcionario') {
            return res.status(403).json({
                mensagem: "Somente administradores e funcionários podem fazer reservas"
            });
        }

        let reservas;
        if (idReserva) {
            reservas = await Reserva.find({ id: idReserva });
        } else if (usuarioValido.Tipo === 'adm' || usuarioValido.Tipo === 'funcionario') {
            reservas = await Reserva.find();
        } else {
            reservas = await Reserva.find({ UsuarioId: idUsuario });
        }

        const reservasComDetalhes = await Promise.all(reservas.map(async (reserva) => {
            const sala = await Ocupacao.findOne({ id: reserva.OcupacaoId });
            const usuario = await Usuario.findOne({ id: reserva.UsuarioId });

            return {
                id: reserva.id,
                ocupacaoId: reserva.OcupacaoId,
                salaNome: sala ? sala.Nome : 'Sala não encontrada',
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
        return res.status(500).json({
            mensagem: "Erro ao listar reservas",
            erro: error.message
        });
    }
})

app.post('/CriarReserva', async (req, res) => {
    try {
        const { idUsuario, idOcupacao, data, quantidade } = req.query;

        if (!idUsuario || !idOcupacao || !data || !quantidade) {
            return res.status(400).json({
                mensagem: "Dados incompletos"
            });
        }

        const usuarioExistente = await Usuario.findOne({ id: idUsuario });
        if (!usuarioExistente) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado"
            });
        }

        if (usuarioExistente.Tipo !== 'adm' && usuarioExistente.Tipo !== 'funcionario') {
            return res.status(403).json({
                mensagem: "Somente administradores e funcionários podem fazer reservas"
            });
        }

        const ocupacaoExistente = await Ocupacao.findOne({ id: idOcupacao });
        if (!ocupacaoExistente) {
            return res.status(404).json({
                mensagem: "Ocupação não encontrada"
            });
        }

        const dataReserva = new Date(data);
        if (isNaN(dataReserva.getTime())) {
            return res.status(400).json({
                mensagem: "Data inválida"
            });
        }

        if (quantidade < 1) {
            return res.status(400).json({
                mensagem: "Quantidade deve ser maior que zero"
            });
        }

        const reservasNaData = await Reserva.find({
            OcupacaoId: idOcupacao,
            Data: {
                $gte: new Date(dataReserva.setHours(0, 0, 0, 0)),
                $lt: new Date(dataReserva.setHours(23, 59, 59, 999))
            }
        });

        const totalReservado = reservasNaData.reduce((total, reserva) => total + reserva.Quantidade, 0);

        if (totalReservado + parseInt(quantidade) > ocupacaoExistente.QuantidadeMaxima) {
            return res.status(400).json({
                mensagem: "Quantidade excede o limite máximo disponível",
                disponivel: ocupacaoExistente.QuantidadeMaxima - totalReservado
            });
        }

        const novaReserva = new Reserva({
            OcupacaoId: idOcupacao,
            Data: dataReserva,
            Quantidade: parseInt(quantidade),
            UsuarioId: idUsuario
        });

        await novaReserva.save();

        const reservaObjeto = novaReserva.toObject();

        return res.status(201).json({
            mensagem: "Reserva criada com sucesso",
            reserva: {
                id: reservaObjeto.id,
                ocupacaoId: reservaObjeto.OcupacaoId,
                data: reservaObjeto.Data,
                quantidade: reservaObjeto.Quantidade,
                usuarioId: reservaObjeto.UsuarioId
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao criar reserva",
            erro: error.message
        });
    }
})

app.delete('/DeletarReserva', async (req, res) => {
    try {
        const { idUsuario, idReserva } = req.query;

        if (!idUsuario || !idReserva) {
            return res.status(400).json({
                mensagem: "Dados incompletos"
            });
        }

        const usuarioValido = await Usuario.findOne({ id: idUsuario });

        if (!usuarioValido) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado"
            });
        }

        const reservaExistente = await Reserva.findOne({ id: idReserva });
        if (!reservaExistente) {
            return res.status(404).json({
                mensagem: "Reserva não encontrada"
            });
        }

        if (usuarioValido.Tipo !== 'adm' && usuarioValido.Tipo !== 'funcionario' && reservaExistente.UsuarioId !== idUsuario) {
            return res.status(403).json({
                mensagem: "Não tem permissão para deletar esta reserva"
            });
        }

        await Reserva.deleteOne({ id: idReserva });

        return res.status(200).json({
            mensagem: "Reserva deletada com sucesso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao deletar reserva",
            erro: error.message
        });
    }
})

app.patch('/AtualizarReserva', async (req, res) => {
    try {
        const { idUsuario, idReserva, quantidade } = req.query;

        if (!idUsuario || !idReserva) {
            return res.status(400).json({
                mensagem: "ID do usuário e reserva são obrigatórios"
            });
        }

        const usuarioValido = await Usuario.findOne({ id: idUsuario });

        if (!usuarioValido) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado"
            });
        }

        const reservaExistente = await Reserva.findOne({ id: idReserva });
        if (!reservaExistente) {
            return res.status(404).json({
                mensagem: "Reserva não encontrada"
            });
        }

        if (usuarioValido.Tipo !== 'adm' && usuarioValido.Tipo !== 'funcionario' && reservaExistente.UsuarioId !== idUsuario) {
            return res.status(403).json({
                mensagem: "Usuario não tem permissão para atualizar esta reserva"
            });
        }

        if (quantidade) {
            if (quantidade < 1) {
                return res.status(400).json({
                    mensagem: "Quantidade deve ser maior que zero"
                });
            }

            const ocupacaoExistente = await Ocupacao.findOne({ id: reservaExistente.OcupacaoId });
            if (!ocupacaoExistente) {
                return res.status(404).json({
                    mensagem: "Ocupação não encontrada"
                });
            }

            const reservasNaData = await Reserva.find({
                OcupacaoId: reservaExistente.OcupacaoId,
                Data: reservaExistente.Data,
                id: { $ne: idReserva }
            });

            const totalReservado = reservasNaData.reduce((total, reserva) => total + reserva.Quantidade, 0);

            if (totalReservado + parseInt(quantidade) > ocupacaoExistente.QuantidadeMaxima) {
                return res.status(400).json({
                    mensagem: "Quantidade excedida",
                    disponivel: ocupacaoExistente.QuantidadeMaxima - totalReservado
                });
            }

            await Reserva.updateOne(
                { id: idReserva },
                { $set: { Quantidade: parseInt(quantidade) } }
            );
        }

        const reservaAtualizada = await Reserva.findOne({ id: idReserva });

        return res.status(200).json({
            mensagem: "Reserva atualizada com sucesso",
            reserva: {
                id: reservaAtualizada.id,
                ocupacaoId: reservaAtualizada.OcupacaoId,
                data: reservaAtualizada.Data,
                quantidade: reservaAtualizada.Quantidade,
                usuarioId: reservaAtualizada.UsuarioId
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao atualizar reserva",
            erro: error.message
        });
    }
})


app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`)
})
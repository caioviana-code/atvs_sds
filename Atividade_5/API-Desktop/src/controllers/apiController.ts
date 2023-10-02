import { Request, Response } from 'express';
import { Usuario } from '../models/Usuario';
import { Notificacao } from '../models/Notificacao';

const { createLogger, transports, format } = require('winston')

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'audit.log' })
    ]
})

export const ping = (req: Request, res: Response) => {
    res.json({ pong: true });
}

export const cadastrarUsuario = async (req: Request, res: Response) => {
    logger.info('Endpoint cadastrarUsuario acionado.')

    const { nome, email, senha, disciplina } = req.body;
    if (email && senha && nome && disciplina) {

        let usuarioExistente = await Usuario.findOne({ where: { email } });
        if (!usuarioExistente) {
            let novoUsuario = await Usuario.create({ email, senha, nome, disciplina });

            res.status(201);
            return res.json({
                message: "Usuário cadastrado com sucesso.",
                novoUsuario
            });
        } else {
            logger.warn('Tentativa de cadastro com e-mail já existente.')
            return res.status(400).json({ error: 'E-mail já existe.' });
        }
    }

    logger.error('Campos inválidos no cadastro de usuário.');
    return res.status(400).json({ error: 'E-mail e/ou senha não enviados.' });
}

export const fazerLogin = async (req: Request, res: Response) => {
    logger.info('Endpoint fazerLogin acionado.')

    if (req.body.email && req.body.senha) {
        let email: string = req.body.email;
        let senha: string = req.body.senha;

        let usuario = await Usuario.findOne({
            where: { email, senha }
        });

        if (usuario) {
            logger.info('Login bem-sucedido para o usuário com e-mail: ' + email)
            res.json({ status: true });
            return;
        }
    }

    logger.warn('Tentativa de login inválida.')
    res.json({ status: false });
}

export const listarEmails = async (req: Request, res: Response) => {
    logger.info('Endpoint listarEmails acionado.')

    let usuarios = await Usuario.findAll();
    let listaEmails: string[] = [];

    for (let i in usuarios) {
        listaEmails.push(usuarios[i].email);
    }

    res.json({ listaEmails });
}

export const listarTodosUsuarios = async (req: Request, res: Response) => {
    logger.info('Endpoint listarTodosUsuarios acionado.')

    let usuarios = await Usuario.findAll();

    res.json({ usuarios });
}

export const deletarUsuario = async (req: Request, res: Response) => {
    logger.info('Endpoint deletarUsuario acionado.')

    const { id } = req.params;

    try {
        const user = await Usuario.findByPk(id);

        if (user) {
            const deletedUserName = user.nome; // Obtém o nome do usuário que será deletado

            user.destroy();
            await user.save(); // Salva as alterações do status

            logger.info(`Usuário ${deletedUserName} foi removido com sucesso.`);
            res.status(200).json({ message: `Usuário ${deletedUserName} foi removido com sucesso.`, status: '200' });
        } else {
            logger.warn(`Usuário com ID ${id} não encontrado.`);
            res.status(404).json({ message: `Usuário com ID ${id} não encontrado.`, status: '404' });
        }
    } catch (error) {
        logger.error('Erro ao remover o usuário:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao remover o usuário.', status: '500', error });
    }
}

export const atualizarUsuario = async (req: Request, res: Response) => {
    logger.info('Endpoint atualizarUsuario acionado.')

    const { id } = req.params;
    const valores = req.body;

    // Verificar se algum valor está vazio ou nulo
    const estaVazio = Object.values(valores).some((valor) => valor === null || valor === '');

    if (estaVazio) {
        logger.warn('Dados enviados estão incompletos.')
        return res.status(400).json({ mensagem: 'Os dados enviados estão incompletos.', status: '400' });
    }

    try {
        const usuarioEncontrado = await Usuario.findOne({ where: { id } });

        if (!usuarioEncontrado) {
            logger.warn(`Usuário com ID ${id} não encontrado.`)
            return res.status(404).json({ mensagem: 'Usuário não encontrado.', status: '404' });
        }

        await Usuario.update(valores, { where: { id } });

        const usuarioAtualizado = await Usuario.findOne({ where: { id } });

        logger.info('Usuário atualizado com sucesso.')
        return res.status(200).json({ mensagem: 'Usuário atualizado com sucesso.', status: '200', usuarioAtualizado });
    } catch (erro) {
        logger.error('Erro ao atualizar o usuário:', erro)
        return res.status(500).json({ mensagem: 'Erro ao atualizar usuário.', status: '500', erro });
    }
}

export const pegarUsuarioPeloId = async (req: Request, res: Response) => {
    logger.info('Endpoint pegarUsuarioPeloId acionado.')

    const { id } = req.params;
    try {
        const usuario = await Usuario.findByPk(id);
        logger.info(`Usuário encontrado com ID: ${id}`)
        res.status(200).json({ message: `Usuário encontrado`, status: '200', usuario });
    } catch (error) {
        logger.error('Erro ao buscar usuário pelo ID:', error)
        throw error;
    }
}

export const mostrarNotificacao = async (req: Request, res: Response) => {
    logger.info('Endpoint mostrarNotificacao acionado.')

    let notificacao = await Notificacao.findAll();

    res.json({ notificacao });
}

export const atualizarNotificacao = async (req: Request, res: Response) => {
    logger.info('Endpoint atualizarNotificacao acionado.')

    const { titulo, corpo, mostrar } = req.body;

    if (titulo && corpo && mostrar) {
        try {
            // Verifique se já existe uma notificação no banco de dados
            const notificacaoExistente = await Notificacao.findOne();

            if (notificacaoExistente) {
                // Atualize a notificação existente com os novos valores
                notificacaoExistente.titulo = titulo;
                notificacaoExistente.corpo = corpo;
                notificacaoExistente.mostrar = mostrar;

                await notificacaoExistente.save();

                logger.info('Notificação atualizada com sucesso.')
                res.status(200).json({ message: "Notificação atualizada com sucesso.", notificacao: notificacaoExistente });
            } else {
                logger.warn('Notificação não encontrada.')
                res.status(404).json({ error: 'Notificação não encontrada.' });
            }
        } catch (error) {
            logger.error('Erro interno no servidor:', error)
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    } else {
        logger.warn('Campos inválidos.')
        res.status(400).json({ error: 'Campos inválidos.' });
    }
}
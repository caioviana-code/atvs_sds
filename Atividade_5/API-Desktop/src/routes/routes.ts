import { Router } from 'express';
const fb = require('fibonacci');

import rateLimit from 'express-rate-limit';
import * as ApiController from '../controllers/apiController';

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: 'Limite de solicitações excedido. Tente novamente mais tarde'
})

const router = Router();

// Rota para verificar se o servidor está ativo
router.get('/ping', ApiController.ping);

// Rota para cadastrar um novo usuário
router.post('/cadastrarUsuario', limiter, ApiController.cadastrarUsuario);

// Rota para fazer login
router.post('/fazerLogin', limiter, ApiController.fazerLogin);

// Rota para listar os emails dos usuários
router.get('/listarEmails', limiter, ApiController.listarEmails);

// Rota para listar todos os usuários
router.get('/listarTodosUsuarios', limiter, ApiController.listarTodosUsuarios);

// Rota para deletar um usuário
router.delete('/deletarUsuario/:id', limiter, ApiController.deletarUsuario);

// Rota para atualizar um usuário
router.put('/atualizarUsuario/:id', limiter, ApiController.atualizarUsuario);

// Rota para pegar usuario por id
router.get('/pegarUsuarioPeloId/:id', limiter, ApiController.pegarUsuarioPeloId);

// Rota para listar notificacoes
router.get('/mostrarNotificacao', limiter, ApiController.mostrarNotificacao);

// Rota para cadastrar uma nova notificacao
router.patch('/atualizarNotificacao', limiter, ApiController.atualizarNotificacao);









export default router;

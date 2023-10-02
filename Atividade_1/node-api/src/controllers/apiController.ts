import { Request, Response } from 'express';
import { User } from '../models/User';
import nodemailer, { SendMailOptions } from 'nodemailer'
import JWT from "jsonwebtoken"
const bcrypt = require('bcrypt')

export const register = async (req: Request, res: Response) => {

    const { email, password, name, discipline } = req.body;

    if (!email || !password || !name || !discipline) {
        return res.status(400).json({ error: 'E-mail, senha, nome e/ou disciplina não fornecidos.' });
    }

    if (email && password && name && discipline) {

        try {
            let hasUser = await User.findOne({ where: { email } })
            if (!hasUser) {
                const saltRounds = 10
                const hashedPassword = await bcrypt.hash(password, saltRounds)

                let newUser = await User.create({
                    email,
                    password: hashedPassword,
                    name, 
                    discipline
                })

                res.status(201).json({ message: 'Usuário cadastrado com sucesso.', newUser })
            }

        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            res.status(500).json({ error: 'Erro interno ao processar o registro.' })
        }

    } else {
        res.status(400).json({ error: 'E-mail, senha, nome e/ou disciplina não fornecidos.' })
    }

}

export const login = async (req: Request, res: Response) => {
    if (req.body.email && req.body.password) {
        let email: string = req.body.email;
        let password: string = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha devem ser fornecidos.' });
        }

        let user = await User.findOne({
            where: { email, password }
        });

        if (user) {
            res.json({ status: true });
            return;
        }
    }

    res.json({ status: false });
}

export const listEmail = async (req: Request, res: Response) => {
    try {
        let users = await User.findAll();
        let list: string[] = [];

        for (let i in users) {
            list.push(users[i].email);
        }

        console.log('Lista de e-mails obtida com sucesso:', list);
        res.json({ list });

    } catch (error) {
        console.error('Erro ao listar e-mails:', error);
        res.status(500).json({ error: 'Erro interno ao listar e-mails.' })
    }
}


export const listAll = async (req: Request, res: Response) => {
    try {
        let users = await User.findAll();

        console.log('Lista de todos os usuários obtida com sucesso:', users);
        res.json({ users });

    } catch (error) {
        console.error('Erro ao listar todos os usuários:', error);
        res.status(500).json({ error: 'Erro interno ao listar os usuários.' })
    }
}


export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);

        if (user) {
            const deletedUserName = user.name; // Obtém o nome do usuário que será deletado

            user.destroy();
            await user.save(); // Salva as alterações do status



            res.status(200).json({ message: `Usuário ${deletedUserName} foi removido com sucesso.`, status: '200' });
        } else {
            res.status(404).json({ message: `Usuário com ID ${id} não encontrado.`, status: '404' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ocorreu um erro ao remover o usuário.', status: '500', error });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const values = req.body;

    // Verificar se algum valor é vazio ou nulo
    const isEmpty = Object.values(values).some((value) => value === null || value === '');

    if (isEmpty) {
        return res.status(400).json({ message: 'Os dados enviados estão incompletos.', status: '400' });
    }

    try {
        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.', status: '404' });
        }

        await User.update(values, { where: { id } });

        const updatedUser = await User.findOne({ where: { id } });

        return res.status(200).json({ message: 'Usuário atualizado com sucesso.', status: '200', updatedUser });
    } catch (error) {
        console.error(error);

        return res.status(500).json({ message: 'Erro ao atualizar usuário.', status: '500', error });
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.params

    try {
        const hasUser = await User.findOne({ where: { email } })
        if (!hasUser) {
            return res.status(404).json({ error: 'Usuário não encontrado.' })
        }

        const randomPassword = Math.random().toString(36).slice(-8)
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(randomPassword, saltRounds)

        hasUser.password = hashedPassword
        await hasUser.save()

        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "975e2fa382bcb3",
              pass: "0a8edc018bc3d9"
            }
        })

        const mailOptions = {
            from: 'seu-email@dominio.com',
            to: email,
            subject: 'Recuperação de senha',
            text: `Sua nova senha é: ${randomPassword}`,
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar email:', error);
                res.status(500).json({ error: 'Erro ao enviar email de recuperação de senha.' })
            } else {
                console.log('Email enviado:', info.response);
                res.status(200).json({ message: 'Nova senha enviada para o seu email.' })
            }
        })

    } catch (error) {
        console.error('Erro ao recuperar senha:', error);
        res.status(500).json({ error: 'Erro interno ao processar a recuperação de senha.' })
    }
}
import { db } from "../database/database.connection.js";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import { usuarioSchema } from "../schemas/usuarios.schemas.js";

export async function login(request, response) {
    const { email, senha } = request.body

    try {
        const usuario = await db.collection('usuarios').findOne({ email })
        if (!usuario) return response.status(404).send("Esse usuário não existe!")

        const senhaEstaCorreta = bcrypt.compareSync(senha, usuario.senha)
        if (!senhaEstaCorreta) return response.status(401).send("Senha incorreta")

        const token = uuid()
        await db.collection('sessoes').insertOne({ token, idUsuario: usuario._id })
        response.send(token)

    } catch (err) {
        response.status(500).send(err.message)
    }
}

export async function cadastro(request, response) {
    const { nome, email, senha } = request.body

    // Validação do body com o Joi
    const validation = usuarioSchema.validate(request.body, { abortEarly: false })
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)
        return response.status(422).send(errors)
    }

    // Criptografar a senha
    const hash = bcrypt.hashSync(senha, 10)

    try {
        // Verificar se o e-mail já foi cadastrado
        const usuario = await db.collection('usuarios').findOne({ email })
        if (usuario) return response.status(409).send("Esse e-mail já está cadastrado!")

        // Cadastrar o usuário com a senha criptografada
        await db.collection('usuarios').insertOne({ nome, email, senha: hash })
        response.sendStatus(201)
    } catch (err) {
        response.status(500).send(err.message)
    }
}

export async function usuarioLogado(request, response) {
    const { authorization } = request.headers
    // optional chaining       \/
    const token = authorization?.replace("Bearer ", "")

    if (!token) return response.status(401).send("Envie o token na requisição!")

    try {
        const sessao = await db.collection("sessoes").findOne({ token })
        if (!sessao) return response.status(401).send("Envie um token válido!")

        // sessao = {token, idUsuario}
        const usuario = await db.collection("usuarios").findOne({ _id: sessao.idUsuario })
        delete usuario.senha

        response.send(usuario)
    } catch (err) {
        response.status(500).send(err.message)
    }
}

export async function logout(request, response) {
    const { authorization } = request.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) return response.status(401).send("Envie o token na requisição!")

    try {
        const sessao = await db.collection("sessoes").findOne({ token })
        if (!sessao) return response.status(401).send("Envie um token válido!")

        await db.collection("sessoes").deleteOne({ token })
        response.sendStatus(200)
    } catch (err) {
        response.status(500).send(err.message)
    }
}
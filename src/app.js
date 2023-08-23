import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from "dotenv";
import Joi from 'joi';
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"

const app = express();      // criando a aplicaçãp servidora
app.use(cors());            // estou tornando publico o acesso a minha API
app.use(express.json());    // dizendo para o servidor que o padrão de dados das requisições é json
dotenv.config();            // permitir acesso ao arquivo .env (variáveis de ambiente)

// Conexão com o mongoDB
const mongoClient = new MongoClient(process.env.DATABASE_URL)   // Conexão localhost mongo

try {
    // Top level await => await que está no escopo global da sua aplicação, não precisa de async
    await mongoClient.connect()
    console.log("MongoDB conectado!")
} catch (err) {
    console.log(err.message)
}

const db = mongoClient.db()

const receitaSchema = Joi.object({
    titulo: Joi.string().required(),
    ingredientes: Joi.string().required().min(10),
    preparo: Joi.string().required(),
})

const usuarioSchema = Joi.object({
    nome: Joi.string().required(),
    email: Joi.string().email().required(),
    senha: Joi.string().min(6).required(),
})

// Rotas
app.get('/receitas', async (request, response) => {
    const { authorization } = request.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) return response.status(401).send("Envie o token na requisição!")

    try {
        const sessao = await db.collection("sessoes").findOne({ token })
        if (!sessao) return response.status(401).send("Envie um token válido!")

        const receitas = await db.collection("receitas").find().toArray()
        response.send(receitas)
    } catch (err) {
        response.status(500).send(err.message)
    }
});

app.get('/receitas/:id', async (request, response) => {
    const { id } = request.params;
    const { authorization } = request.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) return response.status(401).send("Envie o token na requisição!")

    try {
        const sessao = await db.collection("sessoes").findOne({ token })
        if (!sessao) return response.status(401).send("Envie um token válido!")

        const receita = await db.collection("receitas").findOne({ _id: new ObjectId(id) })
        response.send(receita)
    } catch (err) {
        response.status(500).send(err.message)
    }
});

app.post('/receitas', async (request, response) => {
    const { titulo } = request.body;
    const { authorization } = request.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) return response.status(401).send("Envie o token na requisição!")

    const validation = receitaSchema.validate(request.body, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map(det => det.message)
        return response.status(422).send(errors)
    }

    try {
        const sessao = await db.collection("sessoes").findOne({ token })
        if (!sessao) return response.status(401).send("Envie um token válido!")
        
        const receitaExiste = await db.collection("receitas").findOne({ titulo })
        if (receitaExiste) return response.status(409).send("Essa receita já existe!")

        await db.collection("receitas").insertOne(request.body)
        response.status(201).send(request.body)
    } catch (err) {
        response.status(500).send(err.message)
    }
});

app.delete('/receitas/:id', async (request, response) => {
    const { id } = request.params

    try {
        const resultado = await db.collection("receitas").deleteOne({ _id: new ObjectId(id) })

        if (resultado.deletedCount === 0) return response.status(404).send("O item que você tentou deletar não existe!")

        response.status(204).send("Item deletado com sucesso!")
    } catch (err) {
        response.status(500).send(err.message)
    }
})

app.put('/receitas/:id', async (request, response) => {
    const { id } = request.params
    const { titulo, ingredientes, preparo } = request.body

    const validation = receitaSchema.validate(request.body, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map(det => det.message)
        return response.status(422).send(errors)
    }

    try {
        const resultado = await db.collection("receitas").updateOne(
            { _id: new ObjectId(id) }, // filtro pra achar o item que vamos atualizar
            { $set: { titulo, ingredientes, preparo } }
            // objeto que determina o tipo da atualização (normalmente, vai ser um $set) 
            //  e os novos valores que serão aplicados
        )

        if (resultado.matchedCount === 0) return response.status(404).send("O item que você tentou editar não existe!")

        response.send(request.body)
    } catch (err) {
        response.status(500).send(err.message)
    }

})

// Cadastro
app.post('/sign-up', async (request, response) => {
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
})

// Login
app.post('/sign-in', async (request, response) => {
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
})

app.get('/usuario-logado', async (request, response) => {
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
})

app.delete("/sign-out", async (request, response) => {
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
})

app.listen(4000, () => console.log('App Servidor executando na porta 4000'));
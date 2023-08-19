import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from "dotenv";
import Joi from 'joi';

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

// Rotas
app.get('/receitas', async (request, response) => {
    try {
        const receitas = await db.collection("receitas").find().toArray()
        response.send(receitas)
    } catch (err) {
        response.status(500).send(err.message)
    }
});

app.get('/receitas/:id', async (request, response) => {
    const { id } = request.params;

    try {
        const receita = await db.collection("receitas").findOne({ _id: new ObjectId(id) })
        response.send(receita)
    } catch (err) {
        response.status(500).send(err.message)
    }
});

app.post('/receitas', async (request, response) => {
    const { titulo } = request.body;

    const validation = receitaSchema.validate(request.body, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map(det => det.message)
        return response.status(422).send(errors)
    }

    try {
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

app.listen(4000, () => console.log('App Servidor executando na porta 4000'));
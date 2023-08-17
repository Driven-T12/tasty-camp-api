import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from "dotenv";

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
    const { titulo, ingredientes, preparo } = request.body;

    if (!titulo || !ingredientes || !preparo) {
        return response.status(422).send("Todos os campos devem ser preenchidos!");
    }

    if (ingredientes.length <= 10) {
        return response.status(422).send("Informações de ingredientes deve contar mais de 10 letras");
    }

    const novaReceita = { titulo, ingredientes, preparo }

    try {
        const receitaExiste = await db.collection("receitas").findOne({ titulo })
        if (receitaExiste) return response.status(409).send("Essa receita já existe!")

        await db.collection("receitas").insertOne(novaReceita)
        response.status(201).send(novaReceita)
    } catch (err) {
        response.status(500).send(err.message)
    }
});

app.listen(4000, () => console.log('App Servidor executando na porta 4000'));
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

const app = express(); // criando a aplicaçãp servidora
app.use(cors()); // estou tornando publico o acesso a minha API
app.use(express.json()); // dizendo para o servidor que o padrão de dados das requisições é json

// Conexão com o mongoDB
const mongoClient = new MongoClient("mongodb://localhost:27017/tastycamp") // Conexão localhost mongo
let db

mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch(err => console.log(err.message))

// Rotas
app.get('/receitas', (request, response) => {
    db.collection("receitas").find().toArray()
        .then(receitas => response.send(receitas))
        .catch(erro => response.status(500).send(erro.message));
});

app.get('/receitas/:id', (request, response) => {
    const { id } = request.params;

    db.collection("receitas").findOne({ _id: new ObjectId(id) })
        .then(receita => response.send(receita))
        .catch((err) => response.status(500).send(err))
});

app.post('/receitas', (request, response) => {
    const { titulo, ingredientes, preparo } = request.body;

    if (!titulo || !ingredientes || !preparo) {
        response.status(422).send("Todos os campos devem ser preenchidos!");
        return;
    }

    if (ingredientes.length <= 10) {
        response.status(422).send("Informações de ingredientes deve contar mais de 10 letras");
        return;
    }

    const nova = {
        titulo: titulo,
        ingredientes: ingredientes,
        preparo: preparo
    }

    db.collection("receitas").insertOne(nova)
        .then(() => response.status(201).send(nova))
        .catch((err) => response.status(500).send(err))
});

app.listen(4000, () => console.log('App Servidor executando na porta 4000'));
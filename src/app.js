import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
import { deleteReceita, getReceitas, getReceitasPorId, postReceita, putReceita } from './controllers/receitas.controllers.js';
import { cadastro, login, logout, usuarioLogado } from './controllers/usuarios.controllers.js';

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

export const db = mongoClient.db()

// Rotas
app.get('/receitas', getReceitas)
app.get('/receitas/:id', getReceitasPorId)
app.post('/receitas', postReceita)
app.delete('/receitas/:id', deleteReceita)
app.put('/receitas/:id', putReceita)
app.post('/sign-up', cadastro)
app.post('/sign-in', login)
app.get('/usuario-logado', usuarioLogado)
app.delete("/sign-out", logout)

app.listen(4000, () => console.log('App Servidor executando na porta 4000'));
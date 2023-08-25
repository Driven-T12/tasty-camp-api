import { MongoClient } from 'mongodb';
import dotenv from "dotenv";

dotenv.config();  // permitir acesso ao arquivo .env (variáveis de ambiente)

const mongoClient = new MongoClient(process.env.DATABASE_URL)   // Conexão localhost mongo

try {
    // Top level await => await que está no escopo global da sua aplicação, não precisa de async
    await mongoClient.connect()
    console.log("MongoDB conectado!")
} catch (err) {
    console.log(err.message)
}

export const db = mongoClient.db()
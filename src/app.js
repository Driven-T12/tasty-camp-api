import express from 'express';
import cors from 'cors';
import router from './routes/index.routes.js';

const app = express();      // criando a aplicaçãp servidora
app.use(cors());            // estou tornando publico o acesso a minha API
app.use(express.json());    // dizendo para o servidor que o padrão de dados das requisições é json  
app.use(router)

app.listen(4000, () => console.log('App Servidor executando na porta 4000'));
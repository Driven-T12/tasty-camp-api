import express from 'express';
import cors from 'cors';

const app = express(); // criando a aplicaçãp servidora
app.use(cors()); // estou tornando publico o acesso a minha API
app.use(express.json()); // dizendo para o servidor que o padrão de dados das requisições é json

const receitas = [ // banco de dados simulado
    {
        id: 1,
        titulo: "Pão com Ovo",
        ingredientes: "Ovo e pão",
        preparo: "Frite o ovo e coloque no pão"
    },
    {
        id: 2,
        titulo: "Mingau de Whey",
        ingredientes: "Leite, Aveia e Whey",
        preparo: "Mistura tudo na panela fervendo",
    }
];

app.get('/receitas', (request, response) =>{
    response.send(receitas);
});

app.get('/receitas/:id', (request, response)=>{

    const { id } = request.params;
                                               
    const receita = receitas.find( rec => rec.id === Number(id));

    response.send(receita);

});

app.get("/", (req, res) => {
    // Manda como resposta o texto 'Hello World'
    res.send('Hello World');
});

app.post('/receitas', (request, response)=>{
    
    //const { titulo, ingredientes, preparo} = request.body;

    const novo = {
        id: receitas.length + 1,
        titulo: request.body.titulo,
        ingredientes: request.body.ingredientes,
        preparo: request.body.preparo
    }

    receitas.push(novo);

    response.send(novo);
});

app.listen(4000, () => console.log('App Servidor executando na porta 4000'));
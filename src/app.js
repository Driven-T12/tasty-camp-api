import express from 'express';
import cors from 'cors';

const app = express(); // criando a aplicaçãp servidora
app.use(cors()); // estou tornando publico o acesso a minha API

const receitas = [
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

app.listen(4000, () => console.log('App Servidor executando na porta 4000'));
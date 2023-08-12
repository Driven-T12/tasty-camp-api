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

    const { filtro } = request.query;

    console.log(request.headers.token);

    console.log(filtro);

    if ( filtro ){
        const receitasFiltradas = receitas.filter( receita => receita.ingredientes.includes(filtro) );
        return response.status(200).send(receitasFiltradas)
    }

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
    
    const { titulo, ingredientes, preparo } = request.body;

    if ( !titulo || !ingredientes || !preparo ){

        response.status( 422 ).send("Todos os campos devem ser preenchidos!");
        return;

    }

    if ( ingredientes.length <= 10 ){
            
        response.status( 422 ).send("Informações de ingredientes deve contar mais de 10 letras");
        return;

    }

    const result = receitas.filter( receita => receita.titulo === titulo );

    if(  !result ){
        
        response.status(409).send("Receita já cadastrada!"); 
        return;
    }

    const novo = {
        id: receitas.length + 1,
        titulo: titulo,
        ingredientes: ingredientes,
        preparo: preparo
    }

    receitas.push(novo);  

    response.status(201).send(novo);

});

app.listen(4000, () => console.log('App Servidor executando na porta 4000'));
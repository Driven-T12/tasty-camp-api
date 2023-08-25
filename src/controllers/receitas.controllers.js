import { db } from "../database/database.connection.js";
import { ObjectId } from 'mongodb';

export async function getReceitas(request, response) {
    try {
        const receitas = await db.collection("receitas").find().toArray()
        response.send(receitas)
    } catch (err) {
        response.status(500).send(err.message)
    }
}

export async function getReceitasPorId(request, response) {
    const { id } = request.params;

    try {
        const receita = await db.collection("receitas").findOne({ _id: new ObjectId(id) })
        response.send(receita)
    } catch (err) {
        response.status(500).send(err.message)
    }
}

export async function postReceita(request, response) {
    const { titulo } = request.body;

    try {
        const receitaExiste = await db.collection("receitas").findOne({ titulo })
        if (receitaExiste) return response.status(409).send("Essa receita já existe!")

        await db.collection("receitas").insertOne(request.body)
        response.status(201).send(request.body)
    } catch (err) {
        response.status(500).send(err.message)
    }
}

export async function deleteReceita(request, response) {
    const { id } = request.params

    try {
        const resultado = await db.collection("receitas").deleteOne({ _id: new ObjectId(id) })

        if (resultado.deletedCount === 0) return response.status(404).send("O item que você tentou deletar não existe!")

        response.status(204).send("Item deletado com sucesso!")
    } catch (err) {
        response.status(500).send(err.message)
    }
}

export async function putReceita(request, response) {
    const { id } = request.params
    const { titulo, ingredientes, preparo } = request.body

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

}
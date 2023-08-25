import { db } from "../database/database.connection.js"

export async function validateAuth(request, response, next) {
    const { authorization } = request.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) return response.status(401).send("Envie o token na requisição!!!!")

    try {
        const sessao = await db.collection("sessoes").findOne({ token })
        if (!sessao) return response.status(401).send("Envie um token válido!")

        next()
    } catch (err) {
        response.status(500).send(err.message)
    }
}
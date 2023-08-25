import { Router } from "express"
import { deleteReceita, getReceitas, getReceitasPorId, postReceita, putReceita } from '../controllers/receitas.controllers.js';

const routerReceitas = Router()

routerReceitas.get('/receitas', getReceitas)
routerReceitas.get('/receitas/:id', getReceitasPorId)
routerReceitas.post('/receitas', postReceita)
routerReceitas.delete('/receitas/:id', deleteReceita)
routerReceitas.put('/receitas/:id', putReceita)

export default routerReceitas
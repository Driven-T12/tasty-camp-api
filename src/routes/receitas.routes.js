import { Router } from "express"
import { deleteReceita, getReceitas, getReceitasPorId, postReceita, putReceita } from '../controllers/receitas.controllers.js';
import { validateSchema } from "../middlewares/validateSchema.js";
import { receitaSchema } from "../schemas/receitas.schemas.js";
import { validateAuth } from "../middlewares/validateAuth.js";

const routerReceitas = Router()

routerReceitas.get('/receitas', getReceitas)
routerReceitas.get('/receitas/:id', getReceitasPorId)
routerReceitas.post('/receitas', validateSchema(receitaSchema), postReceita)
routerReceitas.delete('/receitas/:id', deleteReceita)
routerReceitas.put('/receitas/:id', validateSchema(receitaSchema), putReceita)

export default routerReceitas
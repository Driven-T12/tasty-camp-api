import { Router } from "express"
import { cadastro, login, logout, usuarioLogado } from '../controllers/usuarios.controllers.js';
import { validateSchema } from "../middlewares/validateSchema.js";
import { usuarioSchema } from "../schemas/usuarios.schemas.js";
import { validateAuth } from "../middlewares/validateAuth.js";

const routerUsuarios = Router()

routerUsuarios.post('/sign-up', validateSchema(usuarioSchema), cadastro)
routerUsuarios.post('/sign-in', login)
routerUsuarios.get('/usuario-logado', validateAuth, usuarioLogado)
routerUsuarios.delete("/sign-out", validateAuth, logout)

export default routerUsuarios
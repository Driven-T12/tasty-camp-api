import { Router } from "express"
import { cadastro, login, logout, usuarioLogado } from '../controllers/usuarios.controllers.js';

const routerUsuarios = Router()

routerUsuarios.post('/sign-up', cadastro)
routerUsuarios.post('/sign-in', login)
routerUsuarios.get('/usuario-logado', usuarioLogado)
routerUsuarios.delete("/sign-out", logout)

export default routerUsuarios
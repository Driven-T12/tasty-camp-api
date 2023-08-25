import { Router } from "express";
import routerReceitas from "./receitas.routes.js";
import routerUsuarios from "./usuarios.routes.js";

const router = Router()

router.use(routerReceitas)
router.use(routerUsuarios)

export default router
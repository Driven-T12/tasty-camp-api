import { Router } from "express";
import routerReceitas from "./receitas.routes.js";
import routerUsuarios from "./usuarios.routes.js";
import { validateAuth } from "../middlewares/validateAuth.js";

const router = Router()

router.use(routerUsuarios)
router.use(validateAuth)
router.use(routerReceitas)


export default router
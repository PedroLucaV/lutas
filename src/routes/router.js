import { Router } from "express"
import competidores from "./competidores.js";
import contas from './contas.js'

const router = Router();

//
router.use('/competidor', competidores);
router.use('/contas', contas)

export default router;
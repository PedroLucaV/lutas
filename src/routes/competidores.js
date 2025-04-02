import { Router } from "express";
import { createComp, listComp } from "../controller/competidores.js";

const router = Router();

router.post('/criar', createComp);
router.get('/listar', listComp)

export default router;
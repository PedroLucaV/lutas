import { Router } from "express";
import { createComp, createKeys, generateBrackets, listComp } from "../controller/competidores.js";

const router = Router();

router.post('/criar', createComp);
router.get('/listar', listComp)
router.get('/key', createKeys);
router.get('/brackets', generateBrackets);

export default router;
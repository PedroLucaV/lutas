import { Router } from "express"
import competidores from "./competidores.js";

const router = Router();

//
router.use('/competidor', competidores);

export default router;
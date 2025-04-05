import { Router } from "express";
import { 
    createComp, 
    createKeys,
    genKey, 
    getComp, 
    listComp, 
    updateWeight, 
    generateTournament,  // 🆕 Gera o torneio
    updateWinner,  // 🆕 Atualiza vencedor e avança chaves
    getTournamentBrackets,
    getCompName,
    listAllFights
} from "../controller/competidores.js";

import upload from '../helper/upload.js'

const router = Router();

router.post('/criar', upload.fields([{ name: 'fotoCompetidor', maxCount: 1 },{ name: 'equipeImg', maxCount: 1 },{ name: 'fotoResp', maxCount: 1 }]) ,createComp);
router.get('/listar', listComp);
router.get('/listar/:id', getComp);
router.get('/listar/:name', getCompName);
router.put('/atualizarPeso/:id', updateWeight);
router.get('/key', createKeys);
router.get('/genKey', genKey);
router.post('/brackets', generateTournament);
router.get('/brackets',getTournamentBrackets);
router.post('/atualizarVencedor', updateWinner); // Atualiza vencedor e avança chaves
router.get('/listFight', listAllFights)

export default router;

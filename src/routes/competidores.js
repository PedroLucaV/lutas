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
    getCompName
} from "../controller/competidores.js";

const router = Router();

router.post('/criar', createComp);
router.get('/listar', listComp);
router.get('/listar/:id', getComp);
router.get('/listar/:name', getCompName);
router.put('/atualizarPeso/:id', updateWeight);
router.get('/key', createKeys);
router.get('/genKey', genKey);
router.post('/brackets', generateTournament);
router.get('/brackets',getTournamentBrackets);
router.post('/atualizarVencedor', updateWinner); // Atualiza vencedor e avança chaves

export default router;

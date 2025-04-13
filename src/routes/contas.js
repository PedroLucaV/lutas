import { Router } from "express";
const router = Router();
import bcrypt from 'bcrypt'

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Buscar competidor pelo email (ou outro identificador único)
    const competidor = await prisma.competidor.findUnique({
      where: { email }, // ou qualquer campo único que esteja usando
    });

    if (!competidor) {
      return res.status(401).json({ message: 'Competidor não encontrado' });
    }

    // Comparar senha fornecida com o hash no banco
    const senhaConfere = await bcrypt.compare(senha, competidor.senha);

    if (!senhaConfere) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    // Autenticação OK
    res.status(200).json({ message: 'Login realizado com sucesso', data: {id: competidor.id, nome: competidor.nome} });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: {
        message: err.message,
        stack: err.stack,
        name: err.name
      }
    });
  }
});

export default router;
import { Router } from "express";
const router = Router();
import bcrypt from 'bcrypt'

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

router.post('/criarContas', async (req, res) => {
  try {
    const { senha, ...resto } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);
    const user = { ...resto, senha: senhaHash }
    await prisma.contas.create({
      data: user
    })
    res.status(201).json({
      message: "Usuario criado",
      comp: user
    })
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
})

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Busca nas duas tabelas
    const user = await prisma.contas.findFirst({ where: { email } });
    const competidor = await prisma.inscritos.findFirst({ where: { email } });

    // Se encontrou um usuário na tabela 'contas'
    if (user) {
      const senhaConfere = await bcrypt.compare(senha, user.senha);

      if (!senhaConfere) {
        return res.status(401).json({ message: 'Senha incorreta' });
      }

      const type = user.role === 'ADMIN' ? 0 : 1;
      return res.status(200).json({
        message: 'Login realizado com sucesso',
        data: { id: user.id, nome: user.nome, type }
      });
    }

    // Se encontrou um competidor
    if (competidor) {
      const senhaConfere = await bcrypt.compare(senha, competidor.senha);

      if (!senhaConfere) {
        return res.status(401).json({ message: 'Senha incorreta' });
      }

      return res.status(200).json({
        message: 'Login realizado com sucesso',
        data: { id: competidor.id, nome: competidor.nome, type: 2 }
      });
    }

    // Nenhum usuário encontrado
    return res.status(401).json({ message: 'Usuario não encontrado' });

  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({
      message: 'Erro interno no servidor',
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      }
    });
  }
});


export default router;
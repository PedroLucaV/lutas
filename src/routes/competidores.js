import { Router } from 'express';
const router = Router();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos os competidores
router.get('/', async (req, res) => {
  try {
    const competidores = await prisma.competidor.findMany();
    res.json(competidores);
  } catch (err) {
    console.log(err);
    
    res.status(500).json({ error: 'Erro ao buscar competidores.' });
  }
});

// Criar novo competidor
router.post('/', async (req, res) => {
  try {
    const novo = await prisma.competidor.create({ data: req.body });
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar competidor.' });
  }
});

// Gerar chaveamentos e lutas por categoria
router.post('/gerar-lutas-auto', async (req, res) => {
  try {
    const competidores = await prisma.competidor.findMany();
    const categorias = {};

    // Agrupar por categoria
    for (const c of competidores) {
      const idadeGrupo = c.idade >= 18 ? 'Adulto' : 'Juvenil';
      const categoria = `${c.genero}_${idadeGrupo}_${c.graduacao}_${c.peso}`;
      if (!categorias[categoria]) categorias[categoria] = [];
      categorias[categoria].push(c);
    }

    // Criar lutas por categoria
    for (const [categoria, lista] of Object.entries(categorias)) {
      const competidoresEmbaralhados = lista.sort(() => 0.5 - Math.random());
      let fase = 1;
      let ativos = competidoresEmbaralhados;

      while (ativos.length > 1) {
        const proximos = [];

        for (let i = 0; i < ativos.length; i += 2) {
          const c1 = ativos[i];
          const c2 = ativos[i + 1];

          if (c2) {
            const luta = await prisma.luta.create({
              data: {
                categoria,
                fase,
                competidor1Id: c1.id,
                competidor2Id: c2.id
              }
            });
            // Adiciona vencedor temporário aleatório
            const vencedor = Math.random() > 0.5 ? c1 : c2;
            await prisma.luta.update({
              where: { id: luta.id },
              data: { vencedorId: vencedor.id }
            });
            proximos.push(vencedor);
          } else {
            proximos.push(c1); // Avança sozinho
          }
        }

        fase++;
        ativos = proximos;
      }
    }

    res.status(200).json({ message: 'Lutas geradas com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar lutas.' });
  }
});

router.post('/gerar-lutas', async (req, res) => {
  try {
    const competidores = await prisma.competidor.findMany();
    const categorias = {};

    // Agrupar por categoria
    for (const c of competidores) {
      const idadeGrupo = c.idade >= 18 ? 'Adulto' : 'Juvenil';
      const categoria = `${c.genero}_${idadeGrupo}_${c.graduacao}_${c.peso}`;
      if (!categorias[categoria]) categorias[categoria] = [];
      categorias[categoria].push(c);
    }

    // Criar lutas por categoria
    for (const [categoria, lista] of Object.entries(categorias)) {
      const competidoresEmbaralhados = lista.sort(() => 0.5 - Math.random());
      let fase = 1;
      let ativos = competidoresEmbaralhados;

      while (ativos.length > 1) {
        const proximos = [];

        for (let i = 0; i < ativos.length; i += 2) {
          const c1 = ativos[i];
          const c2 = ativos[i + 1];

          if (c2) {
            const luta = await prisma.luta.create({
              data: {
                categoria,
                fase,
                competidor1Id: c1.id,
                competidor2Id: c2.id
              }
            });
            // Não define vencedor
          } else {
            // Avança sozinho
            proximos.push(c1);
          }
        }

        fase++;
        ativos = proximos;
      }
    }

    res.status(200).json({ message: 'Lutas geradas com sucesso (sem definir vencedores).' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar lutas.' });
  }
});


// Contar medalhas por equipe
router.get('/medalhas', async (req, res) => {
  try {
    const lutas = await prisma.luta.findMany({
      include: {
        vencedor: true,
        competidor1: true,
        competidor2: true,
      },
    });

    const categorias = {};

    // Agrupar lutas por categoria
    for (const luta of lutas) {
      if (!categorias[luta.categoria]) categorias[luta.categoria] = [];
      categorias[luta.categoria].push(luta);
    }

    const medalhas = {};

    for (const categoria in categorias) {
      const lutasCategoria = categorias[categoria];

      const maxFase = Math.max(...lutasCategoria.map(l => l.fase));
      const final = lutasCategoria.find(l => l.fase === maxFase);

      if (!final || !final.vencedor) continue;

      const ouroEquipe = final.vencedor.equipe;
      const prataCompetidor = final.vencedorId === final.competidor1Id
        ? final.competidor2
        : final.competidor1;
      const prataEquipe = prataCompetidor ? prataCompetidor.equipe : null;

      // Ouro
      if (ouroEquipe) {
        if (!medalhas[ouroEquipe]) medalhas[ouroEquipe] = { ouro: 0, prata: 0, bronze: 0 };
        medalhas[ouroEquipe].ouro += 1;
      }

      // Prata
      if (prataEquipe) {
        if (!medalhas[prataEquipe]) medalhas[prataEquipe] = { ouro: 0, prata: 0, bronze: 0 };
        medalhas[prataEquipe].prata += 1;
      }

      // Bronze (semifinalistas perdedores)
      const semiFase = maxFase - 1;
      const semis = lutasCategoria.filter(l => l.fase === semiFase);

      for (const semi of semis) {
        const perdedor = semi.vencedorId === semi.competidor1Id
          ? semi.competidor2
          : semi.competidor1;

        if (perdedor && perdedor.equipe) {
          if (!medalhas[perdedor.equipe]) {
            medalhas[perdedor.equipe] = { ouro: 0, prata: 0, bronze: 0 };
          }
          medalhas[perdedor.equipe].bronze += 1;
        }
      }
    }

    res.json(medalhas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao contar medalhas.' });
  }
});

// Definir campeão de uma luta manualmente
router.post('/definir-campeao', async (req, res) => {
  try {
    const { lutaId, vencedorId } = req.body;

    const luta = await prisma.luta.update({
      where: { id: lutaId },
      data: { vencedorId },
    });

    res.json({ message: 'Vencedor definido com sucesso!', luta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao definir campeão.' });
  }
});

// Buscar competidores por nome (parcial)
router.get('/buscar', async (req, res) => {
  try {
    const { nome } = req.query;

    if (!nome) {
      return res.status(400).json({ error: 'Informe um nome para buscar.' });
    }

    const resultados = await prisma.competidor.findMany({
      where: {
        nome: {
          contains: nome,
          mode: 'insensitive', // ignora maiúsculas/minúsculas
        },
      },
    });

    res.json(resultados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar competidores.' });
  }
});

router.get('/lutas', async (req, res) => {
  try {
    const competidores = await prisma.luta.findMany();
    res.json(competidores);
  } catch (err) {
    console.log(err);
    
    res.status(500).json({ error: 'Erro ao buscar competidores.' });
  }
});

export default router;


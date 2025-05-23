import { Router } from 'express';
const router = Router();
import bcrypt from 'bcrypt'
import upload from '../helper/upload.js'
import puppeteer from 'puppeteer';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos os competidores
router.get('/listInscritos', async (req, res) => {
  try {
    const competidores = await prisma.inscritos.findMany();
    res.json(competidores);
  } catch (err) {
    console.log(err);
    
    res.status(500).json({ error: 'Erro ao buscar competidores.' });
  }
});

router.get('/comp/:id', async (req, res) => {
  const { id } = req.params
  const idN = Number(id)
  try {
    const competidores = await prisma.competidor.findUnique({ where: {id:idN} });
    res.json(competidores);
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: 'Erro ao buscar competidores.' });
  }
})

router.get('/chaves', async (req, res) => {
  try {
    const lutas = await prisma.luta.findMany({
      orderBy: [
        { categoria: 'asc' },
        { fase: 'asc' }
      ]
    });

    const chavesPorCategoria = {};

    for (const luta of lutas) {
      if (!chavesPorCategoria[luta.categoria]) {
        chavesPorCategoria[luta.categoria] = {};
      }

      if (!chavesPorCategoria[luta.categoria][luta.fase]) {
        chavesPorCategoria[luta.categoria][luta.fase] = [];
      }

      chavesPorCategoria[luta.categoria][luta.fase].push(luta);
    }

    res.json(chavesPorCategoria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar chaveamento.' });
  }
});

router.post('/inscrever', upload.fields([{ name: 'fotoCompetidor', maxCount: 1 },{ name: 'equipeImg', maxCount: 1 },{ name: 'fotoResp', maxCount: 1 }]),async (req, res) => {
  try {
    const { data_nascimento ,genero, peso, senha, ...resto } = req.body;
      const categoria = determinarCategoria(Number(peso), genero);
      const idade = calcularIdade(data_nascimento)
      const dataNascimento = new Date(data_nascimento);

      const senhaHash = await bcrypt.hash(senha, 10);

      const competidor = {
        ...resto,
        idade: Number(idade),
        peso: Number(peso),
        data_nascimento:dataNascimento,
        genero,
        senha: senhaHash,
        categoria,
        fotoCompetidor: req.files.fotoCompetidor[0].filename,
        equipeImg: req.files.equipeImg?.[0]?.filename || null,
        fotoResp: req.files.fotoResp?.[0]?.filename || null,
      };
      

      await prisma.inscritos.create({
        data: competidor
      })
      res.status(201).json({
        message: "Comp created",
        comp: competidor
      })
      
      
  } catch (err) {
    console.log(err);
    
    res.status(500).json({
  error: {
    message: err.message,
    stack: err.stack,
    name: err.name
  }
});

  }
});

function calcularIdade(dataNascimento) {
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();

  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade;
}

function determinarCategoria(peso, genero) {
  let categoriaPeso;
  if (genero === 'masculino') {
    if (peso <= 57.5) categoriaPeso = 'Galo';
    else if (peso <= 64) categoriaPeso = 'Pluma';
    else if (peso <= 70) categoriaPeso = 'Pena';
    else if (peso <= 76) categoriaPeso = 'Leve';
    else if (peso <= 82.3) categoriaPeso = 'Médio';
    else if (peso <= 88.3) categoriaPeso = 'Meio-Pesado';
    else if (peso <= 94.3) categoriaPeso = 'Pesado';
    else if (peso <= 100.5) categoriaPeso = 'Super-Pesado';
    else categoriaPeso = 'Pesadíssimo';
  } else if (genero === 'feminino') {
    if (peso <= 48.5) categoriaPeso = 'Galo';
    else if (peso <= 53.5) categoriaPeso = 'Pluma';
    else if (peso <= 58.5) categoriaPeso = 'Pena';
    else if (peso <= 64) categoriaPeso = 'Leve';
    else if (peso <= 69) categoriaPeso = 'Médio';
    else if (peso <= 74) categoriaPeso = 'Meio-Pesado';
        else if (peso <= 79.3) categoriaPeso = 'Pesado';
    else categoriaPeso = 'Super-Pesado';
  } else {
    throw new Error('Gênero inválido. Use "masculino" ou "feminino".');
  }

  return `${categoriaPeso}`;
}

router.get('/countInscritos', async (req, res) => {
  try {
    const numeroInscritos = await prisma.inscritos.count();

    res.status(200).json({data: numeroInscritos})
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao contar inscritos.' });
  }
})

// Define a área de uma luta específica
router.put('/luta/:lutaId/definir-area/:areaId', async (req, res) => {
  const { lutaId, areaId } = req.params;

  try {
    const luta = await prisma.luta.update({
      where: { id: parseInt(lutaId) },
      data: {
        areaId: parseInt(areaId),
        ativa: true,
      },
    });

    res.status(200).json({ message: 'Área atribuída e luta ativada com sucesso!', luta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar luta.' });
  }
});



// Gerar chaveamentos e lutas por categoria
router.post('/gerar-lutas', async (req, res) => {
  try {
    await prisma.luta.deleteMany();
    const competidores = await prisma.competidor.findMany();
    const categorias = {};

    for (const c of competidores) {
      if (!c.categoria) continue;
      const faixaEtaria = c.idade >= 18 ? 'Adulto' : 'Juvenil';
      const chave = `${c.categoria}_${faixaEtaria}_${c.genero}`;
      if (!categorias[chave]) categorias[chave] = [];
      categorias[chave].push(c);
    }

    const nomeFase = (faseIndex, totalFases) => {
      const fasePos = totalFases - faseIndex + 1;
      const nomes = {
        1: 'Final',
        2: 'Semifinal',
        3: 'Quartas',
        4: 'Oitavas',
      };
      return nomes[fasePos] || `Fase ${faseIndex}`;
    };

    for (const [categoriaChave, lista] of Object.entries(categorias)) {
      const competidoresEmbaralhados = lista.sort(() => 0.5 - Math.random());
      const totalCompetidores = competidoresEmbaralhados.length;

      const totalFases = Math.ceil(Math.log2(totalCompetidores));
      let ativos = competidoresEmbaralhados;
      const lutasCriadas = [];

      for (let fase = 1; fase <= totalFases; fase++) {
        const nome = nomeFase(fase, totalFases);
        const novaFase = [];
        const numLutas = Math.ceil(ativos.length / 2);

        for (let i = 0; i < numLutas; i++) {
          const c1 = ativos[i * 2];
          const c2 = ativos[i * 2 + 1];

          const luta = await prisma.luta.create({
            data: {
              categoria: categoriaChave,
              fase: nome,
              competidor1Id: fase === 1 && c1 ? c1.id : null,
              competidor2Id: fase === 1 && c2 ? c2.id : null,
            },
          });

          novaFase.push(luta);
        }

        ativos = new Array(novaFase.length).fill(null);
        lutasCriadas.push(...novaFase);
      }
    }

    res.status(200).json({ message: 'Chaves geradas com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar chaves.' });
  }
});


router.get('/gerar-pdf', async (req, res) => {
  try {
    const categoriasDB = await prisma.luta.findMany({
      distinct: ['categoria'],
      select: { categoria: true },
    });

    const categorias = await Promise.all(
      categoriasDB.map(async ({ categoria }) => {
        const lutas = await prisma.luta.findMany({
          where: { categoria },
          orderBy: [{ fase: 'asc' }, { id: 'asc' }],
          select: {
            competidor1: { select: { nome: true } },
            competidor2: { select: { nome: true } },
            vencedor: { select: { nome: true } },
            fase: true
          }
        });

        const fases = lutas.reduce((acc, luta) => {
          if (!acc[luta.fase]) acc[luta.fase] = [];
          acc[luta.fase].push({
            competidor1: luta.competidor1?.nome || '',
            competidor2: luta.competidor2?.nome || '',
            vencedor: luta.vencedor?.nome || ''
          });
          return acc;
        }, {});

        return { nome: categoria, fases };
      })
    );

    const gerarHTML = (categorias) => `
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: sans-serif;
            padding: 40px;
          }
          h1 {
            text-align: center;
            margin-bottom: 60px;
          }
          .categoria {
            page-break-after: always;
          }
          .bracket {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .fase {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-around;
            margin: 0 20px;
            height: 600px;
          }
          .matchup {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 15px 0;
            position: relative;
          }
          .matchup:before, .matchup:after {
            content: '';
            position: absolute;
            width: 20px;
            height: 1px;
            background: #000;
            left: 100%;
            top: 10px;
          }
          .matchup:last-child:after {
            display: none;
          }
          .competidor {
            width: 180px;
            height: 28px;
            padding: 4px 8px;
            margin: 4px 0;
            background: #f0f0f0;
            border: 1px solid #000;
            text-align: center;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        ${categorias.map(cat => {
      const faseNomesOrdenadas = Object.keys(cat.fases).sort((a, b) => parseInt(a) - parseInt(b));
      return `
          <div class="categoria">
            <h1>Chaveamento - Categoria: ${cat.nome}</h1>
            <div class="bracket">
              ${faseNomesOrdenadas.map(fase => `
                <div class="fase">
                  ${cat.fases[fase].map(luta => `
                    <div class="matchup">
                      <div class="competidor">${luta.competidor1}</div>
                      <div class="competidor">${luta.competidor2}</div>
                    </div>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          </div>
          `;
    }).join('')}
      </body>
      </html>
    `;

    const html = gerarHTML(categorias);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.emulateMediaType('screen');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=chaveamento.pdf');
    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao gerar o PDF');
  }
});

router.post('/enviarComp', async (req, res) => {
  try {
    const competidor = req.body;

    await prisma.competidor.create({ data: competidor })
    res.status(201).json({
      message: "Comp created",
      comp: competidor
    })


  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: {
        message: err.message,
        stack: err.stack,
        name: err.name
      }
})}});

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

    // Define o vencedor da luta
    const lutaAtual = await prisma.luta.update({
      where: { id: lutaId },
      data: { vencedorId },
    });

    // Ordem das fases do torneio
    const ordemFases = ['Oitavas', 'Quartas', 'Semifinal', 'Final'];

    const faseAtualIndex = ordemFases.indexOf(lutaAtual.fase);
    if (faseAtualIndex === -1) {
      return res.status(400).json({ error: 'Fase inválida na luta.' });
    }

    const proximaFase = ordemFases[faseAtualIndex + 1];
    if (!proximaFase) {
      // Final já foi, não tem próxima
      return res.json({ message: 'Vencedor definido! Fim da chave.', luta: lutaAtual });
    }

    // Busca todas as lutas da mesma categoria e próxima fase
    const lutasDaCategoria = await prisma.luta.findMany({
      where: { categoria: lutaAtual.categoria },
      orderBy: [{ fase: 'asc' }, { id: 'asc' }],
    });

    const indexLuta = lutasDaCategoria.findIndex((l) => l.id === lutaAtual.id);

    // Contar quantas lutas vieram antes da próxima fase para calcular a posição correta
    const qtdLutasFasesAnteriores = lutasDaCategoria.filter(l => ordemFases.indexOf(l.fase) < faseAtualIndex + 1).length;
    const indexProximaLuta = Math.floor(indexLuta / 2) + qtdLutasFasesAnteriores;

    const proximaLuta = lutasDaCategoria[indexProximaLuta];

    if (proximaLuta) {
      // Decide se entra como competidor1 ou competidor2
      if (!proximaLuta.competidor1Id) {
        await prisma.luta.update({
          where: { id: proximaLuta.id },
          data: { competidor1Id: vencedorId },
        });
      } else if (!proximaLuta.competidor2Id) {
        await prisma.luta.update({
          where: { id: proximaLuta.id },
          data: { competidor2Id: vencedorId },
        });
      }
    }

    res.json({ message: 'Vencedor definido com sucesso e avançado na chave!', luta: lutaAtual });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao definir campeão.' });
  }
});



// Buscar competidores por nome (parcial)
router.get('/buscar', async (req, res) => {
  try {
    const { nome, page = 1, limit = 10 } = req.query;

    if (!nome) {
      return res.status(400).json({ error: 'Informe um nome para buscar.' });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const resultados = await prisma.inscritos.findMany({
      where: {
        nome: {
          startsWith: nome
        },
      },
      skip,
      take: limitNumber,
    });

    const total = await prisma.competidor.count({
      where: {
        nome: {
          startsWith: nome
        },
      },
    });

    res.json({
      data: resultados,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
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

router.get('/lutas/:id', async (req, res) => {
  try {
    const luta = await prisma.luta.findUnique({ where: { id: Number(req.params.id)}});
    res.json(luta);
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: 'Erro ao buscar competidores.' });
  }
});

router.get('/inscrito/:id', async (req, res) => {
  try {
    let {id} = req.params;
    id = Number(id)
    const comp =  await prisma.inscritos.findFirst({where: {id}})
    res.json(comp)
  } catch (error) {
    console.error(error);
    
        res.status(500).json({ error: 'Erro ao buscar competidor.' });

  }
})

router.patch('/lutasr/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const luta = await prisma.luta.update({
      where: { id: Number(id) },
      data: {
        tempo: 300,
        pontos1: 0,
        pontos2: 0,
        vantagens1: 0,
        vantagens2: 0,
        faltas1: 0,
        faltas2: 0,
        montada1: 0,
        montada2: 0,
        passagem1: 0,
        passagem2: 0,
        raspagem1: 0,
        raspagem2: 0,
      }
    });

    res.json(luta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar luta' });
  }
})

router.patch('/lutas/:id', async (req, res) => {
  const { id } = req.params;
  const {
    tempo,
    pontos1,
    pontos2,
    vantagens1,
    vantagens2,
    faltas1,
    faltas2,
    montada1,
    montada2,
    passagem1,
    passagem2,
    raspagem1,
    raspagem2
  } = req.body;

  try {
    const luta = await prisma.luta.update({
      where: { id: Number(id) },
      data: {
        tempo,
        pontos1,
        pontos2,
        vantagens1,
        vantagens2,
        faltas1,
        faltas2,
        montada1,
        montada2,
        passagem1,
        passagem2,
        raspagem1,
        raspagem2,
      }
    });

    res.json(luta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar luta' });
  }
});

router.patch('/lutas/trocarComp/:id', async (req, res) => {
  const { id } = req.params;
  const { comp } = req.query;
  const { novoCompetidorId } = req.body;

  if (!['1', '2'].includes(comp)) {
    return res.status(400).json({ error: 'Parâmetro "comp" deve ser 1 ou 2' });
  }

  try {
    const lutaExistente = await prisma.luta.findUnique({
      where: { id: parseInt(id) }
    });

    if (!lutaExistente) {
      return res.status(404).json({ error: 'Luta não encontrada' });
    }

    const dadosAtualizados = comp === '1'
      ? { competidor1Id: novoCompetidorId }
      : { competidor2Id: novoCompetidorId };

    const lutaAtualizada = await prisma.luta.update({
      where: { id: parseInt(id) },
      data: dadosAtualizados
    });

    res.json({ message: 'Competidor atualizado com sucesso', luta: lutaAtualizada });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar competidor' });
  }
});



router.post('/areas', async (req, res) => {
  try {
    const { nome, especial } = req.body;
    const novaArea = await prisma.area.create({
      data: {
        nome,
        especial: especial || false,
      },
    });
    res.status(201).json(novaArea);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar área.' });
  }
});

router.get('/areas', async (req, res) => {
  try {
    const areas = await prisma.area.findMany();
    res.json(areas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar áreas.' });
  }
});

router.put('/areas/:id', async (req, res) => {
  try {
    const areaId = parseInt(req.params.id);
    const { nome, especial } = req.body;

    const areaAtualizada = await prisma.area.update({
      where: { id: areaId },
      data: {
        nome,
        especial,
      },
    });

    res.json(areaAtualizada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar área.' });
  }
});

router.put('/lutas/:id/atribuir-area', async (req, res) => {
  try {
    const lutaId = parseInt(req.params.id);
    const { areaId } = req.body;

    const lutaAtualizada = await prisma.luta.update({
      where: { id: lutaId },
      data: {
        areaId,
      },
      include: {
        area: true,
      },
    });

    res.json({ message: 'Luta atualizada com nova área!', luta: lutaAtualizada });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atribuir área à luta.' });
  }
});

router.get('/areas/:id', async (req, res) => {
  try {
    const areaId = parseInt(req.params.id);

    const area = await prisma.area.findUnique({
      where: { id: areaId },
      include: {
        lutas: {
          select: {
            id: true,
            categoria: true,
            fase: true,
            competidor1Id: true,
            competidor2Id: true,
            vencedorId: true,
          },
        },
      },
    });

    if (!area) {
      return res.status(404).json({ error: 'Área não encontrada.' });
    }

    res.json(area);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar área.' });
  }
});

export default router;
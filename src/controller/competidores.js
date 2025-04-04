import { PrismaClient } from '@prisma/client';
import PDFKit from 'pdfkit';
import fs from 'fs'
import bcrypt from 'bcrypt';
import path from 'path';

const prisma = new PrismaClient();

const calcularIdade = (dataNascimento) => {
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    const dia = hoje.getDate() - nascimento.getDate();

    if (mes < 0 || (mes === 0 && dia < 0)) {
        idade--;
    }

    return idade;
};

export const createComp = async (req, res) => {
    try {
        const { nome, telefone, email, endereco, senha, cidade, estado, nascimento, genero, professor, equipe, graduacao, responsavel, peso, cpf, fotoResp, equipeImg, fotoCompetidor } = req.body;

        const emailExistente = await prisma.competidor.findUnique({
            where: { email }
        });

        if (emailExistente) {
            return res.status(400).json({ message: "Email já cadastrado!" });
        }

        const saltRounds = 10; // Número de rounds do hash
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(senha, salt); // Gera o hash da senha

        const novoCompetidor = await prisma.competidor.create({
            data: {
                nome,
                telefone,
                email,
                endereco,
                cidade,
                estado,
                fotoCompetidor,
                equipeImg,
                idade: calcularIdade(nascimento),
                data_nascimento: new Date(nascimento), // Converte para Date
                genero,
                professor,
                peso,
                senha: hash,
                equipe,
                graduacao,
                responsavel: responsavel || null,
                cpf: cpf || null,
                fotoResp: fotoResp || null
            }
        });

        res.status(201).json({ message: "Competidor criado com sucesso!", competidor: novoCompetidor });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao criar competidor", error: error.message });
    }
};

export const listComp = async (req, res) => {
    try {
        const competidores = await prisma.competidor.findMany();
        res.status(200).json({message: "Competidores", data: competidores});
    } catch (error) {
                res.status(500).json({ message: "Erro ao listar competidores", error: error.message });
    }
}

export const getComp = async (req, res) => {
    const { id } = req.params;
    try {
        const competidor = await prisma.competidor.findUnique({
            where: { id: parseInt(id) },
            select: {nome: true, idade:true, graduacao: true, peso: true, professor: true, responsavel: true, fotoCompetidor: true, equipeImg: true}
        });
        if (!competidor) {
            return res.status(404).json({ message: "Competidor não encontrado!" });
        }
        res.status(200).json({ message: "Competidor encontrado!", data: competidor });
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar competidor", error: error.message });
    }
}

export const getCompName = async (req, res) => {
    const { name } = req.params;
    try {
        const competidor = await prisma.competidor.findFirst({
            where: { nome: name },
            select: {nome: true, idade:true, graduacao: true, peso: true, professor: true, responsavel: true, fotoCompetidor: true, equipeImg: true}
        });
        if (!competidor) {
            return res.status(404).json({ message: "Competidor não encontrado!" });
        }
        res.status(200).json({ message: "Competidor encontrado!", data: competidor });
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar competidor", error: error.message });
    }
}

export const updateWeight = async (req, res) => {
    const { id } = req.params;
    const { peso } = req.body;

    try {
        const competidor = await prisma.competidor.update({
            where: { id: parseInt(id) },
            data: { peso }
        });

        res.status(200).json({ message: "Peso atualizado com sucesso!", data: competidor });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar peso", error: error.message });
    }
}

export const genKey = async (req, res) => {
    try {
        // Buscar todos os competidores
        const competidores = await prisma.competidor.findMany();

        // Criar um objeto para armazenar os grupos
        const chaves = {};

        // Agrupar os competidores
        competidores.forEach((competidor) => {
            const categoria = `${competidor.peso}-${competidor.idade >= 18 ? 'Adulto' : 'Infanto-Juvenil'}-${competidor.graduacao}-${competidor.genero}`;

            if (!chaves[categoria]) {
                chaves[categoria] = [];
            }

            chaves[categoria].push(competidor);
        });

        // Criar as chaves de luta dentro de cada categoria
        const chavesFormatadas = Object.entries(chaves).map(([categoria, competidores]) => ({
            categoria,
            competidores
        }));

        res.status(200).json(chavesFormatadas);
    } catch (error) {
        res.status(500).json({ message: "Erro ao gerar chaves", error: error.message });
    }
};


const categoriasDePeso = [
  { min: 45, max: 60 },
  { min: 61, max: 70 },
  { min: 71, max: 80 },
  { min: 81, max: 90 },
  { min: 91, max: 100 },
];

export const createKeys = async (req, res) => {
    try {
    const atletas = await prisma.competidor.findMany();
    
    // Inicializa o objeto de chaveamentos com grupos de idade e gênero
    const chaveamentos = {
        "Infanto-Juvenil": { "Masculino": {}, "Feminino": {} },
        "Adulto": { "Masculino": {}, "Feminino": {} }
    };
    
    // Agrupa os atletas por grupo de idade, gênero, categoria de peso e graduação
    atletas.forEach(atleta => {
        const { graduacao, peso, nome, idade, genero } = atleta;
        const categoriaPeso = categoriasDePeso.find(cat => peso >= cat.min && peso <= cat.max);
        if (!categoriaPeso) return;
        
        const idadeGrupo = idade < 18 ? "Infanto-Juvenil" : "Adulto";
        const chaveNome = `Faixa ${graduacao} (${categoriaPeso.min} - ${categoriaPeso.max} kg)`;
        
        if (!chaveamentos[idadeGrupo][genero][chaveNome]) {
            chaveamentos[idadeGrupo][genero][chaveNome] = [];
        }
        
        chaveamentos[idadeGrupo][genero][chaveNome].push({ nome, peso, graduacao, idade, genero });
    });
    
    // Para cada grupo de idade e gênero, formar as lutas (pares) e coletar sobras
    const sobras = { "Infanto-Juvenil": { "Masculino": [], "Feminino": [] }, "Adulto": { "Masculino": [], "Feminino": [] } };
    
    Object.keys(chaveamentos).forEach(idadeGrupo => {
        Object.keys(chaveamentos[idadeGrupo]).forEach(genero => {
            Object.keys(chaveamentos[idadeGrupo][genero]).forEach(categoria => {
                const competidores = chaveamentos[idadeGrupo][genero][categoria];
                competidores.sort(() => Math.random() - 0.5);
                
                const lutas = [];
                while (competidores.length > 1) {
                    const atleta1 = competidores.pop();
                    const atleta2 = competidores.pop();
                    lutas.push([atleta1, atleta2]);
                }
                if (competidores.length === 1) {
                    sobras[idadeGrupo][genero].push(competidores.pop());
                }
                chaveamentos[idadeGrupo][genero][categoria] = lutas;
            });
        });
    });
    
    // Realoca as sobras de cada grupo, buscando a melhor correspondência de peso
    ["Infanto-Juvenil", "Adulto"].forEach(idadeGrupo => {
        ["Masculino", "Feminino"].forEach(genero => {
            sobras[idadeGrupo][genero].sort((a, b) => a.peso - b.peso);
            while (sobras[idadeGrupo][genero].length > 1) {
                const atleta1 = sobras[idadeGrupo][genero].shift();
                let melhorMatchIndex = -1;
                let menorDiferenca = Infinity;
                
                sobras[idadeGrupo][genero].forEach((atleta2, index) => {
                    const diferenca = Math.abs(atleta1.peso - atleta2.peso);
                    if (diferenca < menorDiferenca) {
                        menorDiferenca = diferenca;
                        melhorMatchIndex = index;
                    }
                });
                
                if (melhorMatchIndex !== -1) {
                    const atleta2 = sobras[idadeGrupo][genero].splice(melhorMatchIndex, 1)[0];
                    const categoriaPeso = categoriasDePeso.find(cat => atleta1.peso >= cat.min && atleta1.peso <= cat.max) ||
                                          categoriasDePeso.find(cat => atleta2.peso >= cat.min && atleta2.peso <= cat.max);
                    const chaveNome = `Faixa ${atleta1.graduacao} (${categoriaPeso.min} - ${categoriaPeso.max} kg)`;
                    
                    if (!chaveamentos[idadeGrupo][genero][chaveNome]) {
                        chaveamentos[idadeGrupo][genero][chaveNome] = [];
                    }
                    chaveamentos[idadeGrupo][genero][chaveNome].push([atleta1, atleta2]);
                }
            }
    
            if (sobras[idadeGrupo][genero].length === 1) {
                const atleta = sobras[idadeGrupo][genero].pop();
                const categoriaPeso = categoriasDePeso.find(cat => atleta.peso >= cat.min && atleta.peso <= cat.max);
                const chaveNome = `Faixa ${atleta.graduacao} (${categoriaPeso.min} - ${categoriaPeso.max} kg)`;
                if (!chaveamentos[idadeGrupo][genero][chaveNome]) {
                    chaveamentos[idadeGrupo][genero][chaveNome] = [];
                }
                chaveamentos[idadeGrupo][genero][chaveNome].push([{ ...atleta, bye: true }]);
            }
        });
    });

    
    // Geração do PDF
    const doc = new PDFKit({ autoFirstPage: false });
    const filePath = path.join(process.cwd(), 'bracket.pdf');
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    
    ["Infanto-Juvenil", "Adulto"].forEach(idadeGrupo => {
        ["Masculino", "Feminino"].forEach(genero => {
            Object.keys(chaveamentos[idadeGrupo][genero]).forEach(categoria => {
                if (chaveamentos[idadeGrupo][genero][categoria].length > 0) {
                    doc.addPage();
                    doc.fontSize(18).text(`Chaveamento de Torneio - ${idadeGrupo} - ${genero}`, { align: 'center' }).moveDown();
                    doc.fontSize(14).text(categoria).moveDown();
                    chaveamentos[idadeGrupo][genero][categoria].forEach((luta, index) => {
                        if (Array.isArray(luta)) {
                            const atleta1Nome = luta[0]?.nome || 'Desconhecido';
                            const atleta2Nome = luta[1]?.nome || 'Desconhecido';
                            doc.text(`Luta ${index + 1}: ${atleta1Nome} vs ${atleta2Nome}`);
                        } else if (luta?.nome) {
                            doc.text(`Luta ${index + 1}: ${luta.nome} (Bye)`);
                        } else {
                            doc.text(`Luta ${index + 1}: Dados inválidos`);
                        }
                        doc.moveDown();
                    });
                }
            });
        });
    });
    
    doc.end();
    
    stream.on('finish', () => {
        res.download(filePath, 'bracket.pdf', err => {
            if (err) {
                res.status(500).json({ error: 'Erro ao enviar o PDF' });
            }
        });
    });
} catch (error) {
    res.status(500).json({ error: error.message });
}



}


export const generateTournament = async (req, res) => {
  try {
    const atletas = await prisma.competidor.findMany();
    const chaveamentos = new Map();

    const categoriasDePeso = [
      { min: 45, max: 60 },
      { min: 61, max: 70 },
      { min: 71, max: 80 },
      { min: 81, max: 90 },
      { min: 91, max: 100 },
    ];

    const getFaixaEtaria = (idade) => (idade < 18 ? "Infanto-Juvenil" : "Adulto");

    const getFaixaDePeso = (peso) => {
      const faixa = categoriasDePeso.find(({ min, max }) => peso >= min && peso <= max);
      return faixa ? `${faixa.min}-${faixa.max}kg` : "Acima de 100kg";
    };

    const getCategoria = ({ idade, genero, graduacao, peso }) => 
      `${getFaixaEtaria(idade)} - ${genero} - Faixa ${graduacao} - Peso ${getFaixaDePeso(peso)}`;

    atletas.forEach((atleta) => {
      const categoria = getCategoria(atleta);
      if (!chaveamentos.has(categoria)) chaveamentos.set(categoria, []);
      chaveamentos.get(categoria).push(atleta);
    });

    const lutasGeradas = [];

    for (const [categoria, competidores] of chaveamentos.entries()) {
      competidores.sort(() => Math.random() - 0.5);

      const total = competidores.length;
      const totalFases = Math.ceil(Math.log2(total));
      const tamanhoChave = Math.pow(2, totalFases);
      const byes = tamanhoChave - total;

      for (let i = 0; i < byes; i++) competidores.push(null);

      let fase = 1;
      let lutadoresRestantes = [];

      // Criando as lutas da primeira fase
      const partidasFase = await Promise.all(
        competidores.map(async (comp, i) => {
          if (i % 2 === 0) {
            const luta = await prisma.luta.create({
              data: {
                categoria,
                fase,
                competidor1Id: comp?.id || null,
                competidor2Id: competidores[i + 1]?.id || null,
              },
            });
            return luta;
          }
          return null;
        })
      );

      lutadoresRestantes = partidasFase.filter(Boolean).map(({ id }) => id);
      lutasGeradas.push(...partidasFase);

      // Criando as fases seguintes
      while (lutadoresRestantes.length > 1) {
        fase++;
        lutadoresRestantes = await Promise.all(
          lutadoresRestantes.map(async (_, i) => {
            if (i % 2 === 0) {
              const luta = await prisma.luta.create({
                data: { categoria, fase, competidor1Id: null, competidor2Id: null },
              });
              return luta.id;
            }
            return null;
          })
        ).then((lutas) => lutas.filter(Boolean));
      }
    }

    res.json({ message: "Torneio gerado com sucesso", lutas: lutasGeradas });
  } catch (error) {
    res.status(500).json({ message: "Erro ao gerar torneio", error: error.message });
  }
};

export const updateWinner = async (req, res) => {
  try {
    const { lutaId, vencedorId } = req.body;

    const luta = await prisma.luta.findUnique({ where: { id: lutaId } });
    if (!luta) return res.status(404).json({ message: "Luta não encontrada" });

    await prisma.luta.update({
      where: { id: lutaId },
      data: { vencedorId },
    });

    const proximaLuta = await prisma.luta.findFirst({
  where: {
    fase: luta.fase + 1,
    categoria: luta.categoria,
    OR: [
      { competidor1Id: null },
      { competidor2Id: null },
    ],
  },
});


    if (proximaLuta) {
      await prisma.luta.update({
        where: { id: proximaLuta.id },
        data: proximaLuta.competidor1Id ? { competidor2Id: vencedorId } : { competidor1Id: vencedorId },
      });
    }

    res.json({ message: "Vencedor atualizado e avançado para a próxima fase!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar vencedor", error: error.message });
  }
};

export const getTournamentBrackets = async (req, res) => {
  try {
    const lutas = await prisma.luta.findMany({
      include: {
        competidor1: true,
        competidor2: true,
      },
      orderBy: [{ fase: "asc" }, { categoria: "asc" }],
    });

    const fases = new Map();

    lutas.forEach((luta) => {
      if (!fases.has(luta.fase)) {
        fases.set(luta.fase, []);
      }

      fases.get(luta.fase).push({
        categoria: luta.categoria,
        competidor1: luta.competidor1
          ? `${luta.competidor1.nome} - ${luta.competidor1.equipe}`
          : "TBD",
        competidor2: luta.competidor2
          ? `${luta.competidor2.nome} - ${luta.competidor2.equipe}`
          : "TBD",
        area: luta.id, // Pode ser melhor definido se houver um campo "área"
      });
    });

    const response = Array.from(fases.entries()).map(([fase, lutas]) => ({
      fase,
      lutas,
    }));

    res.json({ chaves: response });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar chaves", error: error.message });
  }
};

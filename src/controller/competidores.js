import { PrismaClient } from '@prisma/client';
import PDFKit from 'pdfkit';
import fs from 'fs'
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
        const { nome, telefone, email, endereco, cidade, estado, nascimento, genero, professor, equipe, graduacao, responsavel, peso } = req.body;

        const novoCompetidor = await prisma.competidor.create({
            data: {
                nome,
                telefone,
                email,
                endereco,
                cidade,
                estado,
                idade: calcularIdade(nascimento),
                data_nascimento: new Date(nascimento), // Converte para Date
                genero,
                professor,
                peso,
                equipe,
                graduacao,
                responsavel: responsavel || null
            }
        });

        res.status(201).json({ message: "Competidor criado com sucesso!", competidor: novoCompetidor });
    } catch (error) {
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


export const generateBrackets = async (req, res) => {
    try {
    const atletas = await prisma.competidor.findMany();
    const chaveamentos = new Map();
    
    atletas.forEach(atleta => {
        const { graduacao, peso, nome, idade, genero, equipe } = atleta;
        const categoriaPeso = categoriasDePeso.find(cat => peso >= cat.min && peso <= cat.max);
        if (!categoriaPeso) return;
        
        const idadeGrupo = idade < 18 ? "Infanto-Juvenil" : "Adulto";
        const chaveNome = `${idadeGrupo} - ${genero} - Faixa ${graduacao} - Peso ${categoriaPeso.min}-${categoriaPeso.max}kg`;
        
        if (!chaveamentos.has(chaveNome)) {
            chaveamentos.set(chaveNome, []);
        }
        
        chaveamentos.get(chaveNome).push({ nome, faixa: graduacao, equipe, idade, peso });
    });
    
    const lutas = [];
    const sobras = [];
    
    chaveamentos.forEach((competidores, categoria) => {
        competidores.sort(() => Math.random() - 0.5);
        
        while (competidores.length > 1) {
            const competidor1 = competidores.pop();
            const competidor2 = competidores.pop();
            lutas.push({ categoria, competidor1, competidor2 });
        }
        
        if (competidores.length === 1) {
            sobras.push({ categoria, competidor: competidores[0] });
        }
    });
    
    sobras.forEach(({ categoria, competidor }) => {
        const [grupo, genero, faixa, _] = categoria.split(" - ");
        
        const possivelMatch = sobras.find(sobra => 
            sobra.categoria.startsWith(`${grupo} - ${genero} - ${faixa}`) && sobra.competidor !== competidor
        );
        
        if (possivelMatch) {
            lutas.push({ categoria, competidor1: competidor, competidor2: possivelMatch.competidor });
            sobras.splice(sobras.indexOf(possivelMatch), 1);
        } else {
            lutas.push({ categoria, competidor1: competidor, competidor2: { nome: "Aguardando Oponente" } });
        }
    });
    
    res.json({ lutas });
} catch (error) {
    res.status(500).json({ error: error.message });
}


};
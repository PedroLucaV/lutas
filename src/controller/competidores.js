import { PrismaClient } from '@prisma/client';

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
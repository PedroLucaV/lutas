window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lutaId = parseInt(urlParams.get('id'));
    const apiCompetidorUrl = "http://localhost:8080/api/competidor/comp";
    async function getNomeCompetidor(id) {
        if (!id) return 'A definir';
        try {
            const response = await fetch(`${apiCompetidorUrl}/${id}`);
            const data = await response.json();
            return data.nome || 'A definir';
        } catch (err) {
            return 'A definir';
        }
    }

    if (!lutaId) {
        alert('ID da luta não especificado na URL.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/competidor/lutas/${lutaId}`);
        const luta = await response.json();

        const competidor1Nome = await getNomeCompetidor(luta.competidor1Id) || 'Competidor 1';
        const competidor2Nome = await getNomeCompetidor(luta.competidor2Id) || 'Competidor 2';

        document.getElementById('nomeComp1').textContent = competidor1Nome;
        document.getElementById('nomeComp2').textContent = competidor2Nome;

        let pontos1 = 0, vantagens1 = 0, faltas1 = 0;
        let pontos2 = 0, vantagens2 = 0, faltas2 = 0;

        function atualizarPlacar() {
            document.getElementById('pontos1').textContent = pontos1;
            document.getElementById('vantagens1').textContent = vantagens1;
            document.getElementById('faltas1').textContent = faltas1;

            document.getElementById('pontos2').textContent = pontos2;
            document.getElementById('vantagens2').textContent = vantagens2;
            document.getElementById('faltas2').textContent = faltas2;
        }

        window.addPonto = (comp, qtd) => {
            if (comp === 1) pontos1 += qtd;
            else pontos2 += qtd;
            atualizarPlacar();
        }

        window.addVantagem = (comp) => {
            if (comp === 1) {
                vantagens1++;
                if (vantagens1 >= 3) {
                    vantagens1 -= 3;
                    pontos1++;
                }
            } else {
                vantagens2++;
                if (vantagens2 >= 3) {
                    vantagens2 -= 3;
                    pontos2++;
                }
            }
            atualizarPlacar();
        }

        window.addFalta = (comp) => {
            if (comp === 1) {
                faltas1++;
                window.addVantagem(2);
            } else {
                faltas2++;
                window.addVantagem(1);
            }
            atualizarPlacar();
        }

        window.trocarCompetidor = (comp) => {
            alert(`Função de troca do competidor ${comp} ainda não implementada.`);
        }

        window.definirGanhador = async () => {
            const vencedor = pontos1 > pontos2 ? luta.competidor1Id : luta.competidor2Id;
            if (!vencedor) {
                alert('Vencedor não identificado.');
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/lutas/definir-campeao', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lutaId, vencedorId: vencedor })
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Erro ao definir vencedor.');
                alert('Vencedor definido com sucesso!');
            } catch (err) {
                console.error(err);
                alert('Erro ao definir vencedor.');
            }
        }

        atualizarPlacar();
    } catch (err) {
        console.error(err);
        alert('Erro ao carregar dados da luta.');
    }
});
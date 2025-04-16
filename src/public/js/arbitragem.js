window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lutaId = parseInt(urlParams.get('id'));
    const apiCompetidorUrl = "http://localhost:8080/api/competidor/comp";
    async function getNomeCompetidor(id) {
        if (!id) return 'A definir';
        try {
            const response = await fetch(`${apiCompetidorUrl}/${id}`);
            const data = await response.json();
            return data || 'A definir';
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
        const competidor1 = await getNomeCompetidor(luta.competidor1Id) || 'Competidor 1';
        const competidor2 = await getNomeCompetidor(luta.competidor2Id) || 'Competidor 2';
        console.log(competidor1.equipeImg);
        
        document.getElementById('atleta1Nome').textContent = competidor1.nome;
        document.getElementById('atleta2Nome').textContent = competidor2.nome;
        document.getElementById('acad1').src = `../../images/campeonato/users/competidor/${competidor1.equipeImg}`;
        document.getElementById('acad2').src = `../../images/campeonato/users/competidor/${competidor2.equipeImg}`;

        let pontos1 = 0, vantagens1 = 0, faltas1 = 0;
        let pontos2 = 0, vantagens2 = 0, faltas2 = 0;

        function atualizarPlacar() {
            const atletas = document.querySelectorAll('.atleta');

            // Pontos
            atletas[0].querySelector('.ponto p').textContent = pontos1.toString().padStart(2, '0');
            atletas[1].querySelector('.ponto p').textContent = pontos2.toString().padStart(2, '0');

            // Vantagens
            atletas[0].querySelector('.boxF.vantagem').textContent = vantagens1;
            atletas[1].querySelector('.boxF.vantagem').textContent = vantagens2;

            // Faltas
            atletas[0].querySelector('.boxF.falta').textContent = faltas1;
            atletas[1].querySelector('.boxF.falta').textContent = faltas2;
        }

        function addVantagem(comp) {
            if (comp === 1) {
                vantagens1++;
                if (vantagens1 >= 4) {
                    vantagens1 = 0;
                    pontos1++;
                }
                faltas2++;
            } else {
                vantagens2++;
                if (vantagens2 >= 4) {
                    vantagens2 = 0;
                    pontos2++;
                }
                faltas1++;
            }
            atualizarPlacar();
        }

        function addFalta(comp) {
            if (comp === 1) {
                faltas1++;
                vantagens2++;
                if (vantagens2 >= 4) {
                    vantagens2 = 0;
                    pontos2++;
                }
            } else {
                faltas2++;
                vantagens1++;
                if (vantagens1 >= 4) {
                    vantagens1 = 0;
                    pontos1++;
                }
            }
            atualizarPlacar();
        }

        // ⏳ Ao carregar a página
        document.addEventListener("DOMContentLoaded", () => {
            atualizarPlacar();

            const atletas = document.querySelectorAll('.atleta');

            // Atleta 1
            atletas[0].querySelector('.boxF.vantagem').addEventListener('click', () => addVantagem(1));
            atletas[0].querySelector('.boxF.falta').addEventListener('click', () => addFalta(1));

            // Atleta 2
            atletas[1].querySelector('.boxF.vantagem').addEventListener('click', () => addVantagem(2));
            atletas[1].querySelector('.boxF.falta').addEventListener('click', () => addFalta(2));
        });


        // window.trocarCompetidor = (comp) => {
        //     alert(`Função de troca do competidor ${comp} ainda não implementada.`);
        // }

        // window.definirGanhador = async () => {
        //     const vencedor = pontos1 > pontos2 ? luta.competidor1Id : luta.competidor2Id;
        //     if (!vencedor) {
        //         alert('Vencedor não identificado.');
        //         return;
        //     }

        //     try {
        //         const response = await fetch('http://localhost:8080/api/lutas/definir-campeao', {
        //             method: 'POST',
        //             headers: { 'Content-Type': 'application/json' },
        //             body: JSON.stringify({ lutaId, vencedorId: vencedor })
        //         });

        //         const result = await response.json();
        //         if (!response.ok) throw new Error(result.error || 'Erro ao definir vencedor.');
        //         alert('Vencedor definido com sucesso!');
        //     } catch (err) {
        //         console.error(err);
        //         alert('Erro ao definir vencedor.');
        //     }
        // }

        atualizarPlacar();
    } catch (err) {
        console.error(err);
        alert('Erro ao carregar dados da luta.');
    }
});
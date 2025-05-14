window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lutaId = parseInt(urlParams.get('id'));
    if (!lutaId) return alert('ID da luta não especificado na URL.');

    const apiBase = "http://localhost:8080/api";
    const apiCompetidorUrl = `${apiBase}/competidor/comp`;
    const apiLutaUrl = `${apiBase}/competidor/lutas/${lutaId}`;

    const kimono1 = document.getElementById('kimono1');
    const kimono2 = document.getElementById('kimono2');
    const faixa1 = document.getElementById('faixa1');
    const faixa2 = document.getElementById('faixa2');
    const mudaTempo = document.getElementById('mudaTempo');
    const checkbox1 = document.getElementById("faixaVA1");
    const checkbox2 = document.getElementById("faixaVA2");
    const resetFight = document.getElementById('resetFight');
    const contador = document.getElementById("contador");

    let tempoRestante = 5 * 60; // Tempo padrão de 5 minutos
    let tempo = 5;

    let pontos1 = 0, pontos2 = 0;
    let vantagens1 = 0, vantagens2 = 0;
    let faltas1 = 0, faltas2 = 0;
    let montada1 = 0, montada2 = 0;
    let passagem1 = 0, passagem2 = 0;
    let raspagem1 = 0, raspagem2 = 0;

    async function getNomeCompetidor(id) {
        if (!id) return 'A definir';
        try {
            const res = await fetch(`${apiCompetidorUrl}/${id}`);
            const data = await res.json();
            return data || 'A definir';
        } catch (err) {
            return 'A definir';
        }
    }

    async function salvarEstadoLuta() {
        try {
            await fetch(apiLutaUrl, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pontos1, pontos2, vantagens1, vantagens2, faltas1, faltas2, montada1, montada2, passagem1, passagem2, raspagem1, raspagem2, tempo: tempoRestante })
            });
            console.log('Estado da luta salvo');
            atualizarPlacar();
        } catch (err) {
            console.error("Erro ao salvar estado da luta:", err);
        }
    }

    function atualizarPlacar() {
        const atletas = document.querySelectorAll('.atleta');
        atletas[0].querySelector('.ponto p').textContent = pontos1.toString().padStart(2, '0');
        atletas[1].querySelector('.ponto p').textContent = pontos2.toString().padStart(2, '0');

        atletas[0].querySelector('.boxF.vantagem').textContent = vantagens1;
        atletas[1].querySelector('.boxF.vantagem').textContent = vantagens2;

        atletas[0].querySelector('.boxF.falta').textContent = faltas1;
        atletas[1].querySelector('.boxF.falta').textContent = faltas2;

        const boxP1 = atletas[0].querySelectorAll('.pontoBox .boxP p');
        const boxP2 = atletas[1].querySelectorAll('.pontoBox .boxP p');

        boxP1[0].textContent = montada1.toString().padStart(2, '0');
        boxP1[1].textContent = passagem1.toString().padStart(2, '0');
        boxP1[2].textContent = raspagem1.toString().padStart(2, '0');

        boxP2[0].textContent = montada2.toString().padStart(2, '0');
        boxP2[1].textContent = passagem2.toString().padStart(2, '0');
        boxP2[2].textContent = raspagem2.toString().padStart(2, '0');
    }

    async function buscarLutaAtualizada() {
        try {
            const res = await fetch(apiLutaUrl);
            const luta = await res.json();
            const c1 = await getNomeCompetidor(luta.competidor1Id);
            const c2 = await getNomeCompetidor(luta.competidor2Id);

            document.getElementById('atleta1Nome').textContent = c1.nome;
            document.getElementById('atleta2Nome').textContent = c2.nome;

            kimono1.src = `../assets/kimono-faixa/Kimono ${c1.kimono}.png`;
            kimono2.src = `../assets/kimono-faixa/Kimono ${c2.kimono}.png`;
            faixa1.src = `../assets/kimono-faixa/Faixa-${c1.graduacao}.png`;
            faixa2.src = `../assets/kimono-faixa/Faixa-${c2.graduacao}.png`;

            const mudarFaixa = () => {
                if (checkbox1.checked) {
                    checkbox2.checked = false;
                    faixa1.src = `../assets/kimono-faixa/Faixa-verde-e-amarela.png`;
                    faixa2.src = `../assets/kimono-faixa/Faixa-${c2.graduacao}.png`;
                } else if (checkbox2.checked) {
                    checkbox1.checked = false;
                    faixa2.src = `../assets/kimono-faixa/Faixa-verde-e-amarela.png`;
                    faixa1.src = `../assets/kimono-faixa/Faixa-${c1.graduacao}.png`;
                } else {
                    faixa1.src = `../assets/kimono-faixa/Faixa-${c1.graduacao}.png`;
                    faixa2.src = `../assets/kimono-faixa/Faixa-${c2.graduacao}.png`;
                }
            }

            checkbox1.addEventListener('change', mudarFaixa);
            checkbox2.addEventListener('change', mudarFaixa);

            pontos1 = luta.pontos1 || 0;
            pontos2 = luta.pontos2 || 0;
            vantagens1 = luta.vantagens1 || 0;
            vantagens2 = luta.vantagens2 || 0;
            faltas1 = luta.faltas1 || 0;
            faltas2 = luta.faltas2 || 0;
            montada1 = luta.montada1 || 0;
            montada2 = luta.montada2 || 0;
            passagem1 = luta.passagem1 || 0;
            passagem2 = luta.passagem2 || 0;
            raspagem1 = luta.raspagem1 || 0;
            raspagem2 = luta.raspagem2 || 0;
            tempoRestante = luta.tempo || 5 * 60;

            atualizarPlacar();
        } catch (err) {
            console.error("Erro ao buscar dados atualizados da luta:", err);
        }
    }

    const aplicarFalta = (comp) => {
        let vencedor;
        if (comp === 1) {
            faltas1++;
            if (faltas1 === 2) vantagens2++;
            else if (faltas1 === 3) vantagens2++;
            else if (faltas1 === 4) {
                pontos2++;
                vencedor = 2;
            }
        } else {
            faltas2++;
            if (faltas2 === 2) vantagens1++;
            else if (faltas2 === 3) vantagens1++;
            else if (faltas2 === 4) {
                pontos1++;
                vencedor = 1;
            }
        }

        if (vencedor) {
            const nomeVencedor = vencedor === 1 ? 'Atleta 1' : 'Atleta 2';
            alert(`${nomeVencedor} venceu a luta devido a 4 faltas do adversário.`);
            clearInterval(intervaloTempo); // Encerra o cronômetro
            return; // Finaliza a luta
        }

        atualizarPlacar();
        salvarEstadoLuta();
    };

    const addMontada = (comp) => {
        if (comp === 1) {
            montada1++;
            pontos1++;
        } else {
            montada2++;
            pontos2++;
        }
        atualizarPlacar();
        salvarEstadoLuta();
    };

    const addPassagem = (comp) => {
        if (comp === 1) {
            passagem1++;
            pontos1 += 3;
        } else {
            passagem2++;
            pontos2 += 3;
        }
        atualizarPlacar();
        salvarEstadoLuta();
    };

    const addRaspagem = (comp) => {
        if (comp === 1) {
            raspagem1++;
            pontos1++;
        } else {
            raspagem2++;
            pontos2++;
        }
        atualizarPlacar();
        salvarEstadoLuta();
    };

    const cronometroLuta = () => {
        let intervaloTempo;
        contador.addEventListener("click", () => {
            if (intervaloTempo) {
                clearInterval(intervaloTempo);
                intervaloTempo = null;
            } else {
                intervaloTempo = setInterval(() => {
                    const min = String(Math.floor(tempoRestante / 60)).padStart(2, "0");
                    const seg = String(tempoRestante % 60).padStart(2, "0");
                    contador.textContent = `${min}:${seg}`;
                    if (tempoRestante <= 0) {
                        clearInterval(intervaloTempo);
                        intervaloTempo = null;
                    }
                    tempoRestante--;
                    salvarEstadoLuta();
                }, 1000);
            }
        });
    };

    cronometroLuta();
    buscarLutaAtualizada();

    document.querySelectorAll('.atleta').forEach((atleta, index) => {
        atleta.querySelector('.boxF.vantagem').addEventListener('click', () => addVantagem(index + 1));
        atleta.querySelector('.boxF.falta').addEventListener('click', () => aplicarFalta(index + 1));

        const boxPontuacoes = atleta.querySelectorAll('.pontoBox .boxP');
        boxPontuacoes.forEach((box, pontoIndex) => {
            box.addEventListener('click', () => {
                if (pontoIndex === 0) index === 0 ? addMontada(1) : addMontada(2);
                else if (pontoIndex === 1) index === 0 ? addPassagem(1) : addPassagem(2);
                else if (pontoIndex === 2) index === 0 ? addRaspagem(1) : addRaspagem(2);
            });
        });
    });

    resetFight.addEventListener('click', async () => {
        const confirm = window.confirm("Tem certeza que deseja resetar a luta?");
        if (confirm) {
            pontos1 = pontos2 = vantagens1 = vantagens2 = faltas1 = faltas2 = montada1 = montada2 = passagem1 = passagem2 = raspagem1 = raspagem2 = 0;
            tempoRestante = 5 * 60;
            salvarEstadoLuta();
        }
    });
});

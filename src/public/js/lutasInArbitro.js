const fightsDiv = document.querySelector('.fights');
const inputBusca = document.querySelector('input');
const selectArea = document.getElementById('selectArea');
const apiBaseUrl = "http://localhost:8080/api/competidor";

document.addEventListener('click', e => {
    if (!inputBusca.contains(e.target) && !fightsDiv.contains(e.target)) {
        fightsDiv.style.display = 'none';
    }
});

inputBusca.addEventListener('focus', () => {
    fightsDiv.style.display = 'flex';
});

const getNomeCompetidor = async (id) => {
    if (!id) return 'A definir';
    try {
        const res = await fetch(`${apiBaseUrl}/comp/${id}`);
        const data = await res.json();
        return data.nome || 'A definir';
    } catch {
        return 'A definir';
    }
};

const carregarAreas = async () => {
    try {
        const res = await fetch(`${apiBaseUrl}/areas`);
        const areas = await res.json();

        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.id;
            option.textContent = area.nome;
            selectArea.appendChild(option);
        });
    } catch (erro) {
        console.error('Erro ao buscar áreas:', erro);
        selectArea.innerHTML = '<option value="">Erro ao carregar áreas</option>';
    }
};

const carregarLutasPorArea = async (areaId) => {
    fightsDiv.querySelectorAll('.fight-item').forEach(el => el.remove());
    try {
        const res = await fetch(`${apiBaseUrl}/areas/${areaId}`);
        const area = await res.json();

        if (!area.lutas || area.lutas.length === 0) {
            const p = document.createElement('p');
            p.className = 'fight-item';
            p.innerText = 'Nenhuma luta nesta área.';
            fightsDiv.appendChild(p);
            return;
        }

        const lutasComNomes = await Promise.all(area.lutas.map(async luta => {
            const nome1 = await getNomeCompetidor(luta.competidor1Id);
            const nome2 = await getNomeCompetidor(luta.competidor2Id);
            return { ...luta, nome1, nome2 };
        }));

        lutasComNomes.forEach(luta => {
            const item = document.createElement('div');
            item.className = 'fight-item';
            item.innerHTML = `
                <strong>Luta ${luta.id} - Área ${area.nome}</strong><br>
                <p><strong>Categoria:</strong> ${luta.categoria.replaceAll('_', ' ').toUpperCase()}</p>
                <p><span>${luta.nome1}</span> <span class="vs">vs</span> <span>${luta.nome2}</span></p>
            `;
            item.onclick = () => window.location.href = `arbitragem.html?id=${luta.id}`;
            fightsDiv.appendChild(item);
        });
    } catch (erro) {
        console.error('Erro ao buscar lutas da área:', erro);
        const p = document.createElement('p');
        p.className = 'fight-item';
        p.innerText = 'Erro ao carregar lutas.';
        fightsDiv.appendChild(p);
    }
};

selectArea.addEventListener('change', () => {
    const areaId = selectArea.value;
    if (areaId) {
        fightsDiv.style.display = 'flex'; // Exibe o fightsDiv quando uma área é selecionada
        carregarLutasPorArea(areaId);
    } else {
        fightsDiv.querySelectorAll('.fight-item').forEach(el => el.remove());
        fightsDiv.style.display = 'none'; // Esconde a caixa quando não há área selecionada
    }
});

carregarAreas();

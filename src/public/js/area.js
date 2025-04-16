document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lutas-container');
    const titulo = document.getElementById('area-nome');
    const urlParams = new URLSearchParams(window.location.search);
    const areaId = urlParams.get('id');
    const apiCompetidorUrl = "http://localhost:8080/api/competidor/comp";

    if (!areaId) {
        container.innerHTML = '<p>ID da área não informado.</p>';
        return;
    }

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

    try {
        const res = await fetch(`http://localhost:8080/api/competidor/areas/${areaId}`);
        const area = await res.json();

        if (!area || !area.lutas) {
            container.innerHTML = '<p>Erro ao carregar lutas da área.</p>';
            return;
        }

        titulo.innerText = `Área: ${area.nome}`;

        if (area.lutas.length === 0) {
            container.innerHTML = '<p>Nenhuma luta nesta área.</p>';
            return;
        }

        for (const luta of area.lutas) {
            const div = document.createElement('div');
            div.classList.add('card');
            div.classList.add('lutaC');
            div.innerHTML = `
        <h3>Luta #${luta.id}</h3>
        <p><strong>Categoria:</strong> ${luta.categoria}</p>
        <p><strong>Fase:</strong> ${luta.fase}</p>
        <p><strong>Competidor 1:</strong> ${await getNomeCompetidor(luta.competidor1Id)}</p>
        <p><strong>Competidor 2:</strong> ${await getNomeCompetidor(luta.competidor2Id)}</p>
        <p><strong>Vencedor:</strong> ${await getNomeCompetidor(luta.vencedorId)}</p>
        <button onclick="window.location.href='arbitragem.html?id=${luta.id}'" class='gerLuta'>Gerenciar</button>
      `;
            container.appendChild(div);
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
    }
});

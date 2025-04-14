document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lutas-container');
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
    try {
        const res = await fetch('http://localhost:8080/api/competidor/lutas');
        const lutas = await res.json();

        if (!Array.isArray(lutas)) {
            container.innerHTML = '<p>Erro ao carregar lutas.</p>';
            return;
        }

        if (lutas.length === 0) {
            container.innerHTML = '<p>Nenhuma luta cadastrada.</p>';
            return;
        }

        lutas.forEach(async luta => {
            const div = document.createElement('div');
            div.classList.add('card');
            div.classList.add('lutaC');
            div.innerHTML = `
        <h3>Luta #${luta.id}</h3>
        <p><strong>Competidor 1:</strong> ${await getNomeCompetidor(luta.competidor1Id)}</p>
        <p><strong>Competidor 2:</strong> ${await getNomeCompetidor(luta.competidor2Id) }</p>
        <button onclick="window.location.href='arbitragem.html?id=${luta.id}'" class='gerLuta'>Gerenciar</button>
      `;
            container.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
    }
});

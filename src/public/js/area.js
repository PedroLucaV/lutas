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
        const res = await fetch('http://localhost:8080/api/competidor/lutas');
        const lutas = await res.json();

        titulo.innerText = `Área ID: ${areaId}`;

        // Mostra apenas lutas sem área definida ou que já pertencem à área atual
        const lutasFiltradas = lutas.filter(l => !l.areaId || l.areaId === parseInt(areaId));

        if (lutasFiltradas.length === 0) {
            container.innerHTML = '<p>Nenhuma luta disponível para esta área.</p>';
            return;
        }

        for (const luta of lutasFiltradas) {
            const div = document.createElement('div');
            div.classList.add('card', 'lutaC');
            div.innerHTML = `
          <h3>Luta #${luta.id}</h3>
          <p><strong>Categoria:</strong> ${luta.categoria}</p>
          <p><strong>Fase:</strong> ${luta.fase}</p>
          <p><strong>Competidor 1:</strong> ${await getNomeCompetidor(luta.competidor1Id)}</p>
          <p><strong>Competidor 2:</strong> ${await getNomeCompetidor(luta.competidor2Id)}</p>
          <p><strong>Vencedor:</strong> ${await getNomeCompetidor(luta.vencedorId)}</p>
          <button class='gerLuta' data-luta-id="${luta.id}">Gerenciar</button>
        `;
            container.appendChild(div);
        }

        // Adiciona evento aos botões depois de criar todos
        document.querySelectorAll('.gerLuta').forEach(button => {
            button.addEventListener('click', async (event) => {
                const lutaId = event.target.getAttribute('data-luta-id');
                try {
                    await fetch(`http://localhost:8080/api/competidor/luta/${lutaId}/definir-area/${areaId}`, {
                        method: 'PUT'
                    });
                    window.location.href = `arbitragem.html?id=${lutaId}`;
                } catch (err) {
                    console.error('Erro ao definir área antes de gerenciar:', err);
                    alert('Erro ao atribuir a área para esta luta.');
                }
            });
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
    }
});
  
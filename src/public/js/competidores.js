document.addEventListener("DOMContentLoaded", () => {
  const nomeInput = document.getElementById('nome');
  const enviar = document.getElementById('envi');
  const all = document.getElementById('all');
  const pagination = document.getElementById('pagination');

  let currentPage = 1;
  const limit = 5;

  async function buscarCompetidores(page = 1) {
    const nome = nomeInput.value.trim();

    if (!nome) {
      all.innerHTML = `<p style="color: red;">Digite um nome para buscar.</p>`;
      return;
    }

    all.innerHTML = `<p>Carregando...</p>`;
    try {
      const response = await fetch(`http://localhost:8080/api/competidor/buscar?nome=${nome}&page=${page}&limit=${limit}`);
      const result = await response.json();

      if (result.data.length === 0) {
        all.innerHTML = `<p>Nenhum competidor encontrado.</p>`;
        pagination.innerHTML = '';
        return;
      }

      all.innerHTML = `
  <div>
    ${result.data.map(comp => `
      <div 
        class="competidor" 
        style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; cursor: pointer;"
        onclick="window.location.href='competidor.html?id=${comp.id}'"
      >
        <p><strong>Nome:</strong> ${comp.nome}</p>
      </div>
    `).join('')}
  </div>
`;


      renderPaginacao(result.page, result.totalPages);
    } catch (error) {
      all.innerHTML = `<p style="color: red;">Erro ao buscar competidores.</p>`;
      console.error(error);
    }
  }

  function renderPaginacao(page, totalPages) {
    let html = '';

    if (page > 1) {
      html += `<button id="prevPage">Anterior</button>`;
    }

    html += `<span style="margin: 0 10px;">Página ${page} de ${totalPages}</span>`;

    if (page < totalPages) {
      html += `<button id="nextPage">Próxima</button>`;
    }

    pagination.innerHTML = html;

    const prev = document.getElementById('prevPage');
    const next = document.getElementById('nextPage');

    if (prev) {
      prev.addEventListener('click', () => {
        currentPage--;
        buscarCompetidores(currentPage);
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        currentPage++;
        buscarCompetidores(currentPage);
      });
    }
  }

  nomeInput.addEventListener('input', () => {
    currentPage = 1;
    buscarCompetidores(currentPage);
  });
});

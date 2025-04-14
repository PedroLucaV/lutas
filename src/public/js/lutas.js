const apiLutasUrl = "http://localhost:8080/api/competidor/lutas";
const apiCompetidorUrl = "http://localhost:8080/api/competidor/comp";
const lutasD = document.getElementById('lutas');

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

async function fetchBrackets() {
  try {
    const response = await fetch(apiLutasUrl);
    const lutas = await response.json();

    const htmlLutas = await Promise.all(lutas.map(async (luta) => {
      const nome1 = await getNomeCompetidor(luta.competidor1Id);
      const nome2 = await getNomeCompetidor(luta.competidor2Id);
      const categoria = luta.categoria.replaceAll('_', ' ').toUpperCase();

      const generoC = luta.categoria.toLowerCase().includes('masculino')
        ? 'masc'
        : luta.categoria.toLowerCase().includes('feminino')
        ? 'fem'
        : '';

      return `
        <div class="luta">
          <div class='top ${generoC}'>
            ${categoria}
          </div>
          <div class='lutas'>
            <div class='f1'>${nome1}</div>
            <div class='f2'>${nome2}</div>
          </div>
        </div>
      `;
    }));

    lutasD.innerHTML = htmlLutas.join('');

  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    lutasD.innerHTML = "<p>Erro ao carregar as lutas.</p>";
  }
}

fetchBrackets();
setInterval(fetchBrackets, 30000);

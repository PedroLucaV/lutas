const apiUrl = "http://localhost:8080/api/competidor/listFight";
const lutasD = document.getElementById('lutas');

async function fetchBrackets() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    let html = ''; // Armazena todo o conteúdo HTML

    data.lutas.forEach(luta => {
      const generoC = luta.categoria.toLowerCase().includes('masculino')
        ? 'masc'
        : luta.categoria.toLowerCase().includes('feminino')
        ? 'fem'
        : '';

      html += `
        <div class="luta">
            <div class='top ${generoC}'>
              ${luta.categoria}
            </div>
            <div class='lutas'>
              <div class='f1'>
                ${luta.competidor1 || 'A definir'}
              </div>
              <div class='f2'>
                ${luta.competidor2 || 'A definir'}
              </div>
            </div>
        </div>
      `;
    });

    lutasD.innerHTML = html;

  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    lutasD.innerHTML = "<p>Erro ao carregar as lutas.</p>";
  }
}

fetchBrackets();
setInterval(fetchBrackets, 30000);

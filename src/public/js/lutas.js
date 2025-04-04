const apiUrl = "http://localhost:8080/api/competidor/brackets";

async function fetchBrackets() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const bracketsDiv = document.getElementById("brackets");
        bracketsDiv.innerHTML = ""; // Limpa antes de atualizar

        data.chaves.forEach((fase) => {
            const faseDiv = document.createElement("div");
            faseDiv.classList.add("fase");
            faseDiv.innerHTML = `<h2>Fase ${fase.fase}</h2>`;

            const tabela = document.createElement("table");
            tabela.classList.add("tabela");

            tabela.innerHTML = `
                <thead>
                    <tr>
                        <th>Categoria</th>
                        <th>Competidor 1</th>
                        <th>Competidor 2</th>
                        <th>Área</th>
                    </tr>
                </thead>
                <tbody>
                    ${fase.lutas
                        .map(
                            (luta) => `
                        <tr>
                            <td>${luta.categoria}</td>
                            <td>${luta.competidor1}</td>
                            <td>${luta.competidor2}</td>
                            <td>${luta.area}</td>
                        </tr>
                    `
                        )
                        .join("")}
                </tbody>
            `;

            faseDiv.appendChild(tabela);
            bracketsDiv.appendChild(faseDiv);
        });
    } catch (error) {
        console.error("Erro ao buscar os dados:", error);
        document.getElementById("brackets").innerHTML =
            "<p>Erro ao carregar as chaves.</p>";
    }
}

// Atualiza as chaves a cada 30 segundos
fetchBrackets();
setInterval(fetchBrackets, 30000);

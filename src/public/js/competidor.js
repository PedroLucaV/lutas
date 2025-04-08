document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = Number(urlParams.get("id"));

  function validarPesoPorCategoria(peso, categoria) {
  peso = Number(peso); // Garantir que é número

  const categorias = {
    'Galo':       { min: 0, max: 57.5 },
    'Pluma':      { min: 57.6, max: 64 },
    'Pena':       { min: 64.1, max: 70 },
    'Leve':       { min: 70.1, max: 76 },
    'Médio':      { min: 76.1, max: 82.3 },
    'Meio-Pesado':{ min: 82.4, max: 88.3 },
    'Pesado':     { min: 88.4, max: 94.3 },
    'Super-Pesado':{ min: 94.4, max: 100.5 },
    'Pesadíssimo':{ min: 100.6, max: Infinity }
  };

  const faixa = categorias[categoria];

  if (!faixa) return false;

  return peso >= faixa.min && peso <= faixa.max;
}

  if (!id) {
    alert("ID do competidor não informado.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/competidor/${id}`);
    if (!response.ok) throw new Error("Erro ao buscar competidor.");
    const competidor = await response.json();

    // Preenche os campos
    document.getElementById('nome').value = competidor.nome || '';
    document.getElementById('faixaEtaria').value = competidor.idade >= 18 ? 'Adulto' : 'Infanto Juvenil';
    document.getElementById('categoria').value = `${competidor.categoria}` || '';
    document.getElementById('peso').placeholder = `` || '';
    document.getElementById('professor').value = competidor.professor || '';
    document.getElementById('academia').textContent = competidor.equipe
    document.getElementById('academiaLogo').src = `../../images/campeonato/users/competidor/${competidor.equipeImg}` || '../assets/bjj-logo.png'
    document.querySelector('.pic').src = `../../images/campeonato/users/competidor/${competidor.fotoCompetidor}`
    
    if(competidor.responsavel === '' || competidor.responsavel === null){
        document.getElementById('respA').style.display = 'none'
    }else{
        document.getElementById('responsavelL').value = competidor.responsavel || '';
    }

    document.getElementById('peso').addEventListener('input', (e) => {
      let peso = e.target.value

      peso = Number(peso)
      if(validarPesoPorCategoria(peso, competidor.categoria)){
        document.getElementById('checkPeso').disabled = false
      }else{
        document.getElementById('checkPeso').disabled = true
      }
      
    })

  } catch (error) {
    console.error(error);
    alert("Erro ao carregar os dados do competidor.");
  }
});

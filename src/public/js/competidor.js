document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const nome = urlParams.get("nome");

  if (!nome) {
    alert("nome do competidor não encontrado na URL");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/competidor/listar?nome=${nome}`);
    if (!response.ok) throw new Error("Erro ao buscar competidor");

    const data = await response.json();
    const comp = data.data;

    let faixa;

    data < 18 ? faixa='Infanto-Juvenil' : faixa = 'Adulto'

    if(comp.responsavel == null){
        document.getElementById("respA").style.display = 'none'
    }
    // Preenche os campos com os dados do competidor
    document.getElementById("nome").value = comp.nome;
    document.getElementById("faixaEtaria").value = `${comp.idade} anos - ${faixa}`;
    document.getElementById("categoria").value = comp.graduacao || '';
    document.getElementById("peso").value = `Registrado com ${comp.peso} kg`;
    document.getElementById("professor").value = comp.professor || '';
    document.getElementById("responsavelL").value = comp.responsavel || '';

    // Atualiza a imagem de perfil
    if (comp.fotoCompetidor) {
      const picPath = `../${comp.fotoCompetidor.replace(/\\/g, '/')}`;
      document.querySelector(".pic").src = picPath;
    }

    // Atualiza a imagem da academia
    if (comp.equipeImg) {
      const equipeImgPath = `../${comp.equipeImg.replace(/\\/g, '/')}`;
      document.querySelector(".academia img").src = equipeImgPath;
    }

  } catch (error) {
    console.error("Erro ao carregar competidor:", error);
    alert("Erro ao carregar dados do competidor.");
  }
});

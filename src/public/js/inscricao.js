document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".formStep");
    const btnNext = document.querySelectorAll(".btn-next");
    const btnPrev = document.querySelectorAll(".btn-prev");
    const btnSubmit = document.querySelectorAll('.btn-submit');
    const form = document.querySelector("form");
    const telefone = document.getElementById("telefone");
    const nascimento = document.getElementById("nascimento");
    const responsavelContainer = document.getElementById("responsavelContainer");
    const responsavelContainerCpf = document.getElementById('responsavelContainerCpf')
    const responsavelContainerFoto = document.getElementById('responsavelContainerFoto')
    const responsavel = document.getElementById("responsavel");
    const responsavelFoto = document.getElementById('responsavel-foto')
    const responsavelCPF = document.getElementById('responsavel-cpf')
    const equipeImg = document.getElementById('equipeImg');
    const fotoCompetidor = document.getElementById('fotoCompetidor')
    const tipoSelect = document.getElementById("tipo");
    const main = document.getElementById('main')
    

    let currentStep = 0;

    // Impedir envio de formulário ao pressionar Enter e avançar para o próximo step
    document.querySelectorAll("input, select").forEach(input => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                
                // Obter o passo atual e avançar se for válido
                if (validateStep(currentStep)) {
                    // Se for o último passo para espectador
                    if (tipoSelect.value === "espec" && currentStep === 2) {
                        criarEspectador();
                        return;
                    }
                    // Se for o último passo para competidor
                    else if (tipoSelect.value === "comp" && currentStep === 4) {
                        criarCompetidor();
                        return;
                    }
                    
                    // Caso contrário, avançar para o próximo passo
                    currentStep++;
                    showStep(currentStep);
                }
                return false;
            }
        });
    });

    const showStep = (step) => {
        steps.forEach((formStep, index) => {
            formStep.classList.toggle("formStepActive", index === step);
        });
    };

    const validateStep = (step) => {
        const inputs = steps[step].querySelectorAll("input, select");
        let isValid = true;

        inputs.forEach((input) => {
            const errorMessage = input.nextElementSibling;
            if (errorMessage) errorMessage.textContent = "";
            
            const isVisible = input.offsetParent !== null;

            if (isVisible && input.value.trim() === "") {
                input.classList.add("error");
                if (errorMessage) errorMessage.textContent = "Este campo é obrigatório.";
                if (isValid) input.focus();
                isValid = false;
            } else {
                input.classList.remove("error");
            }

            // Validações com regex
            if (isVisible && input.id === "telefone" && input.value !== "") {
                const telefoneRegex = /^\(\d{2}\) (?:9\d{4}|\d{4})-\d{4}$/;
                if (!telefoneRegex.test(input.value)) {
                    input.classList.add("error");
                    if (errorMessage) errorMessage.textContent = "Número inválido. Use o formato (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX.";
                    if (isValid) input.focus();
                    isValid = false;
                }
            }

            if (isVisible && input.id === "email" && input.value !== "") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    input.classList.add("error");
                    if (errorMessage) errorMessage.textContent = "E-mail inválido.";
                    if (isValid) input.focus();
                    isValid = false;
                }
            }

            if (isVisible && input.id === "senha" && input.value !== "") {
                const senhaRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
                if (!senhaRegex.test(input.value)) {
                    input.classList.add("error");
                    if (errorMessage) errorMessage.textContent = "A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula e um número.";
                    if (isValid) input.focus();
                    isValid = false;
                }
            }

            if (isVisible && input.id === "confirmaSenha" && input.value !== "") {
                const senha = document.getElementById("senha").value;
                if (input.value !== senha) {
                    input.classList.add("error");
                    if (errorMessage) errorMessage.textContent = "As senhas não coincidem.";
                    if (isValid) input.focus();
                    isValid = false;
                }
            }

            if (isVisible && input.id === 'responsavel-foto' && input.value !== ''){
                const file = responsavelFoto.files[0];
                const allowed = ['image/png', 'image/jpeg', 'image/webp']
                if(!allowed.includes(file.type)){
                    input.classList.add("error");
                    if (errorMessage) errorMessage.textContent = "Tipo de arquivo invalido, envie um JPEG, PNG ou WEBP";
                    if (isValid) input.focus();
                    isValid = false;
                }
            }

            if (isVisible && input.id === 'equipeImg' && input.value !== ''){
                const file = equipeImg.files[0];
                const allowed = ['image/png', 'image/jpeg', 'image/webp']
                if(!allowed.includes(file.type)){
                    input.classList.add("error");
                    if (errorMessage) errorMessage.textContent = "Tipo de arquivo invalido, envie um JPEG, PNG ou WEBP";
                    if (isValid) input.focus();

                    main.style.height = "750px";
                    isValid = false;
                }
                else{
                    main.style.height = "710px";
                }
            }

            if (isVisible && input.id === 'fotoCompetidor' && input.value !== ''){
                const file = fotoCompetidor.files[0];
                const allowed = ['image/png', 'image/jpeg', 'image/webp']
                if(!allowed.includes(file.type)){
                    input.classList.add("error");
                    if (errorMessage) errorMessage.textContent = "Tipo de arquivo invalido, envie um JPEG, PNG ou WEBP";
                    if (isValid) input.focus();

                    main.style.height = "750px";
                    isValid = false;
                }
            }


            if (isVisible && input.id === 'responsavel-cpf' && input.value !== ''){
                const regex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/
                if(!regex.test(input.value)){
                    input.classList.add("error");
                    if (errorMessage) errorMessage.textContent = "CPF Invalido"
                    isValid = false;
                }
            }
        });

        return isValid;
    };

    btnNext.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            if (validateStep(currentStep)) {
                if (tipoSelect.value === "espec" && currentStep === 2) {
                        criarEspectador();
                        return;
                }
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    btnSubmit.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            if(validateStep(currentStep)){
                if (tipoSelect.value === "espec" && currentStep === 2) {
                        criarEspectador();
                        return;
                }
                    // Se for o último passo para competidor
                else if (tipoSelect.value === "comp" && currentStep === 4) {
                        criarCompetidor();
                        return;
                }
            }
        })
    })

    btnPrev.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            currentStep--;
            showStep(currentStep);
        });
    });

    telefone.addEventListener("input", (e) => {
        e.target.value = e.target.value
            .replace(/\D/g, "")
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4,5})(\d)/, "$1-$2")
            .slice(0, 15)
    });

    responsavelCPF.addEventListener("input", (e) => {
    e.target.value = e.target.value
        .replace(/\D/g, "") 
        .replace(/^(\d{3})(\d)/, "$1.$2") 
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3") 
        .replace(/\.(\d{3})(\d)/, ".$1-$2") 
        .slice(0, 14);
});

    nascimento.addEventListener("change", () => {
        const nascimentoData = new Date(nascimento.value);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nascimentoData.getFullYear();

        // Verifica se o aniversário já passou este ano
        const aniversarioAindaNaoOcorreu =
            hoje.getMonth() < nascimentoData.getMonth() ||
            (hoje.getMonth() === nascimentoData.getMonth() && hoje.getDate() < nascimentoData.getDate());

        if (aniversarioAindaNaoOcorreu) idade--;

        responsavelContainer.style.display = idade < 18 ? "flex" : "none";
        responsavelContainerCpf.style.display = idade < 18 ? "flex" : "none";
        responsavelContainerFoto.style.display = idade < 18 ? "flex" : "none";

        main.style.height = idade < 18 ? "800px" : "710px";
        
        responsavel.required = idade < 18;
        responsavelFoto = idade < 18;
        responsavelCPF = idade < 18;
    });
/*
    const criarEspectador = () => {
        console.log("Criando espectador...");
        const espectador = {
            nome: document.getElementById("nome").value,
            telefone: document.getElementById("telefone").value,
            email: document.getElementById("email").value,
            senha: document.getElementById('senha').value,
            endereco: document.getElementById("endereco").value,
            cidade: document.getElementById("cidade").value,
            estado: document.getElementById("estado").value,
        };
        console.log("Dados do espectador:", espectador);
        
        fetch("http://localhost:8080/api/espectador/criar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(espectador)
        })
        .then(response => response.json())
        .then(data => console.log("Espectador criado:", data))
        .catch(error => console.error("Erro ao criar espectador:", error));

        alert("Registro finalizado para espectador!");
    }; */

    const criarCompetidor = () => {
    const formData = new FormData();

    formData.append("nome", document.getElementById("nome").value);
    formData.append("telefone", document.getElementById("telefone").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("senha", document.getElementById("senha").value);
    formData.append("endereco", document.getElementById("endereco").value);
    formData.append("cidade", document.getElementById("cidade").value);
    formData.append("estado", document.getElementById("estado").value);
    formData.append("data_nascimento", document.getElementById("nascimento").value);
    formData.append("genero", document.getElementById("genero").value);
    formData.append("professor", document.getElementById("professor").value);
    formData.append("equipe", document.getElementById("equipe").value);
    formData.append("graduacao", document.getElementById("graduacao").value);
    formData.append("peso", document.getElementById("peso").value);

    // Imagens
    if (fotoCompetidor.files[0]) formData.append("fotoCompetidor", fotoCompetidor.files[0]);
    if (equipeImg.files[0]) formData.append("equipeImg", equipeImg.files[0]);
    if (document.getElementById("responsavel-foto").files[0]) {
        formData.append("fotoResp", document.getElementById("responsavel-foto").files[0]);
    }

    // Responsável (condicional)
    formData.append("responsavel", document.getElementById("responsavel").value || "");
    formData.append("cpfResp", document.getElementById("responsavel-cpf").value || "");

    formData.append('cpf', '011.011.011-90')
    fetch("http://localhost:8080/api/competidor/", {
        method: "POST",
        body: formData,
    })
    .then(res => res.json())
    .then(data => {
        console.log("Competidor criado com sucesso:", data);
        alert("Registro finalizado para competidor!");
    })
    .catch(error => {
        console.error("Erro ao criar competidor:", error);
        alert("Erro ao enviar os dados.");
    });
};


    // Evitar que o formulário seja enviado ao pressionar Enter em qualquer parte do formulário
    form.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            return false;
        }
    });

    showStep(currentStep);
});
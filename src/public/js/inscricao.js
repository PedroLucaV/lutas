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
    const responsavel = document.getElementById("#responsavel");
    const tipoSelect = document.getElementById("tipo");

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
            .replace(/(\d{4,5})(\d)/, "$1-$2");
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

        responsavel.required = idade < 18;
    });

    const criarEspectador = () => {
        console.log("Criando espectador...");
        const espectador = {
            nome: document.getElementById("nome").value,
            telefone: document.getElementById("telefone").value,
            email: document.getElementById("email").value,
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
    };

    const criarCompetidor = () => {
        console.log("Criando competidor...");
        const competidor = {
            nome: document.getElementById("nome").value,
            telefone: document.getElementById("telefone").value,
            email: document.getElementById("email").value,
            endereco: document.getElementById("endereco").value,
            cidade: document.getElementById("cidade").value,
            estado: document.getElementById("estado").value,
            nascimento: document.getElementById("nascimento").value,
            genero: document.getElementById("genero").value,
            professor: document.getElementById("professor").value,
            equipe: document.getElementById("equipe").value,
            graduacao: document.getElementById("graduacao").value,
            peso: Number(document.getElementById('peso').value),
            responsavel: document.getElementById("responsavel").value || null
        };
        
        console.log("Dados do competidor:", competidor);
        
        fetch("http://localhost:8080/api/competidor/criar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(competidor)
        })
        .then(response => response.json())
        .then(data => console.log("Competidor criado:", data))
        .catch(error => console.error("Erro ao criar competidor:", error));

        alert("Registro finalizado para competidor!");
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
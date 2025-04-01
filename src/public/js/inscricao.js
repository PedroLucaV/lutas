document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".formStep");
    const btnNext = document.querySelectorAll(".btn-next");
    const btnPrev = document.querySelectorAll(".btn-prev");
    const form = document.querySelector("form"); // Pegando o formulário
    const telefone = document.getElementById("telefone");
    const nascimento = document.getElementById("nascimento");
    const responsavelContainer = document.getElementById("responsavelContainer");
    const responsavel = document.getElementById("responsavel");

    let currentStep = 0;

    function showStep(step) {
        steps.forEach((formStep, index) => {
            formStep.classList.toggle("formStepActive", index === step);
        });
    }

    const validateStep = (step) => {
    const inputs = steps[step].querySelectorAll("input, select");
    let isValid = true;

    inputs.forEach((input) => {
        const errorMessage = input.nextElementSibling;

        // Limpar a mensagem de erro
        if (errorMessage) errorMessage.textContent = "";

        // Verificar se o campo está vazio
        if (input.id !== "responsavel" && input.value.trim() === "") {
            input.classList.add("error");
            if (errorMessage) errorMessage.textContent = "Este campo é obrigatório.";
            if (isValid) input.focus();
            isValid = false;
        } else {
            input.classList.remove("error");
        }

        // Validação de telefone
        if (input.id === "telefone" && input.value !== "") {
            const telefoneRegex = /^\(\d{2}\) 9\d{4}-\d{4}$/;
            if (!telefoneRegex.test(input.value)) {
                input.classList.add("error");
                if (errorMessage) errorMessage.textContent = "Número inválido. Use o formato (XX) 9XXXX-XXXX.";
                if (isValid) input.focus();
                isValid = false;
            }
        }

        // Validação de e-mail
        if (input.id === "email" && input.value !== "") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.classList.add("error");
                if (errorMessage) errorMessage.textContent = "E-mail inválido.";
                if (isValid) input.focus();
                isValid = false;
            }
        }

        // Validação de senha
        if (input.id === "senha" && input.value !== "") {
            const senhaRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/

            if (!senhaRegex.test(input.value)) {
                input.classList.add("error");
                if (errorMessage) errorMessage.textContent = "A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.";
                if (isValid) input.focus();
                isValid = false;
            }
        }

        // Validação de confirmação de senha
        if (input.id === "confirmaSenha" && input.value !== "") {
            const senha = document.getElementById("senha").value;
            if (input.value !== senha) {
                input.classList.add("error");
                if (errorMessage) errorMessage.textContent = "As senhas não coincidem.";
                if (isValid) input.focus();
                isValid = false;
            }
        }

        if (input.id === 'responsavel')
    });

    return isValid;
};


    btnNext.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault(); // Impede que qualquer botão cause um submit
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
        console.log(currentStep);
        
    });

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
            .replace(/(\d{5})(\d)/, "$1-$2");
    });

    nascimento.addEventListener("change", () => {
        const nascimentoData = new Date(nascimento.value);
        const idade = new Date().getFullYear() - nascimentoData.getFullYear();
        responsavelContainer.style.display = idade < 18 ? "block" : "none";
        responsavel.required = idade < 18;
    });

    // Impede o envio do formulário ao pressionar Enter
    form.addEventListener("submit", (e) => {
        e.preventDefault();
    });

    showStep(currentStep);
});

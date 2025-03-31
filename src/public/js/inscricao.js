document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".formComp");
    const dataNascimento = document.getElementById("data_nascimento");
    const responsavelDiv = document.querySelector(".formDiv[style]");
    const responsavelInput = document.getElementById("responsavel");
    const azulMaisOptgroup = document.getElementById("azulMais");

    function calcularIdade(data) {
        const hoje = new Date();
        const nascimento = new Date(data);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade;
    }

    function verificarIdade() {
        const idade = calcularIdade(dataNascimento.value);

        if (idade < 18) {
            responsavelDiv.style.display = "flex";
        } else {
            responsavelDiv.style.display = "none";
            clearError(responsavelInput);
        }

        if (idade < 16) {
            azulMaisOptgroup.style.display = "none";
        } else {
            azulMaisOptgroup.style.display = "block";
        }
    }

    dataNascimento.addEventListener("input", verificarIdade);

    function showError(input, message) {
        let errorSpan = input.parentElement.querySelector(".error-message");

        if (!errorSpan) {
            errorSpan = document.createElement("span");
            errorSpan.classList.add("error-message");
            input.parentElement.appendChild(errorSpan);
        }

        input.classList.add("input-error");
        errorSpan.textContent = message;
    }

    function clearError(input) {
        let errorSpan = input.parentElement.querySelector(".error-message");
        if (errorSpan) {
            errorSpan.remove();
        }
        input.classList.remove("input-error");
    }

    form.addEventListener("submit", function (event) {
        let isValid = true;

        const nome = document.getElementById("nome");
        const telefone = document.getElementById("telefone");
        const email = document.getElementById("email");
        const endereco = document.getElementById("endereco");
        const cidade = document.getElementById("cidade");
        const estado = document.getElementById("estado");
        const genero = document.getElementById("genero");
        const graduacao = document.getElementById("graduacao");
        const peso = document.getElementById("peso");
        const termos = document.getElementById("termos");
        const professor = document.getElementById("professor");
        const equipe = document.getElementById("equipe");

        document.querySelectorAll(".error-message").forEach((span) => span.remove());
        document.querySelectorAll(".input-error").forEach((input) => input.classList.remove("input-error"));

        function validateMinLength(input, minLength, message) {
            if (input.value.trim().length < minLength) {
                isValid = false;
                showError(input, message);
            } else {
                clearError(input);
            }
        }

        validateMinLength(nome, 3, "O nome deve ter pelo menos 3 caracteres.");
        validateMinLength(professor, 3, "O nome do professor deve ter pelo menos 3 caracteres.");
        validateMinLength(equipe, 3, "O nome da equipe deve ter pelo menos 3 caracteres.");

        telefone.addEventListener("input", function () {
            let cleaned = telefone.value.replace(/\D/g, "");
            if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);

            if (cleaned.length > 10) {
                telefone.value = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
            } else if (cleaned.length > 6) {
                telefone.value = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
            } else if (cleaned.length > 2) {
                telefone.value = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
            } else if (cleaned.length > 0) {
                telefone.value = `(${cleaned}`;
            }

            clearError(telefone);
        });

        const telefoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
        if (!telefoneRegex.test(telefone.value.trim())) {
            isValid = false;
            showError(telefone, "O telefone deve estar no formato (XX) XXXXX-XXXX.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            isValid = false;
            showError(email, "Digite um e-mail válido.");
        } else {
            clearError(email);
        }

        validateMinLength(endereco, 5, "Digite um endereço válido.");
        validateMinLength(cidade, 3, "Digite uma cidade válida.");

        if (estado.value === "") {
            isValid = false;
            showError(estado, "Selecione um estado.");
        } else {
            clearError(estado);
        }

        if (dataNascimento.value === "") {
            isValid = false;
            showError(dataNascimento, "Informe sua data de nascimento.");
        } else {
            clearError(dataNascimento);
        }

        if (genero.value === "") {
            isValid = false;
            showError(genero, "Selecione um gênero.");
        } else {
            clearError(genero);
        }

        if (graduacao.value === "") {
            isValid = false;
            showError(graduacao, "Selecione uma graduação.");
        } else {
            clearError(graduacao);
        }

        peso.addEventListener("input", function () {
            peso.value = peso.value.replace(/[^0-9,]/g, "");
            if (peso.value.match(/,/g)?.length > 1) {
                peso.value = peso.value.replace(/,$/, "");
            }
        });

        const pesoRegex = /^\d{1,3},\d{2}$/;
        if (!pesoRegex.test(peso.value.trim())) {
            isValid = false;
            showError(peso, "Informe um peso válido no formato XX,XX kg.");
        } else {
            clearError(peso);
        }

        if (!termos.checked) {
            isValid = false;
            showError(termos, "Você deve aceitar os termos de serviço.");
        } else {
            clearError(termos);
        }

        if (!isValid) {
            event.preventDefault();
        }
    });
});

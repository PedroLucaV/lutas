document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.querySelector('#email');
  const senhaInput = document.querySelector('#senha');
  const btn = document.querySelector('.btn');
  const errorMessages = document.querySelectorAll('.error-message');

  const clearErrors = () => {
    errorMessages.forEach(msg => msg.textContent = '');
  };

  const showError = (input, message) => {
    const container = input.closest('.formInp');
    const error = container.querySelector('.error-message');
    error.textContent = message;
  };

  btn.addEventListener('click', async () => {
    clearErrors();

    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    console.log(senha);
    

    let hasError = false;

    if (!email) {
      showError(emailInput, 'Email é obrigatório');
      hasError = true;
    }

    if (!senha) {
      showError(senhaInput, 'Senha é obrigatória');
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await fetch('http://localhost:8080/api/contas/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message === 'Usuario não encontrado') {
          showError(emailInput, 'Email não encontrado');
        } else if (data.message === 'Senha incorreta') {
          showError(senhaInput, 'Senha incorreta');
        } else {
          alert('Erro inesperado: ' + data.error.message);
        }
        return;
      }

      // ✅ Login OK - redirecionar ou exibir mensagem
      alert(`Redirecionando para ${data.data.nome}`);
      // Exemplo: redirecionar 
      if(data.data.type == 0){
        window.location.href = `admin.html?id=${data.data.id}`
      }else if(data.data.type == 1){
        window.location.href = `user.html?id=${data.data.id}`
      }else if(data.data.type == 2){
        window.location.href = `competidorv.html?id=${data.data.id}`
      }

    } catch (err) {
      console.error(err);
      alert('Erro ao conectar com o servidor');
    }
  });
});

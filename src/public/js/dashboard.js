const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const generateF = document.getElementById('generateF');
const generatePDF = document.getElementById('generatePDF');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

generateF.addEventListener('click',async () => {
    res = await fetch('http://localhost:8080/api/competidor/gerar-lutas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
})
alert("Lutas geradas!")
})

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('http://localhost:8080/api/competidor/countInscritos');
        const result = await res.json();

        const nmrInscritos = document.getElementById('inscritos');
        if (nmrInscritos) {
            nmrInscritos.textContent = result.data ?? '0';
        } else {
            console.warn('Elemento com id "nmrInscritos" não encontrado.');
        }
    } catch (error) {
        console.error('Erro ao buscar número de inscritos:', error);
    }
});
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
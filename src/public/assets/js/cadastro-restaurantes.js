document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formularioCadastro');
    const fotoInput = document.getElementById('foto');
    const imagemPreview = document.getElementById('imagemPreview');
    let fotoBase64 = null;

    fotoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            fotoBase64 = null;
            imagemPreview.style.display = 'none';
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            fotoBase64 = reader.result;
            imagemPreview.src = fotoBase64;
            imagemPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        const imageUrl = fotoBase64 ? fotoBase64 : "assets/img/restaurantes/default.jpg";

        const infoCadastro = {
            nome: document.getElementById('nome').value,
            categoria: document.getElementById('categoria').value,
            endereco: document.getElementById('endereco').value,
            capacidade: parseInt(document.getElementById('capacidade').value, 10),
            imagemUrl: imageUrl,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value,
            password: senha
        };
        
        const novoRestaurante = {
            infoCadastro: infoCadastro,
            mapaRestaurante: {
                grid: {
                    columns: parseInt(document.getElementById('mapaColunas').value, 10) || 8,
                    rows: parseInt(document.getElementById('mapaLinhas').value, 10) || 5
                },
                elements: []
            },
            cardapio: {},
        };

        try {
            const response = await fetch('/restaurantes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoRestaurante),
            });
        
            if (!response.ok) {
                throw new Error(`Erro na rede: ${response.statusText}`);
            }
        
            const restauranteSalvo = await response.json();
        
            const editorToken = btoa(JSON.stringify({
                restauranteId: restauranteSalvo.id,
                timestamp: Date.now(),
                purpose: 'new_restaurant_setup'
            }));
            
            sessionStorage.setItem('editorToken', editorToken);
        
            alert('Restaurante cadastrado com sucesso! Você será redirecionado para o editor de mapa.');
            
            window.location.href = `editor-mapa.html?id=${restauranteSalvo.id}`;
        
        } catch (error) {
            console.error('Falha ao cadastrar restaurante:', error);
            alert('Ocorreu um erro ao cadastrar o restaurante. Por favor, tente novamente.');
        }
    });
});
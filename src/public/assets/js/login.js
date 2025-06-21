document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const tipoContaToggle = document.getElementById('tipoContaToggle');

    if (!loginForm || !messageDiv || !tipoContaToggle) {
        console.error("Erro: Elementos essenciais do formulário não encontrados.");
        return;
    }

    const labels = document.querySelectorAll('.switch-label');
    function updateSwitchLabels() {
        const isRestaurante = tipoContaToggle.checked;
        labels.forEach(label => {
            if (label.hasAttribute('data-user')) {
                label.classList.toggle('active', !isRestaurante);
            } else if (label.hasAttribute('data-resto')) {
                label.classList.toggle('active', isRestaurante);
            }
        });
    }
    tipoContaToggle.addEventListener('change', updateSwitchLabels);
    updateSwitchLabels();

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const isRestaurante = tipoContaToggle.checked;
        
        messageDiv.style.display = 'none';

        const endpoint = isRestaurante 
            ? `http://localhost:3000/restaurantes?infoCadastro.email=${email}` 
            : `http://localhost:3000/usuarios?email=${email}`;
        
        try {
            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.length === 0) {
                showError('Email não encontrado.');
                return;
            }

            const account = data[0];
            const passwordIsValid = isRestaurante 
                ? (account.infoCadastro.password === password) 
                : (account.password === password);

            if (passwordIsValid) {
                handleSuccessfulLogin(account, isRestaurante);
            } else {
                showError('Senha incorreta.');
            }

        } catch (error) {
            console.error('Erro ao conectar com o servidor:', error);
            showError('Não foi possível conectar ao servidor. Verifique se o json-server está rodando.');
        }
    });

    function handleSuccessfulLogin(account, isRestaurante) {
        messageDiv.className = 'message success';
        messageDiv.textContent = 'Login realizado com sucesso! Redirecionando...';
        messageDiv.style.display = 'block';

        const storageKey = 'usuarioLogado';
        
        if (isRestaurante) {
            const restauranteLogado = {
                id: account.id,
                nome: account.infoCadastro.nome,
                email: account.infoCadastro.email,
                type: 'restaurante'
            };
            localStorage.setItem(storageKey, JSON.stringify(restauranteLogado));
            setTimeout(() => {
                window.location.href = `home.html`;
            }, 2000);
        } else {
            const usuarioLogado = {
                id: account.id,
                nome: account.nome,
                email: account.email,
                type: 'usuario'
            };
            localStorage.setItem(storageKey, JSON.stringify(usuarioLogado));
            setTimeout(() => {
                window.location.href = "home.html";
            }, 2000);
        }
    }

    function showError(message) {
        messageDiv.className = 'message error';
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
    }
});
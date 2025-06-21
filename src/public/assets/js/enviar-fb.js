document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado) {
        bloquearFormularioParaAnonimos();
        return; 
    }

    const restauranteSelect = document.getElementById('restauranteSelect');
    const feedbackForm = document.getElementById('feedbackForm');
    const messageDiv = document.getElementById('message');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const submitButton = feedbackForm.querySelector('button[type="submit"]');
    const restauranteWarning = document.getElementById('restauranteWarning');
    const feedbackReservouLink = document.getElementById('feedbackReservouLink');
    const reservouModal = document.getElementById('reservouModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const reservouFeedbackForm = document.getElementById('reservouFeedbackForm');
    const reservouFeedbackMessage = document.getElementById('reservouFeedbackMessage');

    const isRestaurante = usuarioLogado && usuarioLogado.type === 'restaurante';

    async function carregarRestaurantes() {
        try {
            const response = await fetch('/restaurantes');
            if (!response.ok) throw new Error('Falha ao carregar a lista de restaurantes.');
            const restaurantes = await response.json();
            
            restaurantes.forEach(restaurante => {
                const option = document.createElement('option');
                option.value = restaurante.id;
                option.textContent = restaurante.infoCadastro.nome;
                restauranteSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Erro:", error);
            restauranteSelect.disabled = true;
            restauranteSelect.innerHTML = '<option selected>Erro ao carregar</option>';
        }
    }

    async function enviarFeedback(feedbackData) {
        messageDiv.style.display = 'none';
        try {
            const response = await fetch('/feedbacks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData),
            });
            if (!response.ok) throw new Error('Falha ao enviar o feedback.');
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Seu feedback foi enviado com sucesso! Obrigado.';
            messageDiv.style.display = 'block';
        } catch (error) {
            console.error("Erro:", error);
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Ocorreu um erro. Tente novamente mais tarde.';
            messageDiv.style.display = 'block';
        }
    }

    function abrirModal() {
        reservouModal.style.display = 'block';
    }

    function fecharModal() {
        reservouModal.style.display = 'none';
        reservouFeedbackForm.reset();
    }

    function bloquearFormularioParaAnonimos() {
        document.getElementById('restauranteSelect').disabled = true;
        document.getElementById('feedbackMessage').disabled = true;
        document.querySelector('#feedbackForm button').disabled = true;
        const platformLink = document.getElementById('feedbackReservouLink');
        if (platformLink) {
            platformLink.style.pointerEvents = 'none';
            platformLink.style.opacity = '0.5';
        }

        const overlay = document.createElement('div');
        overlay.className = 'login-required-overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <p>Você precisa estar logado para enviar um feedback.</p>
                <a href="../../login.html" class="btn btn-login">Fazer Login</a>
            </div>
        `;
        document.getElementById('feedbackForm').appendChild(overlay);
    }

    if (isRestaurante) {
        restauranteWarning.textContent = 'Restaurantes não podem enviar feedback para outros estabelecimentos. Para nos dar sua opinião sobre a plataforma, utilize o link abaixo.';
        restauranteWarning.style.display = 'block';
        restauranteSelect.disabled = true;
        feedbackMessage.disabled = true;
        submitButton.disabled = true;
        restauranteSelect.innerHTML = '<option selected>Opção desabilitada</option>';
        feedbackMessage.placeholder = 'Desabilitado para contas de restaurantes.';
    } else {
        carregarRestaurantes();
        feedbackForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const feedback = {
                target: 'restaurante',
                idRestaurante: restauranteSelect.value,
                idUsuario: usuarioLogado.id,
                nomeUsuario: usuarioLogado.nome,
                mensagem: feedbackMessage.value,
                data: new Date().toISOString()
            };
            enviarFeedback(feedback);
            feedbackForm.reset();
            restauranteSelect.selectedIndex = 0;
        });
    }

    feedbackReservouLink.addEventListener('click', (event) => {
        event.preventDefault();
        abrirModal();
    });

    closeModalBtn.addEventListener('click', fecharModal);

    window.addEventListener('click', (event) => {
        if (event.target === reservouModal) {
            fecharModal();
        }
    });

    reservouFeedbackForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const feedback = {
            target: 'plataforma',
            idUsuario: usuarioLogado.id,
            nomeUsuario: isRestaurante ? usuarioLogado.nome : usuarioLogado.nome,
            mensagem: reservouFeedbackMessage.value,
            data: new Date().toISOString()
        };
        enviarFeedback(feedback);
        fecharModal();
    });
});
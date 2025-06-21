document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const params = new URLSearchParams(window.location.search);
    const restauranteId = params.get('id');

    if (!restauranteId) {
        bloquearAcesso('ID do restaurante não fornecido na URL.');
        return;
    }
    if (!usuarioLogado || usuarioLogado.type !== 'restaurante' || usuarioLogado.id !== restauranteId) {
        bloquearAcesso('Você não tem permissão para acessar esta página.');
        return;
    }

    const container = document.getElementById('feedback-container');
    const restaurantNameEl = document.getElementById('restaurantName');
    const loadingSpinner = document.getElementById('loadingSpinner');

    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    const alertModalBody = document.getElementById('alertModalBody');
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const confirmModalBody = document.getElementById('confirmModalBody');
    const confirmOkBtn = document.getElementById('confirmOkBtn');

    async function carregarFeedbacks() {
        loadingSpinner.style.display = 'block';
        container.innerHTML = '';
        try {
            const [restaurantResponse, feedbacksResponse] = await Promise.all([
                fetch(`/restaurantes/${restauranteId}`),
                fetch(`/feedbacks?idRestaurante=${restauranteId}`)
            ]);

            if (!restaurantResponse.ok) throw new Error('Restaurante não encontrado.');
            if (!feedbacksResponse.ok) throw new Error('Falha ao buscar feedbacks.');

            const restaurante = await restaurantResponse.json();
            const feedbacks = await feedbacksResponse.json();

            restaurantNameEl.textContent = `para ${restaurante.infoCadastro.nome}`;
            
            if (feedbacks.length === 0) {
                container.innerHTML = '<div class="col-12"><p class="text-center p-4 bg-white rounded shadow-sm">Nenhum feedback para este restaurante ainda.</p></div>';
                return;
            }

            feedbacks
                .sort((a, b) => new Date(b.data) - new Date(a.data))
                .forEach(renderizarFeedback);

        } catch (error) {
            showCustomAlert(error.message);
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    function renderizarFeedback(feedback) {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card feedback-card h-100">
                <div class="card-body">
                    <button class="btn-excluir" data-id="${feedback.id}" title="Excluir">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <h5 class="card-title">${feedback.target}</h5>
                    <p class="card-text">"${feedback.mensagem}"</p>
                    <small class="text-muted d-block text-end mt-2">${new Date(feedback.data).toLocaleDateString()}</small>
                </div>
            </div>
        `;
        container.appendChild(col);

        col.querySelector('.btn-excluir').addEventListener('click', async function () {
            const idFeedback = this.getAttribute('data-id');
            const confirmed = await showCustomConfirm('Tem certeza que deseja excluir este feedback?');
            if (confirmed) {
                excluirFeedback(idFeedback);
            }
        });
    }

    async function excluirFeedback(idFeedback) {
        try {
            const response = await fetch(`/feedbacks/${idFeedback}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir o feedback.');
            
            showCustomAlert('Feedback excluído com sucesso!');
            await carregarFeedbacks();
        } catch(error) {
            showCustomAlert(error.message);
        }
    }

    function configurarLinksLaterais() {
        document.getElementById('profileLink').href = `pagina-admin.html?id=${restauranteId}`;
        document.getElementById('reservasLink').href = `reservas.html?id=${restauranteId}`;
        document.getElementById('editMenuLink').href = `editor-cardapio.html?id=${restauranteId}`;
    }

    function bloquearAcesso(message) {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: sans-serif; color: #333;">
                <h1 style="color: #8B0000;">Acesso Negado</h1>
                <p style="font-size: 1.2rem;">${message}</p>
                <a href="../../home.html" style="display: inline-block; padding: 12px 25px; background-color: #8B0000; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
                    Voltar para a Home
                </a>
            </div>
        `;
    }

    function showCustomAlert(message) {
        alertModalBody.textContent = message;
        alertModal.show();
    }

    function showCustomConfirm(message) {
        return new Promise((resolve) => {
            confirmModalBody.textContent = message;
            confirmModal.show();
            const onConfirm = () => { confirmModal.hide(); resolve(true); };
            const onHide = () => { confirmOkBtn.removeEventListener('click', onConfirm); resolve(false); };
            confirmOkBtn.addEventListener('click', onConfirm, { once: true });
            confirmModal._element.addEventListener('hidden.bs.modal', onHide, { once: true });
        });
    }

    configurarLinksLaterais();
    carregarFeedbacks();
});
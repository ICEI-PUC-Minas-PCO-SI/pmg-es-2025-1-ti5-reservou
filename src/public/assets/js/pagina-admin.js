document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const params = new URLSearchParams(window.location.search);
    const restauranteIdDaUrl = params.get('id');

    if (!usuarioLogado || usuarioLogado.type !== 'restaurante') {
        bloquearAcesso('Acesso restrito. Por favor, faça login como um restaurante.');
        return;
    }
    if (!restauranteIdDaUrl) {
        window.location.replace(`pagina-admin.html?id=${usuarioLogado.id}`);
        return;
    }
    if (usuarioLogado.id !== restauranteIdDaUrl) {
        bloquearAcesso('Você não tem permissão para acessar o painel de outro restaurante.');
        return;
    }
    
    const nomeRestauranteSpan = document.getElementById('restaurantName');
    let restauranteAtual = null;
    let novaFotoBase64 = null;
    
    const alertModal = new bootstrap.Modal(document.getElementById('adminAlertModal'));
    const alertModalBody = document.getElementById('adminAlertBody');
    const confirmModal = new bootstrap.Modal(document.getElementById('adminConfirmModal'));
    const confirmModalBody = document.getElementById('adminConfirmBody');
    const confirmOkBtn = document.getElementById('adminConfirmOkBtn');

    function configurarLinksLaterais() {
        document.getElementById('profileLink').href = `pagina-admin.html?id=${restauranteIdDaUrl}`;
        document.getElementById('reservasLink').href = `reservas.html?id=${restauranteIdDaUrl}`;
        document.getElementById('editMenuLink').href = `editor-cardapio.html?id=${restauranteIdDaUrl}`;
        document.getElementById('viewFeedbacksLink').href = `ver-fb.html?id=${restauranteIdDaUrl}`;
    }

    async function carregarDadosDoRestaurante() {
        try {
            const response = await fetch(`/restaurantes/${restauranteIdDaUrl}`);
            if (!response.ok) throw new Error('Restaurante não encontrado.');
            restauranteAtual = await response.json();
            
            preencherFormulario(restauranteAtual.infoCadastro);
            nomeRestauranteSpan.textContent = restauranteAtual.infoCadastro.nome;
        } catch (error) {
            bloquearAcesso(error.message);
        }
    }

    function preencherFormulario(info) {
        document.getElementById('nome').value = info.nome || '';
        document.getElementById('email').value = info.email || '';
        document.getElementById('categoria').value = info.categoria || '';
        document.getElementById('capacidade').value = info.capacidade || '';
        document.getElementById('telefone').value = info.telefone || '';
        document.getElementById('endereco').value = info.endereco || '';
        
        const imageUrl = info.imagemUrl || '../img/placeholder.png';
        if (imageUrl.startsWith('assets/')) {
            document.getElementById('restaurantImagePreview').src = `../../${imageUrl}`;
        } else {
            document.getElementById('restaurantImagePreview').src = imageUrl;
        }
    }

    async function salvarAlteracoes(evento) {
        evento.preventDefault();
        
        const dadosParaAtualizar = { ...restauranteAtual.infoCadastro };
        dadosParaAtualizar.nome = document.getElementById('nome').value;
        dadosParaAtualizar.email = document.getElementById('email').value;
        dadosParaAtualizar.categoria = document.getElementById('categoria').value;
        dadosParaAtualizar.capacidade = parseInt(document.getElementById('capacidade').value);
        dadosParaAtualizar.telefone = document.getElementById('telefone').value;
        dadosParaAtualizar.endereco = document.getElementById('endereco').value;
        
        if (novaFotoBase64) {
            dadosParaAtualizar.imagemUrl = novaFotoBase64;
        }

        const novaSenha = document.getElementById('senha').value;
        if (novaSenha) {
            dadosParaAtualizar.password = novaSenha;
        }

        try {
            const response = await fetch(`/restaurantes/${restauranteIdDaUrl}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ infoCadastro: dadosParaAtualizar })
            });
            if (!response.ok) throw new Error('Falha ao salvar as alterações.');
            
            showCustomAlert('Informações salvas com sucesso!');
            document.getElementById('restaurantName').textContent = dadosParaAtualizar.nome;
            novaFotoBase64 = null;
            document.getElementById('senha').value = '';
        } catch (error) {
            showCustomAlert(error.message);
        }
    }

    function bloquearAcesso(message) {
        document.body.innerHTML = `<div style="text-align: center; padding: 50px; font-family: sans-serif; color: #333;"><h1 style="color: #8B0000;">Acesso Negado</h1><p style="font-size: 1.2rem;">${message}</p><a href="../../home.html" style="display: inline-block; padding: 12px 25px; background-color: #8B0000; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">Voltar para a Home</a></div>`;
    }

    async function cancelarEdicao() {
        const confirmed = await showCustomConfirm('Deseja descartar as alterações não salvas?');
        if (confirmed) {
            window.location.reload();
        }
    }

    function preVisualizarImagem(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('restaurantImagePreview').src = e.target.result;
                novaFotoBase64 = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    function showCustomAlert(message) {
        alertModalBody.textContent = message;
        alertModal.show();
    }

    function showCustomConfirm(message) {
        return new Promise((resolve) => {
            confirmModalBody.textContent = message;
            confirmModal.show();
            const modalEl = document.getElementById('adminConfirmModal');

            const handleConfirm = () => {
                confirmModal.hide();
                resolve(true);
            };
            const handleCancel = () => {
                resolve(false);
            };

            confirmOkBtn.addEventListener('click', handleConfirm, { once: true });
            modalEl.addEventListener('hidden.bs.modal', handleCancel, { once: true });
        });
    }

    function configurarEventListeners() {
        document.getElementById('restaurantForm').addEventListener('submit', salvarAlteracoes);
        document.getElementById('fileInput').addEventListener('change', (e) => preVisualizarImagem(e.target));
        document.getElementById('cancelButton').addEventListener('click', cancelarEdicao);
    }
    
    configurarLinksLaterais();
    carregarDadosDoRestaurante();
    configurarEventListeners();
});
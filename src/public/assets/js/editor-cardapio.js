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

    const restaurantNameSpan = document.getElementById('restaurantName');
    const menuEditorDiv = document.getElementById('menuEditor');
    const loadingDiv = document.getElementById('loading');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    
    const itemModalEl = document.getElementById('itemModal');
    const itemModal = new bootstrap.Modal(itemModalEl);
    const itemForm = document.getElementById('itemForm');

    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    const alertModalBody = document.getElementById('alertModalBody');
    const confirmModalEl = document.getElementById('confirmModal');
    const confirmModal = new bootstrap.Modal(confirmModalEl);
    const confirmModalBody = document.getElementById('confirmModalBody');
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    const promptModalEl = document.getElementById('promptModal');
    const promptModal = new bootstrap.Modal(promptModalEl);
    const promptForm = document.getElementById('promptForm');
    const promptInput = document.getElementById('promptInput');
    const promptModalMessage = document.getElementById('promptModalMessage');
    
    let restauranteData = null;

    async function inicializar() {
        configurarLinksLaterais();
        try {
            loadingDiv.style.display = 'flex';
            menuEditorDiv.style.display = 'none';
            const response = await fetch(`/restaurantes/${restauranteId}`);
            if (!response.ok) throw new Error('Restaurante não encontrado');
            restauranteData = await response.json();

            if (restauranteData?.infoCadastro && restauranteData?.mapaRestaurante?.grid) {
                restaurantNameSpan.textContent = restauranteData.infoCadastro.nome;
                renderizarCardapioCompleto();
                menuEditorDiv.style.display = 'block';
            } else {
                throw new Error('Os dados do restaurante estão incompletos ou corrompidos.');
            }
        } catch (error) {
            console.error(error);
            showCustomAlert('Erro: ' + error.message);
        } finally {
            loadingDiv.style.display = 'none';
        }
    }

    function renderizarCardapioCompleto() {
        menuEditorDiv.innerHTML = '';
        const cardapio = restauranteData.cardapio || {};
        const categorias = Object.keys(cardapio).sort();

        if (categorias.length > 0) {
            categorias.forEach(cat => {
                const categoriaDiv = criarCategoriaDiv(cat, cardapio[cat]);
                menuEditorDiv.appendChild(categoriaDiv);
            });
        }
    }
    
    function criarCategoriaDiv(nomeCategoria, itens) {
        const div = document.createElement('div');
        div.className = 'category-section';
        div.innerHTML = `
            <div class="category-header">
                <h3>${formatarNomeCategoria(nomeCategoria)}</h3>
                <div class="category-actions">
                    <button class="btn btn-sm btn-outline-light" data-action="add-item" data-category="${nomeCategoria}">+ Item</button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete-category" data-category="${nomeCategoria}"><i class="bi bi-trash-fill"></i></button>
                </div>
            </div>
            <div class="item-list">
                ${itens.map((item, index) => criarItemHtml(item, nomeCategoria, index)).join('') || '<p class="text-muted text-center p-3">Nenhum item nesta categoria.</p>'}
            </div>
        `;
        return div;
    }

    function criarItemHtml(item, categoria, index) {
        return `
            <div class="menu-item d-flex justify-content-between align-items-center">
                <div class="item-details">
                    <h5>${item.nome}</h5>
                    <p class="text-muted mb-1">${item.descrição}</p>
                    <p class="price mb-0">${formatarPreco(item.preço)}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-edit-item" data-action="edit-item" data-category="${categoria}" data-index="${index}"><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn btn-sm btn-delete-item" data-action="delete-item" data-category="${categoria}" data-index="${index}"><i class="bi bi-trash-fill"></i></button>
                </div>
            </div>
        `;
    }
    
    addCategoryBtn.addEventListener('click', async () => {
        const nomeCategoria = await showCustomPrompt("Digite o nome da nova categoria (sem espaços, ex: PratosPrincipais):");
        if (nomeCategoria && nomeCategoria.trim()) {
            const chaveCategoria = nomeCategoria.trim().replace(/\s+/g, '');
            if (restauranteData.cardapio[chaveCategoria]) {
                showCustomAlert('Essa categoria já existe.');
                return;
            }
            restauranteData.cardapio[chaveCategoria] = [];
            await salvarErenderizar();
        }
    });

    menuEditorDiv.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const { action, category, index } = target.dataset;
        if (action === 'add-item') {
            abrirModalItem(category);
        } else if (action === 'edit-item') {
            const item = restauranteData.cardapio[category][index];
            abrirModalItem(category, index, item);
        } else if (action === 'delete-item') {
            const item = restauranteData.cardapio[category][index];
            const confirmed = await showCustomConfirm(`Tem certeza que deseja remover o item "${item.nome}"?`);
            if (confirmed) {
                restauranteData.cardapio[category].splice(index, 1);
                await salvarErenderizar();
            }
        } else if (action === 'delete-category') {
             const confirmed = await showCustomConfirm(`Tem certeza que deseja remover toda a categoria "${formatarNomeCategoria(category)}" e seus itens?`);
             if (confirmed) {
                delete restauranteData.cardapio[category];
                await salvarErenderizar();
            }
        }
    });
    
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('itemName').value;
        const descricao = document.getElementById('itemDescription').value;
        const preco = parseFloat(document.getElementById('itemPrice').value);
        const categoria = document.getElementById('itemCategory').value;
        const index = document.getElementById('itemIndex').value;
        if(isNaN(preco)) {
            showCustomAlert('Por favor, insira um preço válido.');
            return;
        }
        const novoItem = { nome, "descrição": descricao, "preço": preco };
        if (index !== null && index !== '') {
            restauranteData.cardapio[categoria][index] = novoItem;
        } else { 
            if (!restauranteData.cardapio[categoria]) restauranteData.cardapio[categoria] = [];
            restauranteData.cardapio[categoria].push(novoItem);
        }
        salvarErenderizar();
        itemModal.hide();
    });

    function abrirModalItem(categoria, index = null, item = null) {
        itemForm.reset();
        document.getElementById('itemCategory').value = categoria;
        document.getElementById('itemIndex').value = index !== null ? index : '';
        if (item) {
            document.getElementById('itemModalLabel').textContent = "Editar Item";
            document.getElementById('itemName').value = item.nome;
            document.getElementById('itemDescription').value = item.descrição;
            document.getElementById('itemPrice').value = parsePreco(item.preço);
        } else {
            document.getElementById('itemModalLabel').textContent = "Adicionar Novo Item";
        }
        itemModal.show();
    }
    
    async function salvarErenderizar() {
        try {
            loadingDiv.style.display = 'flex';
            const response = await fetch(`/restaurantes/${restauranteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardapio: restauranteData.cardapio }),
            });
            if (!response.ok) throw new Error('Falha ao salvar o cardápio.');
            renderizarCardapioCompleto();
        } catch (error) {
            showCustomAlert('Erro: ' + error.message);
        } finally {
            loadingDiv.style.display = 'none';
        }
    }
    
    function configurarLinksLaterais() {
        document.getElementById('profileLink').href = `pagina-admin.html?id=${restauranteId}`;
        document.getElementById('reservasLink').href = `reservas.html?id=${restauranteId}`;
        document.getElementById('editMenuLink').href = `editor-cardapio.html?id=${restauranteId}`;
        document.getElementById('viewFeedbacksLink').href = `ver-fb.html?id=${restauranteId}`;
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
            confirmModalEl.addEventListener('hidden.bs.modal', onHide, { once: true });
        });
    }

    function showCustomPrompt(message) {
        return new Promise((resolve) => {
            promptModalMessage.textContent = message;
            promptInput.value = '';
            promptModal.show();
            promptModalEl.addEventListener('shown.bs.modal', () => promptInput.focus(), { once: true });
            const handleSubmit = (event) => {
                event.preventDefault();
                resolve(promptInput.value);
                promptModal.hide();
            };
            const handleHide = () => {
                promptForm.removeEventListener('submit', handleSubmit);
                resolve(null);
            };
            promptForm.addEventListener('submit', handleSubmit, { once: true });
            promptModalEl.addEventListener('hidden.bs.modal', handleHide, { once: true });
        });
    }

    function formatarPreco(valor) {
        if (typeof valor !== 'number') {
            const numero = parseFloat(valor);
            if (isNaN(numero)) return valor;
            valor = numero;
        }
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }

    function parsePreco(valor) {
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
            const numeroLimpo = valor.replace(/[^\d,.]/g, '').replace(',', '.');
            const numero = parseFloat(numeroLimpo);
            return isNaN(numero) ? 0 : numero;
        }
        return 0;
    }
    
    function formatarNomeCategoria(nome) {
        if (!nome) return '';
        const comEspacos = nome.replace(/([A-Z])/g, ' $1');
        return comEspacos.charAt(0).toUpperCase() + comEspacos.slice(1);
    }
    
    inicializar();
});
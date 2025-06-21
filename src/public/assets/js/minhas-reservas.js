document.addEventListener('DOMContentLoaded', () => {
    const API_RESERVAS_URL = '/reservas';
    const API_RESTAURANTES_URL = '/restaurantes';
  
    const tabelaReservasBody = document.getElementById('tabela-reservas');
    const containerReservas = document.getElementById('reservas-container');
    const confirmacaoModal = new bootstrap.Modal(document.getElementById('confirmacaoModal'));
    const btnConfirmarCancelamento = document.getElementById('confirmar-cancelamento-btn');
  
    let reservaIdParaCancelar = null;
  
    async function init() {
    
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  
        if (!usuarioLogado || usuarioLogado.type !== 'usuario') {
            mostrarMensagemDeErro("Você precisa estar logado como usuário para ver suas reservas.");
            return;
        }
  
        carregarEExibirReservas(usuarioLogado.id);
    }
  
    /**
     * Carrega os dados do servidor 
     * @param {number} idUsuario 
     */
    async function carregarEExibirReservas(idUsuario) {
        tabelaReservasBody.innerHTML = `<tr><td colspan="8" class="text-center">Carregando...</td></tr>`;
    
        try {
            const [restaurantesResponse, reservasResponse] = await Promise.all([
                fetch(API_RESTAURANTES_URL),
                fetch(API_RESERVAS_URL) 
            ]);

            if (!restaurantesResponse.ok || !reservasResponse.ok) {
                throw new Error('Falha ao carregar os dados do servidor.');
            }
    
            const restaurantes = await restaurantesResponse.json();
            const todasReservas = await reservasResponse.json();
            
            const reservasDoUsuario = todasReservas.filter(reserva => {
                const reservaUserId = String(reserva.idUsuario);
                const usuarioId = String(idUsuario);
                const pertenceAoUsuario = reservaUserId === usuarioId;
                return pertenceAoUsuario;
            });
    
            const mapaRestaurantes = restaurantes.reduce((map, restaurante) => {
                map[restaurante.id] = restaurante.infoCadastro?.nome || restaurante.nome || 'Nome não encontrado';
                return map;
            }, {});
    
            const reservasAtivas = reservasDoUsuario.filter(reserva => 
                !reserva.status || reserva.status.toLowerCase() !== 'cancelada'
            );

            renderizarTabela(reservasAtivas, mapaRestaurantes);
    
        } catch (error) {
            console.error(" Erro ao carregar reservas:", error);
            mostrarMensagemDeErro("Não foi possível carregar suas reservas. Tente novamente mais tarde.");
        }
    }
  
    /**
     * Renderiza as linhas da tabela com os dados
     * @param {Array} reservas - Lista de reservas ativas
     * @param {Object} mapaRestaurantes - Mapeando ID
     */
    function renderizarTabela(reservas, mapaRestaurantes) {
        tabelaReservasBody.innerHTML = '';
  
        if (reservas.length === 0) {
            tabelaReservasBody.innerHTML = `<tr><td colspan="8" class="text-center">Nenhuma reserva ativa encontrada.</td></tr>`;
            return;
        }
  
        reservas.forEach(reserva => {
            const nomeRestaurante = mapaRestaurantes[reserva.idRestaurante] || 'Restaurante não encontrado';
            const linha = document.createElement('tr');
            linha.id = `reserva-${reserva.id}`;
            linha.innerHTML = `
                <td>${nomeRestaurante}</td>
                <td>${formatarStatus(reserva.status)}</td>
                <td>${new Date(reserva.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td>${reserva.horario}</td>
                <td>Mesa ${reserva.numeroMesa}</td>
                <td>${reserva.qtdPessoas}</td>
                <td>${reserva.estacionamento}</td>
                <td>
                    <button class="btn btn-sm btn-danger cancelar-btn" data-id="${reserva.id}" data-bs-toggle="modal" data-bs-target="#confirmacaoModal">
                        <i class="bi bi-trash"></i> Cancelar
                    </button>
                </td>
            `;
            tabelaReservasBody.appendChild(linha);
        });
    }
  
    function formatarStatus(status) {
        if (!status) return `<span class="badge bg-secondary">Indefinido</span>`;
        switch (status.toLowerCase()) {
            case 'confirmada': return '<span class="badge bg-success">Confirmada</span>';
            case 'pendente': return '<span class="badge bg-warning text-dark">Pendente</span>';
            default: return `<span class="badge bg-secondary">${status}</span>`;
        }
    }
  
    function mostrarMensagemDeErro(mensagem) {
        containerReservas.innerHTML = `<div class="alert alert-danger text-center">${mensagem}</div>`;
    }
  
    /**
     * Cancelar reserva PATCH
     * @param {string|number} id - O ID da reserva a cancelar
     */
    async function cancelarReserva(id) {
        try {
            const response = await fetch(`${API_RESERVAS_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Cancelada' }),
            });
  
            if (!response.ok) {
                throw new Error('Falha ao cancelar a reserva no servidor.');
            }
  
            const linhaParaRemover = document.getElementById(`reserva-${id}`);
            if (linhaParaRemover) {
                linhaParaRemover.remove();
            }
  
            if (tabelaReservasBody.children.length === 0) {
                tabelaReservasBody.innerHTML = `<tr><td colspan="8" class="text-center">Nenhuma reserva ativa encontrada.</td></tr>`;
            }
  
        } catch (error) {
            console.error("Erro ao cancelar reserva:", error);
            alert("Não foi possível cancelar a reserva. Tente novamente.");
        }
    }
  
    tabelaReservasBody.addEventListener('click', (event) => {
        const cancelarBtn = event.target.closest('.cancelar-btn');
        if (cancelarBtn) {
            reservaIdParaCancelar = cancelarBtn.dataset.id;
            confirmacaoModal.show();
        }
    });
  
    btnConfirmarCancelamento.addEventListener('click', () => {
        if (reservaIdParaCancelar !== null) {
            cancelarReserva(reservaIdParaCancelar);
            confirmacaoModal.hide();
            reservaIdParaCancelar = null;
        }
    });
  
    init();
  });
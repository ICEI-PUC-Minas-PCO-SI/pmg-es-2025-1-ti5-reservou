document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    let restauranteId = null;

    if (!usuarioLogado || usuarioLogado.type !== 'restaurante') {
        bloquearAcesso('Acesso restrito. Por favor, faça login como um restaurante.');
        return;
    } else {
        restauranteId = usuarioLogado.id;
        configurarLinksLaterais(restauranteId);
    }

    const listaReservasFuturas = document.getElementById('listaReservasFuturas');
    const listaReservasAntigas = document.getElementById('listaReservasAntigas');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const limparAntigasBtn = document.getElementById('limparAntigasBtn');
    
    const modalEditar = new bootstrap.Modal(document.getElementById('modalEditar'));
    const salvarBtn = document.getElementById('salvarEdicao');
    
    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    const alertModalBody = document.getElementById('alertModalBody');
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const confirmModalBody = document.getElementById('confirmModalBody');
    const confirmOkBtn = document.getElementById('confirmOkBtn');

    function configurarLinksLaterais(id) {
        document.getElementById('profileLink').href = `pagina-admin.html?id=${id}`;
        document.getElementById('reservasLink').href = `reservas.html?id=${id}`;
        document.getElementById('editMenuLink').href = `editor-cardapio.html?id=${id}`;
        document.getElementById('viewFeedbacksLink').href = `ver-fb.html?id=${id}`;
    }

    async function carregarReservas() {
        if(loadingSpinner) loadingSpinner.style.display = 'block';
        listaReservasFuturas.innerHTML = '';
        listaReservasAntigas.innerHTML = '';
        try {
            const [reservasResponse, usuariosResponse] = await Promise.all([
                fetch(`/reservas?idRestaurante=${restauranteId}`),
                fetch('/usuarios')
            ]);

            if (!reservasResponse.ok || !usuariosResponse.ok) {
                throw new Error('Falha ao buscar dados do servidor.');
            }

            const reservas = await reservasResponse.json();
            const usuarios = await usuariosResponse.json();
            
            const userMap = new Map(usuarios.map(user => [user.id, user.nome]));

            if (reservas.length === 0) {
                listaReservasFuturas.innerHTML = '<li class="list-group-item text-center p-4">Nenhuma reserva futura encontrada.</li>';
                listaReservasAntigas.innerHTML = '<li class="list-group-item text-center p-4">Nenhum histórico de reservas.</li>';
                return;
            }

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const reservasFuturas = [];
            const reservasAntigas = [];

            reservas.forEach(reserva => {
                const dataReserva = new Date(reserva.data.replace(/-/g, '\/'));
                if (dataReserva >= hoje) {
                    reservasFuturas.push(reserva);
                } else {
                    reservasAntigas.push(reserva);
                }
            });

            if(reservasFuturas.length > 0) {
                reservasFuturas
                    .sort((a, b) => new Date(`${a.data}T${a.horario}`) - new Date(`${b.data}T${b.horario}`))
                    .forEach(reserva => {
                        let nomeUsuario = 'Reserva Anônima';
                        if (reserva.idUsuario) {
                            nomeUsuario = userMap.get(String(reserva.idUsuario)) || 'Usuário não encontrado';
                        }
                        renderizarReserva(reserva, listaReservasFuturas, false, nomeUsuario);
                    });
            } else {
                listaReservasFuturas.innerHTML = '<li class="list-group-item text-center p-4">Nenhuma reserva futura encontrada.</li>';
            }

            if(reservasAntigas.length > 0) {
                reservasAntigas
                    .sort((a, b) => new Date(`${b.data}T${b.horario}`) - new Date(`${a.data}T${a.horario}`))
                    .forEach(reserva => {
                        let nomeUsuario = 'Reserva Anônima';
                        if (reserva.idUsuario) {
                            nomeUsuario = userMap.get(String(reserva.idUsuario)) || 'Usuário não encontrado';
                        }
                        renderizarReserva(reserva, listaReservasAntigas, true, nomeUsuario);
                    });
            } else {
                listaReservasAntigas.innerHTML = '<li class="list-group-item text-center p-4">Nenhum histórico de reservas.</li>';
            }

        } catch (error) {
            showCustomAlert(error.message);
        } finally {
            if(loadingSpinner) loadingSpinner.style.display = 'none';
        }
    }

    function renderizarReserva(reserva, lista, isAntiga = false, nomeUsuario = 'Não identificado') {
        const li = document.createElement('li');
        const statusClass = reserva.status ? reserva.status.toLowerCase() : 'pendente';
        li.className = `list-group-item d-flex justify-content-between align-items-center flex-wrap status-${statusClass}`;
        if(isAntiga) li.classList.add('reserva-antiga');
        
        li.innerHTML = `
          <div class="reserva-info me-3 mb-2 mb-md-0">
            <strong>Mesa ${reserva.numeroMesa}</strong> - 
            <span class="reserva-status ${statusClass}">${reserva.status || 'Pendente'}</span>
            <br>
            <small class="text-muted">
                <i class="bi bi-person-circle me-1"></i>${nomeUsuario} | 
                ${new Date(reserva.data.replace(/-/g, '\/')).toLocaleDateString()} às ${reserva.horario} | 
                ${reserva.qtdPessoas} pessoa(s)
            </small>
          </div>
          <div class="reserva-actions">
            <button class="btn btn-sm btn-edit" onclick="window.abrirModalEditar('${reserva.id}')">Editar</button>
            <button class="btn btn-sm btn-delete ms-2" onclick="window.excluirReserva('${reserva.id}')">Excluir</button>
          </div>
        `;
        lista.appendChild(li);
    }
    
    window.abrirModalEditar = async (id) => {
        try {
            const response = await fetch(`/reservas/${id}`);
            if (!response.ok) throw new Error('Reserva não encontrada.');
            const reserva = await response.json();
            document.getElementById('editId').value = reserva.id;
            document.getElementById('editStatus').value = reserva.status || 'Pendente';
            document.getElementById('editNumeroMesa').value = reserva.numeroMesa;
            document.getElementById('editQtdPessoas').value = reserva.qtdPessoas;
            document.getElementById('editData').value = reserva.data;
            document.getElementById('editHorario').value = reserva.horario;
            document.getElementById('editEstacionamento').value = reserva.estacionamento || 'Não';
            modalEditar.show();
        } catch (error) {
            showCustomAlert(error.message);
        }
    };

    salvarBtn.addEventListener('click', async () => {
        const id = document.getElementById('editId').value;
        const dadosAtualizados = {
            status: document.getElementById('editStatus').value,
            numeroMesa: parseInt(document.getElementById('editNumeroMesa').value, 10),
            qtdPessoas: parseInt(document.getElementById('editQtdPessoas').value, 10),
            data: document.getElementById('editData').value,
            horario: document.getElementById('editHorario').value,
            estacionamento: document.getElementById('editEstacionamento').value,
        };
        try {
            const response = await fetch(`/reservas/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAtualizados)
            });
            if (!response.ok) throw new Error('Falha ao salvar alterações.');
            modalEditar.hide();
            await carregarReservas();
            showCustomAlert('Reserva atualizada com sucesso!');
        } catch(error) {
            showCustomAlert(error.message);
        }
    });

    window.excluirReserva = async (id) => {
        const confirmed = await showCustomConfirm('Deseja realmente excluir esta reserva?');
        if (confirmed) {
            try {
                const response = await fetch(`/reservas/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao excluir a reserva.');
                await carregarReservas();
                showCustomAlert('Reserva excluída com sucesso.');
            } catch(error) {
                showCustomAlert(error.message);
            }
        }
    };

    async function limparReservasAntigas() {
        const confirmed = await showCustomConfirm('Isso excluirá permanentemente todas as reservas do histórico. Deseja continuar?');
        if (!confirmed) return;
        if(loadingSpinner) loadingSpinner.style.display = 'block';
        try {
            const response = await fetch(`/reservas?idRestaurante=${restauranteId}`);
            if (!response.ok) throw new Error('Falha ao buscar reservas.');
            const todasAsReservas = await response.json();
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const reservasAntigas = todasAsReservas.filter(r => new Date(r.data.replace(/-/g, '\/')) < hoje);
            if (reservasAntigas.length === 0) {
                showCustomAlert('Não há reservas antigas para limpar.');
                return;
            }
            await Promise.all(
                reservasAntigas.map(r => fetch(`/reservas/${r.id}`, { method: 'DELETE' }))
            );
            showCustomAlert(`${reservasAntigas.length} reserva(s) do histórico foram excluídas com sucesso.`);
            await carregarReservas();
        } catch (error) {
            showCustomAlert('Erro ao limpar reservas: ' + error.message);
        } finally {
            if(loadingSpinner) loadingSpinner.style.display = 'none';
        }
    }

    limparAntigasBtn.addEventListener('click', limparReservasAntigas);

    function bloquearAcesso(message) {
        document.body.innerHTML = `<div style="text-align: center; padding: 50px; font-family: sans-serif; color: #333;"><h1 style="color: #8B0000;">Acesso Negado</h1><p style="font-size: 1.2rem;">${message}</p><a href="../../home.html" style="display: inline-block; padding: 12px 25px; background-color: #8B0000; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">Voltar para a Home</a></div>`;
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

    carregarReservas();
});
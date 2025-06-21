document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const restauranteIdDaUrl = params.get('id');
    const editorToken = sessionStorage.getItem('editorToken');

    function bloquearAcesso(message, redirect = true) {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: sans-serif; color: #333;">
                <h1 style="color: #8B0000;">Acesso Bloqueado</h1>
                <p style="font-size: 1.2rem;">${message}</p>
                ${redirect ? `<a href="/home.html" style="display: inline-block; padding: 12px 25px; background-color: #8B0000; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">Voltar para a Home</a>` : ''}
            </div>
        `;
    }

    if (!restauranteIdDaUrl) {
        bloquearAcesso('ID do restaurante não fornecido na URL.');
        return;
    }

    if (!editorToken) {
        bloquearAcesso('Acesso negado. Esta página só pode ser acessada durante o processo de cadastro de um novo restaurante.');
        return;
    }

    try {
        const tokenData = JSON.parse(atob(editorToken));
        const agora = Date.now();
        const tokenAge = agora - tokenData.timestamp;
        const FIVE_MINUTES = 5 * 60 * 1000; 

        if (tokenData.restauranteId !== restauranteIdDaUrl) {
            throw new Error('Token inválido para este restaurante.');
        }

        if (tokenAge > FIVE_MINUTES) {
            throw new Error('Sessão expirada. O acesso ao editor é válido apenas por 5 minutos após o cadastro.');
        }

        if (tokenData.purpose !== 'new_restaurant_setup') {
            throw new Error('Token com propósito inválido.');
        }

    } catch (error) {
        sessionStorage.removeItem('editorToken');
        bloquearAcesso(`Acesso negado: ${error.message}`);
        return;
    }

    sessionStorage.removeItem('editorToken');

    const nomeRestauranteSpan = document.getElementById('nomeRestaurante');
    const gridContainer = document.getElementById('grid-container');
    const toolButtons = document.querySelectorAll('.tool-btn');
    const saveButton = document.getElementById('salvarMapa');
    const elementModal = new bootstrap.Modal(document.getElementById('elementModal'));
    const elementForm = document.getElementById('elementForm');
    const tableIdInput = document.getElementById('tableIdInput');
    const featureLabelInput = document.getElementById('featureLabelInput');
    const gridRowsInput = document.getElementById('gridRowsInput');
    const gridColsInput = document.getElementById('gridColsInput');
    
    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    const alertModalBody = document.getElementById('alertModalBody');
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const confirmModalBody = document.getElementById('confirmModalBody');
    const confirmOkBtn = document.getElementById('confirmOkBtn');

    let restauranteData = null;
    let activeTool = null;
    let targetCellInfo = null;
    let isDragging = false;
    let startCoords = null;

    async function inicializarEditor() {
        try {
            const response = await fetch(`/restaurantes/${restauranteIdDaUrl}`);
            if (!response.ok) throw new Error('Restaurante não encontrado.');
            
            restauranteData = await response.json();

            if (restauranteData?.infoCadastro && restauranteData?.mapaRestaurante?.grid) {
                nomeRestauranteSpan.textContent = restauranteData.infoCadastro.nome;
                gridRowsInput.value = restauranteData.mapaRestaurante.grid.rows;
                gridColsInput.value = restauranteData.mapaRestaurante.grid.columns;
                redesenharMapaCompleto();
            } else {
                throw new Error('Os dados do restaurante estão incompletos ou corrompidos.');
            }
        } catch (error) {
            console.error(error);
            showCustomAlert(error.message);
            bloquearAcesso(error.message, false);
        }
    }

    function redesenharMapaCompleto() {
        desenharGrade();
        renderizarTodosElementos();
    }

    function desenharGrade() {
        if (!restauranteData?.mapaRestaurante) return;
        const { rows, columns } = restauranteData.mapaRestaurante.grid;
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        for (let i = 0; i < rows * columns; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = Math.floor(i / columns) + 1;
            cell.dataset.col = (i % columns) + 1;
            gridContainer.appendChild(cell);
        }
    }

    function renderizarTodosElementos() {
        document.querySelectorAll('.map-element').forEach(el => el.remove());
        restauranteData.mapaRestaurante.elements?.forEach(el => renderizarElemento(el));
    }

    function renderizarElemento(elementData) {
        const elDiv = document.createElement('div');
        elDiv.classList.add('map-element');
        elDiv.style.gridRow = elementData.gridPosition.row;
        elDiv.style.gridColumn = elementData.gridPosition.col;
        if (elementData.type === 'table') {
            elDiv.classList.add('table', `shape-${elementData.shape}`);
            elDiv.textContent = elementData.id;
        } else {
            elDiv.textContent = elementData.label;
            elDiv.classList.add('feature');
        }
        gridContainer.appendChild(elDiv);
    }

    async function handleGridResize() {
        const newRows = parseInt(gridRowsInput.value, 10);
        const newCols = parseInt(gridColsInput.value, 10);
        const oldRows = restauranteData.mapaRestaurante.grid.rows;
        const oldCols = restauranteData.mapaRestaurante.grid.columns;
        if (isNaN(newRows) || isNaN(newCols) || newRows < 1 || newCols < 1) return;
        
        const orphans = restauranteData.mapaRestaurante.elements.filter(el => {
            const rowPos = parsePos(el.gridPosition.row);
            const colPos = parsePos(el.gridPosition.col);
            return rowPos.end > newRows + 1 || colPos.end > newCols + 1;
        });

        if (orphans.length > 0) {
            const confirmed = await showCustomConfirm(`Atenção: Reduzir a grade irá remover ${orphans.length} elemento(s). Deseja continuar?`);
            if (!confirmed) {
                gridRowsInput.value = oldRows;
                gridColsInput.value = oldCols;
                return;
            }
        }
        
        restauranteData.mapaRestaurante.elements = restauranteData.mapaRestaurante.elements.filter(el => !orphans.includes(el));
        restauranteData.mapaRestaurante.grid.rows = newRows;
        restauranteData.mapaRestaurante.grid.columns = newCols;
        redesenharMapaCompleto();
    }
    
    function adicionarElemento(event) {
        event.preventDefault();
        if (!activeTool || !targetCellInfo) return;
        let finalGridPosition;
        if (activeTool.dataset.tool === 'table') {
            const r = parseInt(targetCellInfo.row, 10);
            const c = parseInt(targetCellInfo.col, 10);
            finalGridPosition = { row: `${r} / ${r + 1}`, col: `${c} / ${c + 1}` };
        } else {
            finalGridPosition = { row: targetCellInfo.row, col: targetCellInfo.col };
        }
        const newElement = { type: activeTool.dataset.tool, gridPosition: finalGridPosition };
        if (newElement.type === 'table') {
            if (!tableIdInput.value) { showCustomAlert("O número da mesa é obrigatório."); return; }
            newElement.id = parseInt(tableIdInput.value, 10);
            newElement.capacity = parseInt(activeTool.dataset.capacity, 10);
            newElement.shape = activeTool.dataset.shape;
        } else if (newElement.type === 'feature') {
            if (!featureLabelInput.value) { showCustomAlert("O rótulo é obrigatório."); return; }
            newElement.label = featureLabelInput.value;
        }
        restauranteData.mapaRestaurante.elements.push(newElement);
        renderizarElemento(newElement);
        elementModal.hide();
        elementForm.reset();
        desativarFerramentas();
    }
    
    function ativarFerramenta(toolBtn) {
        desativarFerramentas();
        activeTool = toolBtn;
        toolBtn.classList.add('active');
        gridContainer.dataset.toolActive = activeTool.dataset.tool;
    }
    
    function desativarFerramentas() {
        toolButtons.forEach(btn => btn.classList.remove('active'));
        activeTool = null;
        gridContainer.removeAttribute('data-tool-active');
    }
    
    function parsePos(posStr) {
        const parts = posStr.split(' / ');
        return { start: parseInt(parts[0], 10), end: parseInt(parts[1], 10) };
    }

    function isAreaOccupied(areaToCheck) {
        if (!restauranteData.mapaRestaurante.elements) return false;
        const r1 = { start: areaToCheck.rowStart, end: areaToCheck.rowEnd };
        const c1 = { start: areaToCheck.colStart, end: areaToCheck.colEnd };
        for (const element of restauranteData.mapaRestaurante.elements) {
            const r2 = parsePos(element.gridPosition.row);
            const c2 = parsePos(element.gridPosition.col);
            const rowOverlaps = r1.start < r2.end && r1.end > r2.start;
            const colOverlaps = c1.start < c2.end && c1.end > c2.start;
            if (rowOverlaps && colOverlaps) return true;
        }
        return false;
    }

    function handleGridClick(event) {
        if (activeTool && activeTool.dataset.tool === 'table' && event.target.classList.contains('grid-cell')) {
            const r = parseInt(event.target.dataset.row, 10);
            const c = parseInt(event.target.dataset.col, 10);
            if (isAreaOccupied({ rowStart: r, rowEnd: r + 1, colStart: c, colEnd: c + 1 })) {
                showCustomAlert('Este local já está ocupado!');
                return;
            }
            targetCellInfo = event.target.dataset;
            elementModal.show();
            document.getElementById('form-table-id').style.display = 'block';
            document.getElementById('form-feature-label').style.display = 'none';
            tableIdInput.required = true;
            featureLabelInput.required = false;
        }
    }

    function handleMouseDown(event) {
        if (activeTool?.dataset.tool !== 'feature' || !event.target.classList.contains('grid-cell')) return;
        event.preventDefault();
        isDragging = true;
        startCoords = { row: parseInt(event.target.dataset.row, 10), col: parseInt(event.target.dataset.col, 10) };
        updateCellHighlight(event);
    }

    function handleMouseMove(event) {
        if (!isDragging) return;
        updateCellHighlight(event);
    }

    function handleMouseUp(event) {
        if (!isDragging) return;
        isDragging = false;
        const endCell = event.target.closest('.grid-cell');
        clearCellHighlight();
        if (!endCell) return;
        const endCoords = { row: parseInt(endCell.dataset.row, 10), col: parseInt(endCell.dataset.col, 10) };
        const rowStart = Math.min(startCoords.row, endCoords.row);
        const rowEnd = Math.max(startCoords.row, endCoords.row) + 1;
        const colStart = Math.min(startCoords.col, endCoords.col);
        const colEnd = Math.max(startCoords.col, endCoords.col) + 1;
        if (isAreaOccupied({ rowStart, rowEnd, colStart, colEnd })) {
            showCustomAlert('A área selecionada sobrepõe um elemento existente!');
            return;
        }
        targetCellInfo = { row: `${rowStart} / ${rowEnd}`, col: `${colStart} / ${colEnd}` };
        elementModal.show();
        document.getElementById('form-table-id').style.display = 'none';
        document.getElementById('form-feature-label').style.display = 'block';
        tableIdInput.required = false;
        featureLabelInput.required = true;
    }
    
    function clearCellHighlight() {
        document.querySelectorAll('.grid-cell.cell-highlighted').forEach(cell => {
            cell.classList.remove('cell-highlighted');
        });
    }

    function updateCellHighlight(event) {
        clearCellHighlight();
        const currentCell = event.target.closest('.grid-cell');
        if (!currentCell) return;
        const { row: currentRow, col: currentCol } = currentCell.dataset;
        const rowStart = Math.min(startCoords.row, parseInt(currentRow, 10));
        const rowEnd = Math.max(startCoords.row, parseInt(currentRow, 10));
        const colStart = Math.min(startCoords.col, parseInt(currentCol, 10));
        const colEnd = Math.max(startCoords.col, parseInt(currentCol, 10));
        document.querySelectorAll('.grid-cell').forEach(cell => {
            const r = parseInt(cell.dataset.row, 10);
            const c = parseInt(cell.dataset.col, 10);
            if (r >= rowStart && r <= rowEnd && c >= colStart && c <= colEnd) {
                cell.classList.add('cell-highlighted');
            }
        });
    }

    async function salvarMapaNoServidor() {
        try {
            const response = await fetch(`/restaurantes/${restauranteIdDaUrl}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mapaRestaurante: restauranteData.mapaRestaurante }),
            });
            if (!response.ok) throw new Error('Falha ao salvar o mapa.');
            showCustomAlert('Mapa salvo com sucesso!');
        } catch (error) {
            console.error(error);
            showCustomAlert(`Erro ao salvar: ${error.message}`);
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
            const modalEl = document.getElementById('confirmModal');
            
            const onConfirm = () => {
                confirmModal.hide();
                resolve(true);
            };
            const onCancel = () => {
            };

            const onHidden = () => {
                confirmOkBtn.removeEventListener('click', onConfirm);
                resolve(false);
            };

            confirmOkBtn.addEventListener('click', onConfirm, { once: true });
            modalEl.addEventListener('hidden.bs.modal', onHidden, { once: true });
        });
    }

    toolButtons.forEach(btn => btn.addEventListener('click', () => ativarFerramenta(btn)));
    gridContainer.addEventListener('click', handleGridClick);
    gridContainer.addEventListener('mousedown', handleMouseDown);
    gridContainer.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    elementForm.addEventListener('submit', adicionarElemento);
    saveButton.addEventListener('click', salvarMapaNoServidor);
    gridRowsInput.addEventListener('input', handleGridResize);
    gridColsInput.addEventListener('input', handleGridResize);

    inicializarEditor();
});
let currentReservation = {
    tableNumber: null,
    tableCapacity: 0,
    selectedDate: '',
    selectedTime: '',
};

let allRestaurantReservations = []; 
let restaurantData = {}; 
let usuarioLogado = null;
let idRestaurante = null;

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

let reservationModal, confirmationModal, warningModal;

document.addEventListener('DOMContentLoaded', () => {
    reservationModal = new bootstrap.Modal(document.getElementById('reservationModal'));
    confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    warningModal = new bootstrap.Modal(document.getElementById('warningModal'));
    
    const params = new URLSearchParams(window.location.search);
    idRestaurante = params.get('id');
    usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!idRestaurante) {
        document.body.innerHTML = '<h1 class="text-center text-danger mt-5">ID do restaurante não fornecido.</h1>';
        return;
    }

    fetchDataAndInitialize();
    addEventListeners();
});

async function fetchDataAndInitialize() {
    try {
        const [restaurantResponse, reservationsResponse] = await Promise.all([
            fetch(`/restaurantes/${idRestaurante}`),
            fetch(`/reservas?idRestaurante=${idRestaurante}`)
        ]);

        if (!restaurantResponse.ok) throw new Error('Restaurante não encontrado.');
        
        restaurantData = await restaurantResponse.json();
        allRestaurantReservations = await reservationsResponse.json();

        displayRestaurantName(restaurantData.infoCadastro.nome);
        displayRestaurantCategory(restaurantData.infoCadastro.categoria);
        displayRestaurantBanner(restaurantData.infoCadastro.imagemUrl);
        displayRestaurantInfo(restaurantData.infoCadastro);
        renderMenu(restaurantData.cardapio);
        renderRestaurantLayout(restaurantData.mapaRestaurante);
        generateCalendar(currentMonth, currentYear);

    } catch (error) {
        console.error('Falha ao carregar dados:', error);
        document.getElementById('restaurant-map-container').innerHTML = `<p class="text-danger">${error.message}</p>`;
        document.getElementById('restaurant-name').textContent = 'Erro ao carregar';
    }
}

function displayRestaurantName(name) {
    document.getElementById('restaurant-name').textContent = name;
}

function displayRestaurantCategory(category) {
    document.getElementById('restaurant-category').textContent = category || '';
}

function displayRestaurantBanner(imageUrl) {
    const bannerImage = document.getElementById('restaurant-banner-image');
    if (bannerImage && imageUrl) {
        bannerImage.src = imageUrl;
    }
}

function displayRestaurantInfo(info) {
    if (!info) return;
    document.getElementById('info-endereco').textContent = info.endereco || 'Não informado';
    document.getElementById('info-telefone').textContent = info.telefone || 'Não informado';
    document.getElementById('info-email').textContent = info.email || 'Não informado';
    document.getElementById('info-capacidade').textContent = `Capacidade para ${info.capacidade} pessoas` || 'Não informada';
}

function renderRestaurantLayout(mapaData) {
    const container = document.getElementById('restaurant-map-container');
    if (!container || !mapaData || !mapaData.elements) {
        container.innerHTML = '<p class="text-center">Mapa de mesas não disponível.</p>';
        return;
    }

    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${mapaData.grid.columns}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${mapaData.grid.rows}, 1fr)`;

    mapaData.elements.forEach(el => {
        const div = document.createElement('div');
        div.style.gridColumn = el.gridPosition.col;
        div.style.gridRow = el.gridPosition.row;

        if (el.type === 'table') {
            div.className = `table available shape-${el.shape}`;
            div.textContent = el.id;
            div.dataset.tableId = el.id;
            div.dataset.capacity = el.capacity;
            div.onclick = () => selectTable(el.id, el.capacity);
        } else {
            div.className = 'grid-element';
            div.textContent = el.label;
        }
        container.appendChild(div);
    });
}

function formatarPreco(valor) {
    if (typeof valor !== 'number') {
        const numero = parseFloat(valor);
        if (isNaN(numero)) return valor;
        valor = numero;
    }
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatGenericTitle(key) {
    if (!key) return '';
    const withSpaces = key.replace(/([A-Z])/g, ' $1');
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function createMenuSection(title, items) {
    if (!items || items.length === 0) return document.createDocumentFragment();
    
    const section = document.createElement('div');
    section.className = 'menu-section';
    section.innerHTML = `<h2>${title}</h2>`;
    
    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <div class="menu-item-header">
                <h3 class="item-name">${item.nome}</h3>
                <span class="item-leader"></span>
                <span class="item-price">${formatarPreco(item.preço)}</span>
            </div>
            <p class="item-description">${item.descrição}</p>
        `;
        section.appendChild(menuItem);
    });
    return section;
}

function renderMenu(cardapioData) {
    const menuContainer = document.getElementById('menu-content');
    if (!cardapioData) {
        menuContainer.innerHTML = '<p class="text-center">Cardápio não disponível.</p>';
        return;
    }
    
    menuContainer.innerHTML = '';
    const columnsContainer = document.createElement('div');
    columnsContainer.className = 'row';

    const sections = Object.keys(cardapioData);
    const midPoint = Math.ceil(sections.length / 2);
    
    const leftColumn = document.createElement('div');
    leftColumn.className = 'col-lg-6 menu-column';
    sections.slice(0, midPoint).forEach(sectionKey => {
        const formattedTitle = formatGenericTitle(sectionKey);
        leftColumn.appendChild(createMenuSection(formattedTitle, cardapioData[sectionKey]));
    });

    const rightColumn = document.createElement('div');
    rightColumn.className = 'col-lg-6 menu-column';
    sections.slice(midPoint).forEach(sectionKey => {
        const formattedTitle = formatGenericTitle(sectionKey);
        rightColumn.appendChild(createMenuSection(formattedTitle, cardapioData[sectionKey]));
    });

    columnsContainer.appendChild(leftColumn);
    columnsContainer.appendChild(rightColumn);
    menuContainer.appendChild(columnsContainer);
}

function selectTable(tableNumber, capacity) {
    if (usuarioLogado && usuarioLogado.type === 'restaurante') {
        warningModal.show();
        return;
    }

    if (!usuarioLogado) {
        window.location.href = 'login.html';
        return;
    }

    currentReservation = {
        tableNumber,
        tableCapacity: capacity,
        selectedDate: '',
        selectedTime: '',
    };
    
    document.getElementById('selectedTableNumber').textContent = String(tableNumber).padStart(2, '0');
    document.getElementById('selectedTableCapacity').textContent = capacity;
    const qtdInput = document.getElementById('qtdPessoas');
    qtdInput.value = 1;
    qtdInput.max = capacity;
    
    document.getElementById('estacionamento').value = "Não";

    generateCalendar(today.getMonth(), today.getFullYear());
    updateAvailableTimes();
    updateReserveButtonState();
    
    reservationModal.show();
}

function updateAvailableTimes() {
    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('disabled', 'active'));
    currentReservation.selectedTime = ''; 

    if (!currentReservation.selectedDate || !currentReservation.tableNumber) return;

    const reservedTimes = allRestaurantReservations
        .filter(r => r.data === currentReservation.selectedDate && r.numeroMesa == currentReservation.tableNumber)
        .map(r => r.horario);

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isToday = currentReservation.selectedDate === todayStr;
    const currentHour = now.getHours();

    document.querySelectorAll('.time-slot').forEach(slot => {
        const slotTime = slot.dataset.time;
        const slotHour = parseInt(slotTime.split(':')[0], 10);
        const isReserved = reservedTimes.includes(slotTime);
        const isPast = isToday && slotHour < currentHour;
        if (isReserved || isPast) {
            slot.classList.add('disabled');
        }
    });
    
    updateReserveButtonState();
}


function selectTime(time, element) {
    if (element.classList.contains('disabled')) return;
    currentReservation.selectedTime = time;
    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('active'));
    element.classList.add('active');
    updateReserveButtonState();
}

function selectDate(day, month, year, element) {
    const selected = new Date(year, month, day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (selected < now) return;
    currentReservation.selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    document.querySelectorAll('.calendar-day.active').forEach(d => d.classList.remove('active'));
    element.classList.add('active');
    updateAvailableTimes();
}

function updateReserveButtonState() {
    const reserveBtn = document.getElementById('confirm-reservation-btn');
    const qtdPessoasInput = document.getElementById('qtdPessoas');
    const qtdPessoas = parseInt(qtdPessoasInput.value, 10);
    const isPessoasValid = !isNaN(qtdPessoas) && qtdPessoas > 0 && qtdPessoas <= currentReservation.tableCapacity;
    const canReserve = currentReservation.tableNumber && currentReservation.selectedDate && currentReservation.selectedTime && isPessoasValid;
    reserveBtn.disabled = !canReserve;
}

async function makeReservation() {
    const reserveBtn = document.getElementById('confirm-reservation-btn');
    if (reserveBtn.disabled) return;
    
    const qtdPessoas = parseInt(document.getElementById('qtdPessoas').value, 10);
    const estacionamento = document.getElementById('estacionamento').value;

    const newReservation = {
        idUsuario: usuarioLogado.id, 
        idRestaurante: parseInt(idRestaurante, 10),
        numeroMesa: currentReservation.tableNumber,
        data: currentReservation.selectedDate,
        horario: currentReservation.selectedTime,
        qtdPessoas: qtdPessoas,
        estacionamento: estacionamento,
        status: "Pendente",
    };
    
    try {
        const response = await fetch('/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newReservation),
        });
        if (!response.ok) throw new Error('Falha ao salvar a reserva.');
        const savedReservation = await response.json();
        allRestaurantReservations.push(savedReservation);
        showConfirmationModal(savedReservation);
        reservationModal.hide();
    } catch (error) {
        console.error("Erro ao fazer reserva:", error);
        alert("Não foi possível completar sua reserva. Tente novamente.");
    }
}

function showConfirmationModal(reserva) {
    const details = document.getElementById('confirmationDetails');
    document.getElementById('confirmationModalLabel').textContent = '🎉 Solicitação de Reserva Enviada!';
    details.innerHTML = `
        <p>Sua solicitação para a <strong>Mesa ${String(reserva.numeroMesa).padStart(2, '0')}</strong> foi enviada.</p>
        <p><strong>Data:</strong> ${reserva.data.split('-').reverse().join('/')}</p>
        <p><strong>Horário:</strong> ${reserva.horario}</p>
        <p>Você será notificado quando o restaurante confirmar. Acompanhe em "Minhas Reservas".</p>
    `;
    confirmationModal.show();
}

function generateCalendar(month, year) {
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;

    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.insertAdjacentHTML('beforeend', `<div class="calendar-day empty"></div>`);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElem = document.createElement('div');
        dayElem.classList.add('calendar-day');
        dayElem.textContent = day;
        const date = new Date(year, month, day);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (date < now) {
            dayElem.classList.add('disabled');
        } else {
            dayElem.addEventListener('click', () => selectDate(day, month, year, dayElem));
        }
        if (currentReservation.selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`) {
            dayElem.classList.add('active');
        }
        calendarDays.appendChild(dayElem);
    }
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    
    const now = new Date();
    if (currentYear < now.getFullYear() || (currentYear === now.getFullYear() && currentMonth < now.getMonth())) {
        currentMonth = now.getMonth();
        currentYear = now.getFullYear();
    }
    
    generateCalendar(currentMonth, currentYear);
}

function addEventListeners() {
    document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
    document.getElementById('qtdPessoas').addEventListener('input', updateReserveButtonState);
    document.getElementById('confirm-reservation-btn').addEventListener('click', makeReservation);
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => selectTime(slot.dataset.time, slot));
    });
}
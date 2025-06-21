document.addEventListener('DOMContentLoaded', () => {
  const gridRestaurantes = document.getElementById('gridRestaurantes');
  const campoFiltro = document.getElementById('campoFiltro');
  const tituloSecao = document.getElementById('titulo-secao');
  const offcanvasMenu = new bootstrap.Offcanvas(document.getElementById('menuLateral'));
  const loginToast = new bootstrap.Toast(document.getElementById('loginToast'));

  const navDefault = document.getElementById('nav-default');
  const navRestaurante = document.getElementById('nav-restaurante');
  const nomeRestauranteLogado = document.getElementById('nome-restaurante-logado');
  const navLinkReservas = document.getElementById('nav-link-reservas');

  const menuDeslogado = document.getElementById('menu-deslogado');
  const menuLogado = document.getElementById('menu-logado');
  const btnLogout = document.getElementById('btn-logout');
  const nomeUsuarioLogadoDisplay = document.getElementById('nome-usuario-logado');

  const API_RESTAURANTES_URL = '/restaurantes';
  const API_USUARIOS_URL = '/usuarios';

  let todosRestaurantes = [];
  let usuarioLogado = null;
  let restauranteLogado = null; 

  const renderizarInterface = () => {
    if (restauranteLogado && restauranteLogado.type === 'restaurante') {
      navDefault.classList.add('d-none');
      navRestaurante.classList.remove('d-none');
      nomeRestauranteLogado.textContent = restauranteLogado.nome;
    } else {
      navDefault.classList.remove('d-none');
      navRestaurante.classList.add('d-none');
    }

    const isLoggedIn = usuarioLogado || restauranteLogado;
    if (isLoggedIn) {
      menuDeslogado.classList.add('d-none');
      menuLogado.classList.remove('d-none');
      if (usuarioLogado && usuarioLogado.nome) {
        nomeUsuarioLogadoDisplay.textContent = `Olá, ${usuarioLogado.nome}`;
      } else if (restauranteLogado && restauranteLogado.nome) {
        nomeUsuarioLogadoDisplay.textContent = restauranteLogado.nome;
      }
    } else {
      menuDeslogado.classList.remove('d-none');
      menuLogado.classList.add('d-none');
    }
  };

  const exibirAvisoLogin = () => {
    loginToast.show();
  };

  const obterFavoritosDoUsuario = () => {
    if (!usuarioLogado || !usuarioLogado.restaurantesFavoritos) {
        return [];
    }
    return usuarioLogado.restaurantesFavoritos.map(id => String(id));
  };

  window.alternarFavorito = async (idRestaurante, event) => {
    event.stopPropagation();
    if (!usuarioLogado) {
      exibirAvisoLogin();
      return;
    }
    
    const idRestauranteStr = String(idRestaurante);
    const favoritosAtuais = obterFavoritosDoUsuario();

    const novosFavoritos = favoritosAtuais.includes(idRestauranteStr)
      ? favoritosAtuais.filter(id => id !== idRestauranteStr)
      : [...favoritosAtuais, idRestauranteStr];

    try {
      await fetch(`${API_USUARIOS_URL}/${usuarioLogado.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantesFavoritos: novosFavoritos }),
      });

      usuarioLogado.restaurantesFavoritos = novosFavoritos;
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
      atualizarExibicaoCards();
    } catch (error) {
      console.error("Erro ao alternar favorito:", error);
      alert("Não foi possível salvar sua preferência.");
    }
  };

  const exibirCarrossel = (restaurantes) => {
    const conteudo = document.getElementById('conteudoCarrossel');
    const indicadores = document.getElementById('indicadoresCarrossel');
    conteudo.innerHTML = '';
    indicadores.innerHTML = '';
    const aleatorios = [...restaurantes].sort(() => 0.5 - Math.random()).slice(0, 3);

    aleatorios.forEach((rest, i) => {
      conteudo.insertAdjacentHTML('beforeend', `
        <div class="carousel-item ${i === 0 ? 'active' : ''}">
          <img src="${rest.infoCadastro.imagemUrl}" class="d-block w-100" alt="${rest.infoCadastro.nome}">
        </div>`);
      indicadores.insertAdjacentHTML('beforeend', `<button type="button" data-bs-target="#carrosselTopo" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}"></button>`);
    });
  };

  const exibirCartoes = (restaurantes) => {
    gridRestaurantes.innerHTML = '';
    const favoritos = obterFavoritosDoUsuario();
    restaurantes.forEach(rest => {
      const isFav = favoritos.includes(String(rest.id));
      const podeFavoritar = usuarioLogado && usuarioLogado.type === 'usuario';

      const cartaoHTML = `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
          <div class="card h-100 card-restaurante position-relative">
            <a href="reservar.html?id=${rest.id}" class="card-link">
              <img src="${rest.infoCadastro.imagemUrl}" class="card-img-top" alt="Imagem de ${rest.infoCadastro.nome}">
              <div class="card-body">
                <h6 class="card-title mb-0">${rest.infoCadastro.nome}</h6>
                <p class="card-text">${rest.infoCadastro.categoria}</p>
              </div>
            </a>
            ${podeFavoritar ? `<button class="btn-favorito ${isFav ? 'favorito' : ''}" onclick="window.alternarFavorito('${rest.id}', event)">${isFav ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>'}</button>` : ''}
          </div>
        </div>`;
      gridRestaurantes.insertAdjacentHTML('beforeend', cartaoHTML);
    });
  };

  const atualizarExibicaoCards = () => {
    const termoBusca = campoFiltro.value.trim().toLowerCase();
    const restaurantesFiltrados = todosRestaurantes.filter(r => r.infoCadastro.nome.toLowerCase().includes(termoBusca));
    exibirCartoes(restaurantesFiltrados);
  };

  campoFiltro.addEventListener('input', atualizarExibicaoCards);

  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado');
    window.location.reload();
  });

  navLinkReservas.addEventListener('click', (e) => {
      if(!usuarioLogado || usuarioLogado.type !== 'usuario') {
          e.preventDefault();
          exibirAvisoLogin();
      }
  });

  const init = async () => {
    const contaLogada = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (contaLogada && contaLogada.type === 'restaurante') {
      restauranteLogado = contaLogada;
      usuarioLogado = null;
    } else {
      usuarioLogado = contaLogada;
      restauranteLogado = null;
    }
    
    renderizarInterface();

    try {
      const response = await fetch(API_RESTAURANTES_URL);
      if (!response.ok) throw new Error('Falha ao carregar os restaurantes.');
      todosRestaurantes = await response.json();
      
      exibirCarrossel(todosRestaurantes);
      atualizarExibicaoCards();
    } catch (error) {
      console.error("Erro na inicialização:", error);
      gridRestaurantes.innerHTML = "<p class='text-center text-danger w-100'>Erro ao conectar com o servidor.</p>";
    }
  };

  init();
});
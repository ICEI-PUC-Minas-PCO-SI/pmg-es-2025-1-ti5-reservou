document.addEventListener('DOMContentLoaded', () => {
    
    const gridRestaurantes = document.getElementById('gridRestaurantes');
    const tituloSecao = document.getElementById('titulo-secao');
    
    const menuDeslogado = document.getElementById('menu-deslogado');
    const menuLogado = document.getElementById('menu-logado');
    const btnLogout = document.getElementById('btn-logout');
    const nomeUsuarioLogadoDisplay = document.getElementById('nome-usuario-logado');
  
    const navDefault = document.getElementById('nav-default');
    const navRestaurante = document.getElementById('nav-restaurante');
    const nomeRestauranteLogado = document.getElementById('nome-restaurante-logado');
  
    const API_RESTAURANTES_URL = '/restaurantes';
    const API_USUARIOS_URL = '/usuarios';
  
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
        } else if (restauranteLogado) {
          nomeUsuarioLogadoDisplay.textContent = restauranteLogado.nome;
        }
      } else {
        menuDeslogado.classList.remove('d-none');
        menuLogado.classList.add('d-none');
      }
    };
  
    const exibirCartoes = (restaurantes) => {
      gridRestaurantes.innerHTML = '';
      
      if (restaurantes.length === 0) {
          tituloSecao.textContent = "VOCÊ AINDA NÃO TEM FAVORITOS";
          gridRestaurantes.innerHTML = `<p class="text-center">Explore a <a style="color: #8b0000;" href="../../home.html">página inicial</a> e clique na estrela ⭐ para adicionar restaurantes!</p>`;
          return;
      }
  
      restaurantes.forEach(rest => {
        const cartaoHTML = `
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card h-100 card-restaurante position-relative">
              <a href="../../reservar.html?id=${rest.id}" class="card-link">
                <img src="../../${rest.infoCadastro.imagemUrl}" class="card-img-top" alt="Imagem de ${rest.infoCadastro.nome}">
                <div class="card-body">
                  <h6 class="card-title mb-0">${rest.infoCadastro.nome}</h6>
                  <p class="card-text">${rest.infoCadastro.categoria}</p>
                </div>
              </a>
              <button class="btn-favorito favorito" onclick="window.alternarFavorito(${rest.id}, event)"><i class="bi bi-star-fill"></i></button>
            </div>
          </div>`;
        gridRestaurantes.insertAdjacentHTML('beforeend', cartaoHTML);
      });
    };
  
    window.alternarFavorito = async (idRestaurante, event) => {
      event.stopPropagation();
      
      const favoritosAtuais = usuarioLogado.restaurantesFavoritos || [];
      const novosFavoritos = favoritosAtuais.filter(id => id !== idRestaurante);
  
      try {
        await fetch(`${API_USUARIOS_URL}/${usuarioLogado.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurantesFavoritos: novosFavoritos }),
        });
  
        usuarioLogado.restaurantesFavoritos = novosFavoritos;
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        
        window.location.reload();
  
      } catch (error) {
        console.error("Erro ao alternar favorito:", error);
        alert("Não foi possível remover o favorito.");
      }
    };
  
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
  
      if (!usuarioLogado) {
          tituloSecao.textContent = "ACESSO NEGADO";
          gridRestaurantes.innerHTML = `<p class="text-center fs-5">Você precisa fazer <a href="../../login.html">login</a> para ver seus restaurantes favoritos.</p>`;
          return;
      }
      
      const favoritosIds = usuarioLogado.restaurantesFavoritos || [];
  
      if (favoritosIds.length === 0) {
          exibirCartoes([]);
          return;
      }
  
      try {
          const fetchPromises = favoritosIds.map(id => fetch(`${API_RESTAURANTES_URL}/${id}`));
          const responses = await Promise.all(fetchPromises);
          
          const restaurantesFavoritos = await Promise.all(responses.map(res => res.json()));
  
          exibirCartoes(restaurantesFavoritos);
  
      } catch (error) {
        console.error("Erro ao carregar restaurantes favoritos:", error);
        gridRestaurantes.innerHTML = "<p class='text-center text-danger w-100'>Erro ao carregar os dados dos seus favoritos.</p>";
      }
    };
    
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('usuarioLogado');
      window.location.href = '../../home.html'; 
    });
  
    init();
  });
document.addEventListener('DOMContentLoaded', () => {

  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSatTI0CuuXWGFOEdy57qLkL3id3tNhs8Cc4eaxHs3QnRw9FjGlg_2NOQ878HQsCE2fUSkQYXpC9tu-/pub?gid=0&single=true&output=csv';
  // const INTERVALO_ATUALIZACAO = 600000;

  const sidebar = document.getElementById('sidebar');
  const cards = document.getElementById('cards');
  const btnAbrir = document.getElementById('btnAbrir');
  const btnFechar = document.getElementById('btnFechar');
  const menuCategorias = document.getElementById('menuCategorias');

  let dadosPorCategoria = {};

  /* ABRIR / FECHAR MENU */
  btnAbrir.addEventListener('click', () => {
    sidebar.classList.add('open');
  });

  btnFechar.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });

  /* CARREGAR CARDÁPIO */
  function carregarCardapio() {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,

      transformHeader: h =>
        h.normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '')
          .replace(/\r/g, '')
          .toLowerCase(),

      complete: res => {
        dadosPorCategoria = {};

        res.data.forEach(item => {
          const categoria = item.categoria || 'Outros';

          if (!dadosPorCategoria[categoria]) {
            dadosPorCategoria[categoria] = [];
          }

          dadosPorCategoria[categoria].push(item);
        });

        montarMenu();
      },

      error: err => console.error('Erro CSV:', err)
    });
  }

  /* MONTAR MENU */
  function montarMenu() {
    menuCategorias.innerHTML = '';

    const categorias = Object.keys(dadosPorCategoria);

    categorias.forEach((cat, index) => {
      const btn = document.createElement('button');
      btn.className = 'category-btn';
      btn.textContent = cat;

      btn.addEventListener('click', () => {
        carregarCategoria(cat);
        sidebar.classList.remove('open');
      });

      menuCategorias.appendChild(btn);

      if (index === 0) {
        carregarCategoria(cat);
      }
    });
  }

  /* CARREGAR CATEGORIA */
  function carregarCategoria(categoria) {
    cards.innerHTML = '';

    dadosPorCategoria[categoria].forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        ${item.imagem ? `
          <div class="card-img">
            <img src="${item.imagem}" alt="${item.nome}" loading="lazy">
          </div>
        ` : ''}

        <div class="card-info">
          <h3>${item.nome}</h3>
          <p>${item.descricao || ''}</p>
          <strong>R$ ${item.preco}</strong>
        </div>
      `;

      cards.appendChild(card);
    });
  }

  carregarCardapio();
  // setInterval(carregarCardapio, INTERVALO_ATUALIZACAO);

});

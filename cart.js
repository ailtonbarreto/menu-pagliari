document.addEventListener('DOMContentLoaded', () => {

  const cartPopup = document.getElementById('cart_popup');
  const cartIcon = document.getElementById('cart');
  const cartCount = document.getElementById('cartCount');

  /* =======================
     STORAGE
  ======================= */
  function getCarrinho() {
    return JSON.parse(sessionStorage.getItem('carrinho')) || [];
  }

  function salvarCarrinho(carrinho) {
    sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
  }

  /* =======================
     POPUP
  ======================= */
  cartIcon.addEventListener('click', () => {
    abrirCarrinho();
  });

  function abrirCarrinho() {
    cartPopup.style.display = 'flex';
    renderCarrinho();
  }

  function fecharCarrinho() {
    cartPopup.style.display = 'none';
  }

  cartPopup.addEventListener('click', e => {
    if (e.target === cartPopup) fecharCarrinho();
  });

  function renderCarrinho() {
    const carrinho = getCarrinho();

    let html = `
      <div class="cart-box">
        <div class="cart-header">
          <h3>Comanda Eletrônica</h3>
          <button class="cart-close" onclick="fecharCarrinho()">✕</button>
        </div>
    `;

    if (carrinho.length === 0) {
      html += `<p style="color:#FFF; text-align: center">Nenhum Item</p>`;
    } else {
      let total = 0;

      carrinho.forEach(item => {

        const precoNumerico = Number(
          item.preco
            .toString()
            .replace('R$', '')
            .replace('.', '')
            .replace(',', '.')
            .trim()
        );

        total += precoNumerico * item.qtd;

        html += `
          <div class="cart-card">
            ${item.imagem ? `<img src="${item.imagem}">` : ''}

            <div class="cart-info">
              <strong>${item.nome}</strong>
              <span>R$ ${item.preco}</span>

              <div class="cart-qtd">
                <button onclick="alterarQtd('${item.id}', -1)">−</button>
                <span>${item.qtd}</span>
                <button onclick="alterarQtd('${item.id}', 1)">+</button>
              </div>
            </div>

            <span class="material-symbols-outlined"
              onclick="removerItem('${item.id}')">delete</span>
          </div>
        `;
      });

      html += `
          <div class="cart-footer">

            <strong id="total">Total: R$ ${total.toFixed(2)}</strong>

            <select id="mesa">
                <option value="">Selecione a mesa</option>
                <option value="1">Mesa 1</option>
                <option value="2">Mesa 2</option>
                <option value="3">Mesa 3</option>
                <option value="4">Mesa 4</option>
                <option value="5">Mesa 5</option>
                <option value="6">Mesa 6</option>
                <option value="7">Mesa 7</option>
                <option value="8">Mesa 8</option>
                <option value="9">Mesa 9</option>
                <option value="10">Mesa 10</option>
            </select>

            <button class="finalizar-btn" onclick="enviarPedido()">
              Finalizar Pedido
            </button>
          </div>
        `;


    }

    html += `</div>`;

    cartPopup.innerHTML = html;
    atualizarContador();
  }

  /* =======================
     AÇÕES (globais)
  ======================= */
  window.alterarQtd = function (id, delta) {
    const carrinho = getCarrinho();
    const item = carrinho.find(p => p.id === id);
    if (!item) return;

    item.qtd += delta;

    if (item.qtd <= 0) {
      removerItem(id);
      return;
    }

    salvarCarrinho(carrinho);
    renderCarrinho();
  };

  window.removerItem = function (id) {
    let carrinho = getCarrinho();
    carrinho = carrinho.filter(p => p.id !== id);
    salvarCarrinho(carrinho);
    renderCarrinho();
  };

  window.fecharCarrinho = fecharCarrinho;

  /* =======================
     CONTADOR
  ======================= */
  function atualizarContador() {
    const total = getCarrinho().reduce((s, i) => s + i.qtd, 0);
    cartCount.textContent = total;
    cartCount.style.display = total > 0 ? 'inline-flex' : 'none';
  }

  atualizarContador();
});

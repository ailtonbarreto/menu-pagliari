document.addEventListener('DOMContentLoaded', () => {

  const BASE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSatTI0CuuXWGFOEdy57qLkL3id3tNhs8Cc4eaxHs3QnRw9FjGlg_2NOQ878HQsCE2fUSkQYXpC9tu-/pub?gid=408601463&single=true&output=csv';

  const cards = document.getElementById('cards');
  const filtroData = document.getElementById('filtroData');

  const hoje = new Date().toISOString().split('T')[0];
  filtroData.value = hoje;

  let ultimaRequisicao = 0;

  function carregarPedidos() {

    const requisicaoAtual = Date.now();
    ultimaRequisicao = requisicaoAtual;

    const urlSemCache = `${BASE_URL}&_=${requisicaoAtual}`;

    Papa.parse(urlSemCache, {
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
        // ❌ ignora resposta antiga
        if (requisicaoAtual !== ultimaRequisicao) return;

        filtrarPorData(res.data);
      },

      error: err => console.error('Erro CSV:', err)
    });
  }

  function filtrarPorData(dados) {
    const dataSelecionada = filtroData.value;

    const filtrados = dados.filter(linha => {
      if (!linha.data) return false;

      // "07/02/2026, 21:11:18" → "2026-02-07"
      const [dia, mes, anoHora] = linha.data.split('/');
      const ano = anoHora.split(',')[0];

      const dataLinha = `${ano}-${mes}-${dia}`;
      return dataLinha === dataSelecionada;
    });

    montarCardsPedidos(filtrados);
  }

  function montarCardsPedidos(dados) {
    cards.innerHTML = '';

    const pedidos = {};

    dados.forEach(linha => {
      const numeroPedido = linha.pedido;

      if (!pedidos[numeroPedido]) {
        pedidos[numeroPedido] = {
          pedido: numeroPedido,
          mesa: linha.mesa,
          status: linha.status || 'Preparando'
        };
      }
    });

 
    Object.values(pedidos).forEach(p => {

      const statusClass = p.status
        .toLowerCase()
        .replace(/\s+/g, '');

      const card = document.createElement('div');
      card.className = `card pedido-card ${statusClass}`;

      card.innerHTML = `
        <div class="pedido-header">
          <h3>Pedido ${p.pedido}</h3>
        </div>

        <div class="pedido-info">
          <p><strong>Mesa:</strong> ${p.mesa}</p>
          <p class="status-text">
            <strong>Status:</strong> ${p.status}
          </p>
        </div>
      `;

      cards.appendChild(card);
    });
  }

  filtroData.addEventListener('change', carregarPedidos);


  carregarPedidos();

  setInterval(carregarPedidos, 5000);

});


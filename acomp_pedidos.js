document.addEventListener('DOMContentLoaded', () => {

  const CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSatTI0CuuXWGFOEdy57qLkL3id3tNhs8Cc4eaxHs3QnRw9FjGlg_2NOQ878HQsCE2fUSkQYXpC9tu-/pub?gid=408601463&single=true&output=csv';

  const UPDATE_URL =
    'https://script.google.com/macros/s/AKfycbxiXyrioW9kmReLjWwhAVArp_J-a6OSKF7_gx2vQOtQeTwOhrcSoMCC3gQBE_JWLP_qIA/exec';

  const cards = document.getElementById('cards');
  const filtroData = document.getElementById('filtroData');

  const modal = document.getElementById('modalStatus');
  const modalPedido = document.getElementById('modalPedido');
  const novoStatus = document.getElementById('novoStatus');
  const btnSalvar = document.getElementById('btnSalvar');
  const btnCancelar = document.getElementById('btnCancelar');

  filtroData.value = new Date().toISOString().split('T')[0];

  let intervalo = null;
  let requisicaoAtual = 0;
  let pedidoSelecionado = null;
  let atualizandoStatus = false;



  function carregarPedidos() {

    if (atualizandoStatus) return;

    requisicaoAtual++;
    const id = requisicaoAtual;

    Papa.parse(`${CSV_URL}&_=${Date.now()}`, {
      download: true,
      header: true,
      skipEmptyLines: true,

      transformHeader: h =>
        h.normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '')
          .toLowerCase(),

      complete: res => {
        if (id !== requisicaoAtual) return;
        filtrarPorData(res.data);
      }
    });
  }


  function filtrarPorData(dados) {

    const data = filtroData.value;

    const filtrados = dados.filter(l => {
      if (!l.data) return false;

      const [d, m, aHora] = l.data.split('/');
      const a = aHora.split(',')[0];

      return `${a}-${m}-${d}` === data;
    });

    montarCards(filtrados);
  }


  function montarCards(dados) {

    if (atualizandoStatus) return;

    cards.innerHTML = '';
    const pedidos = {};

    dados.forEach(l => {
      if (!pedidos[l.pedido]) {
        pedidos[l.pedido] = {
          pedido: l.pedido,
          mesa: l.mesa,
          status: l.status || 'Preparando'
        };
      }
    });

    Object.values(pedidos).forEach(p => {

      const card = document.createElement('div');
      card.className = `card pedido-card ${p.status.toLowerCase()}`;

      card.innerHTML = `
        <h3>Pedido ${p.pedido}</h3>
        <p>Mesa: ${p.mesa}</p>
        <p>Status: <strong>${p.status}</strong></p>
      `;

      card.onclick = () => abrirModal(p);
      cards.appendChild(card);
    });
  }


  function abrirModal(p) {
    pedidoSelecionado = p;
    modalPedido.innerText = `Pedido ${p.pedido}`;
    novoStatus.value = p.status;
    modal.classList.remove('hidden');
  }

  btnCancelar.onclick = () => {
    modal.classList.add('hidden');
    pedidoSelecionado = null;
  };

  btnSalvar.onclick = async () => {

    if (!pedidoSelecionado) return;

    btnSalvar.disabled = true;
    btnSalvar.innerText = 'Salvando...';

    atualizandoStatus = true;
    clearInterval(intervalo);

    try {
      const resp = await fetch(UPDATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'status',
          pedido: pedidoSelecionado.pedido,
          status: novoStatus.value
        })
      });

      if (!resp.ok) throw new Error('Erro no POST');

      modal.classList.add('hidden');
      pedidoSelecionado = null;

      setTimeout(() => {
        atualizandoStatus = false;
        carregarPedidos();
        intervalo = setInterval(carregarPedidos, 5000);
      }, 2500);

    } catch (err) {
      atualizandoStatus = false;
      alert('Erro ao atualizar status');
      console.error(err);
    }

    btnSalvar.disabled = false;
    btnSalvar.innerText = 'Salvar';
  };

  filtroData.onchange = carregarPedidos;

  carregarPedidos();
  intervalo = setInterval(carregarPedidos, 5000);

});

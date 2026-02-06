window.enviarPedido = function () {
  const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];

  if (carrinho.length === 0) {
    alert('Carrinho vazio');
    return;
  }

  const itens = carrinho.map(item => {
    const preco = Number(
      item.preco
        .toString()
        .replace('R$', '')
        .replace('.', '')
        .replace(',', '.')
        .trim()
    );

    return {
      nome: item.nome,
      qtd: item.qtd,
      preco,
      total: preco * item.qtd
    };
  });

  const totalPedido = itens.reduce((s, i) => s + i.total, 0);

  const payload = {
    data: new Date().toLocaleString('pt-BR'),
    itens,
    total: totalPedido
  };

  fetch('https://script.google.com/macros/s/AKfycbzbO9t8XJibM0IMpqJ7T8_UFngxnEi_dJzvLSH0IqPdsMbBe1NPCdVrVz5Z6kpFONCoEg/exec', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(() => {
      alert('Pedido enviado com sucesso 🍕');
      sessionStorage.removeItem('carrinho');
      location.reload();
    })
    .catch(() => {
      alert('Erro ao enviar pedido');
    });
};

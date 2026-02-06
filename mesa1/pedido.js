document.addEventListener('DOMContentLoaded', () => { });

window.enviarPedido = function () {

    const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];

    if (carrinho.length === 0) {
        alert('Carrinho vazio');
        return;
    }

    const mesa = 12; // 👈 mesa fixa
    const data = new Date().toLocaleString('pt-BR');

    // monta as linhas exatamente como o Sheets espera
    const linhas = carrinho.map(item => {
        const preco = Number(item.preco.replace(',', '.'));

        return {
            data: data,
            mesa: mesa,
            produto: item.nome,          // ✅ existe
            quantidade: Number(item.qtd),// ✅ existe
            preco: preco,
            totalItem: preco * Number(item.qtd)
        };
    });

    const totalPedido = linhas.reduce(
        (soma, item) => soma + item.totalItem,
        0
    );

    const payload = {
        linhas: linhas,
        totalPedido: totalPedido
    };

    console.log('ENVIANDO CORRETO:', payload);

    fetch('https://script.google.com/macros/s/AKfycbzEq_f4ICteWOvC4dAyohge7yR2CUogWAYl2sUNmUQMn1ao38v-M-cOaljZtmdaqhgXlw/exec', {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
    })
        .then(() => {
            alert('Pedido enviado com sucesso 🍕');
            sessionStorage.removeItem('carrinho');
            location.reload();
        })
        .catch(err => {
            console.error(err);
            alert('Erro ao enviar pedido');
        });
};

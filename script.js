document.getElementById('rotaForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const data = document.getElementById('data').value;
  const hora = document.getElementById('hora').value;
  const placa = document.getElementById('placa').value;
  const produto = document.getElementById('produto').value;
  const quantidade = document.getElementById('quantidade').value;
  const destinatario = document.getElementById('destinatario').value;
  const endereco = document.getElementById('endereco').value;

  const rota = {
      data,
      hora,
      placa,
      produto,
      quantidade,
      destinatario,
      endereco,
      entregue: false,
      motivoFalha: ''
  };

  adicionarRota(rota);
  limparFormulario();
  verificarEntregas();
});

function adicionarRota(rota) {
  const rotaList = document.getElementById('rotaList');
  const li = document.createElement('li');
  li.textContent = `Data: ${rota.data}, Hora: ${rota.hora}, Placa: ${rota.placa}, Produto: ${rota.produto}, Quantidade: ${rota.quantidade}, Destinatário: ${rota.destinatario}, Endereço: ${rota.endereco}`;
  li.dataset.data = rota.data;
  li.dataset.hora = rota.hora;
  li.dataset.entregue = rota.entregue;
  rotaList.appendChild(li);
}

function limparFormulario() {
  document.getElementById('rotaForm').reset();
}

function verificarEntregas() {
  const rotaList = document.getElementById('rotaList').children;
  const agora = new Date();

  for (let li of rotaList) {
      const data = new Date(`${li.dataset.data}T${li.dataset.hora}`);
      if (data < agora && li.dataset.entregue === 'false') {
          const motivoFalha = prompt(`A entrega para ${li.textContent} não foi realizada. Informe o motivo da falha:`);
          li.classList.add('nao-entregue');
          li.textContent += ` - Falha: ${motivoFalha}`;
          li.dataset.entregue = 'false';
      } else if (data < agora && li.dataset.entregue === 'true') {
          li.classList.add('entregue');
      }
  }
}

document.getElementById('rotaList').addEventListener('click', function(event) {
  if (event.target.tagName === 'LI' && event.target.dataset.entregue === 'false') {
      const confirmacao = confirm('A entrega foi realizada?');
      if (confirmacao) {
          event.target.classList.remove('nao-entregue');
          event.target.classList.add('entregue');
          event.target.dataset.entregue = 'true';
          event.target.textContent += ' - Entrega Concluída';
      }
  }
});

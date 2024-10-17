let db;

window.onload = function() {
    let request = indexedDB.open("estoqueDB", 1);

    request.onerror = function(event) {
        console.log("Erro ao abrir o banco de dados", event);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        carregarProdutos();
        verificarEntregas();
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        let objectStore = db.createObjectStore("produtos", { keyPath: "codigo" });
        objectStore.createIndex("nome", "nome", { unique: false });
    };

    document.getElementById('produtoForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const codigo = document.getElementById('codigo').value;
        const categoria = document.getElementById('categoria').value;
        const quantidade = document.getElementById('quantidade').value;
        const validade = document.getElementById('validade').value;
        const temperatura = document.getElementById('temperatura').value;
        const endereco = document.getElementById('endereco').value;
        const dataEntrega = document.getElementById('dataEntrega').value;
        const horaEntrega = document.getElementById('horaEntrega').value;

        const produto = {
            nome,
            codigo,
            categoria,
            quantidade,
            validade,
            temperatura,
            endereco,
            dataEntrega,
            horaEntrega,
            entregue: false,
            motivoFalha: ''
        };

        adicionarProduto(produto);
        limparFormulario();
    });
};

function adicionarProduto(produto) {
    let transaction = db.transaction(["produtos"], "readwrite");
    let objectStore = transaction.objectStore("produtos");
    let request = objectStore.add(produto);

    request.onsuccess = function(event) {
        console.log("Produto adicionado com sucesso");
        carregarProdutos();
    };

    request.onerror = function(event) {
        console.log("Erro ao adicionar produto", event);
    };
}

function carregarProdutos() {
    let produtoList = document.getElementById('produtoList');
    produtoList.innerHTML = '';

    let transaction = db.transaction(["produtos"], "readonly");
    let objectStore = transaction.objectStore("produtos");

    objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            let li = document.createElement('li');
            li.textContent = `Nome: ${cursor.value.nome}, Código: ${cursor.value.codigo}, Categoria: ${cursor.value.categoria}, Quantidade: ${cursor.value.quantidade}, Validade: ${cursor.value.validade}, Temperatura: ${cursor.value.temperatura}, Endereço: ${cursor.value.endereco}, Data de Entrega: ${cursor.value.dataEntrega}, Hora de Entrega: ${cursor.value.horaEntrega}`;
            li.dataset.codigo = cursor.value.codigo;
            li.dataset.dataEntrega = cursor.value.dataEntrega;
            li.dataset.horaEntrega = cursor.value.horaEntrega;
            li.dataset.entregue = cursor.value.entregue;
            produtoList.appendChild(li);
            cursor.continue();
        }
    };
}

function limparFormulario() {
    document.getElementById('produtoForm').reset();
}

function verificarEntregas() {
    let produtoList = document.getElementById('produtoList').children;
    const agora = new Date();

    for (let li of produtoList) {
        const dataEntrega = new Date(`${li.dataset.dataEntrega}T${li.dataset.horaEntrega}`);
        if (dataEntrega < agora && li.dataset.entregue === 'false') {
            const motivoFalha = prompt(`A entrega para ${li.textContent} não foi realizada. Informe o motivo da falha:`);
            li.classList.add('nao-entregue');
            li.textContent += ` - Falha: ${motivoFalha}`;
            li.dataset.entregue = 'false';
        } else if (dataEntrega < agora && li.dataset.entregue === 'true') {
            li.classList.add('entregue');
        }
    }
}

document.getElementById('produtoList').addEventListener('click', function(event) {
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

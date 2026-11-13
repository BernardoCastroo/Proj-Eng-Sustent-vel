let equipamentos = [];

const form = document.getElementById('form-equipamento');
const listaContainer = document.getElementById('lista-equipamentos');
const totalKwhElement = document.getElementById('total-kwh');
const totalCustoElement = document.getElementById('total-custo');

const inputPessoas = document.getElementById('num-pessoas');
const inputTarifa = document.getElementById('tarifa');
const valorMetaElement = document.getElementById('valor-meta');
const barraProgresso = document.getElementById('barra-progresso');
const badgeStatus = document.getElementById('badge-status');
const textoCasasIdeais = document.getElementById('texto-casas-ideais');

if (inputPessoas) {
    inputPessoas.addEventListener('input', atualizarInterface);
}
if (inputTarifa) {
    inputTarifa.addEventListener('input', atualizarInterface);
}

if (form) {
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const potencia = parseFloat(document.getElementById('potencia').value);
        const quantidade = parseInt(document.getElementById('quantidade').value);
        const horas = parseFloat(document.getElementById('horas').value);
        const dias = parseInt(document.getElementById('dias').value);

        const consumoKwh = (potencia * horas * dias * quantidade) / 1000;

        const aparelho = {
            id: Date.now(),
            nome: nome,
            potencia: potencia,
            quantidade: quantidade,
            horas: horas,
            dias: dias,
            consumo: consumoKwh
        };

        equipamentos.push(aparelho);
        form.reset();
        
        atualizarInterface();
    });
}

function atualizarInterface() {
    const tarifa = parseFloat(document.getElementById('tarifa').value) || 0;
    
    let totalKwh = 0;
    for (let i = 0; i < equipamentos.length; i++) {
        totalKwh += equipamentos[i].consumo;
    }

    totalKwhElement.textContent = totalKwh.toFixed(2);

    if (tarifa > 0 && totalKwh > 0) {
        const custoTotal = totalKwh * tarifa;
        totalCustoElement.textContent = `Custo Aproximado: R$ ${custoTotal.toFixed(2)}`;
        totalCustoElement.style.display = 'block';
    } else {
        totalCustoElement.style.display = 'none';
    }

    // A meta agora é 150 kWh por pessoa, conforme solicitado
    const numPessoas = parseInt(inputPessoas.value) || 1;
    const metaIdeal = numPessoas * 150; 
    valorMetaElement.textContent = metaIdeal;

    let proporcaoCasas = 0;
    if (metaIdeal > 0) {
        proporcaoCasas = totalKwh / metaIdeal;
    }
    
    textoCasasIdeais.innerHTML = `Você consome o equivalente a <strong>${proporcaoCasas.toFixed(1)}</strong> casas ideais.`;

    let porcentagemMeta = proporcaoCasas * 100;
    if (porcentagemMeta > 100) porcentagemMeta = 100;
    
    barraProgresso.style.width = porcentagemMeta + '%';

    if (totalKwh > metaIdeal) {
        barraProgresso.style.backgroundColor = '#e53e3e';
        badgeStatus.textContent = 'Acima do ideal';
        badgeStatus.className = 'badge-status vermelho';
        textoCasasIdeais.style.color = '#e53e3e';
    } else {
        barraProgresso.style.backgroundColor = '#319795';
        badgeStatus.textContent = 'Dentro do ideal';
        badgeStatus.className = 'badge-status verde';
        textoCasasIdeais.style.color = 'inherit';
    }

    equipamentos.sort((a, b) => b.consumo - a.consumo);
    listaContainer.innerHTML = '';

    if (equipamentos.length === 0) {
        listaContainer.innerHTML = '<p class="mensagem-vazia">Nenhum equipamento cadastrado ainda.</p>';
        return;
    }

    equipamentos.forEach(function(item, index) {
        let porcentagem = totalKwh > 0 ? ((item.consumo / totalKwh) * 100).toFixed(1) : 0;

        const card = document.createElement('div');
        card.className = 'item-equipamento';
        card.innerHTML = `
            <div class="item-info">
                <h4>${index + 1}º - ${item.nome}</h4>
                <p>${item.quantidade}x | ${item.potencia}W | ${item.horas}h/dia | ${item.dias} dias/mês</p>
            </div>
            <div class="item-valores">
                <span class="item-kwh">${item.consumo.toFixed(2)} kWh</span>
                <span class="item-porcentagem">${porcentagem}%</span>
                <button type="button" class="btn-remover" onclick="removerEquipamento(${item.id})">Remover</button>
            </div>
        `;
        listaContainer.appendChild(card);
    });
}

function removerEquipamento(id) {
    equipamentos = equipamentos.filter(item => item.id !== id);
    atualizarInterface();
}
// render.js - Responsável por toda a renderização e atualização da interface

/**
 * ====================================
 * REFERÊNCIAS DOS ELEMENTOS DOM
 * ====================================
 */

// Objeto que vai guardar todas as referências DOM
const elementos = {
    // Input e botões
    numeroInput: null,
    addNumeroBtn: null,
    desfazerBtn: null,
    resetBtn: null,
    errorMessage: null,
    
    // Containers principais
    historicoContainer: null,
    gatilhoCard: null,
    gatilhoComentario: null,
    gatilhoAlvosTitle: null,
    gatilhoAlvos: null,
    
    // Padrão
    padraoAtual: null,
    padraoDescricao: null,
    
    // Tendências
    tendenciasAtivas: null,
    
    // Estatísticas
    taxaResolucao: null,
    totalTendencias: null,
    totalNumeros: null,
    
    // Log
    logResolucao: null,
    
    // Modal
    editModal: null,
    editNumeroInput: null,
    saveEditBtn: null,
    cancelEditBtn: null
};

/**
 * Inicializa todas as referências DOM
 * Deve ser chamada quando a página carregar
 */
function inicializarElementos() {
    // Input e botões
    elementos.numeroInput = document.getElementById('numeroInput');
    elementos.addNumeroBtn = document.getElementById('addNumeroBtn');
    elementos.desfazerBtn = document.getElementById('desfazerBtn');
    elementos.resetBtn = document.getElementById('resetBtn');
    elementos.errorMessage = document.getElementById('error-message');
    
    // Containers
    elementos.historicoContainer = document.getElementById('historicoContainer');
    elementos.gatilhoCard = document.getElementById('gatilhoCard');
    elementos.gatilhoComentario = document.getElementById('gatilhoComentario');
    elementos.gatilhoAlvosTitle = document.getElementById('gatilhoAlvosTitle');
    elementos.gatilhoAlvos = document.getElementById('gatilhoAlvos');
    
    // Padrão
    elementos.padraoAtual = document.getElementById('padraoAtual');
    elementos.padraoDescricao = document.getElementById('padraoDescricao');
    
    // Tendências
    elementos.tendenciasAtivas = document.getElementById('tendenciasAtivas');
    
    // Estatísticas
    elementos.taxaResolucao = document.getElementById('taxaResolucao');
    elementos.totalTendencias = document.getElementById('totalTendencias');
    elementos.totalNumeros = document.getElementById('totalNumeros');
    
    // Log
    elementos.logResolucao = document.getElementById('logResolucao');
    
    // Modal
    elementos.editModal = document.getElementById('editModal');
    elementos.editNumeroInput = document.getElementById('editNumeroInput');
    elementos.saveEditBtn = document.getElementById('saveEditBtn');
    elementos.cancelEditBtn = document.getElementById('cancelEditBtn');
    
    console.log('✅ Elementos DOM inicializados');
}

/**
 * ====================================
 * FUNÇÕES DE RENDERIZAÇÃO
 * ====================================
 */

/**
 * Renderiza o histórico de números
 * @param {number[]} historico - Array de números
 * @param {Function} onClickNumero - Callback quando clica em um número
 */
function renderizarHistorico(historico, onClickNumero) {
    // Limpa o container
    elementos.historicoContainer.innerHTML = '';
    
    if (historico.length === 0) {
        elementos.historicoContainer.innerHTML = '<p class="text-azul-texto-escuro">Aguardando o primeiro número...</p>';
        return;
    }
    
    // Renderiza cada número
    historico.forEach((numero, index) => {
        const numeroEl = document.createElement('div');
        const cor = window.Logica.getCorNumero(numero);
        
        // Classes do Tailwind para cada cor
        let classesCor = '';
        if (cor === 'vermelho') classesCor = 'bg-red-600';
        else if (cor === 'preto') classesCor = 'bg-gray-800';
        else if (cor === 'verde') classesCor = 'bg-green-600';
        
        numeroEl.className = `
            w-12 h-12 flex items-center justify-center 
            font-bold text-xl rounded-full cursor-pointer 
            ${classesCor} text-white
            transition-transform hover:scale-110
        `;
        
        numeroEl.textContent = numero;
        numeroEl.title = 'Clique para editar';
        
        // Adiciona evento de clique
        if (onClickNumero) {
            numeroEl.addEventListener('click', () => onClickNumero(index));
        }
        
        elementos.historicoContainer.appendChild(numeroEl);
    });
}

/**
 * Renderiza o card do gatilho
 * @param {Object} analise - Resultado da análise
 */
function renderizarGatilho(analise) {
    // Remove classes anteriores
    elementos.gatilhoCard.classList.remove('gatilho-ativo', 'border-green-500', 'border-red-500');
    
    // Se não pode jogar
    if (!analise.podeJogar) {
        elementos.gatilhoComentario.textContent = 
            analise.gatilho.tipo === 'nenhum' ? 
            'Aguardando formação de gatilho...' : 
            `${analise.gatilho.nome} - Força insuficiente (${analise.gatilho.forca}/100)`;
        
        elementos.gatilhoAlvosTitle.style.display = 'none';
        elementos.gatilhoAlvos.innerHTML = '';
        
        // Borda vermelha se padrão 5
        if (analise.padrao.id === 5) {
            elementos.gatilhoCard.classList.add('border-red-500');
        }
        
        return;
    }
    
    // Pode jogar! Gatilho detectado
    elementos.gatilhoCard.classList.add('gatilho-ativo', 'border-green-500');
    elementos.gatilhoComentario.innerHTML = `
        <strong>🎯 ${analise.gatilho.nome} DETECTADO!</strong><br>
        Força: ${analise.gatilho.forca}/100<br>
        ${analise.gatilho.detalhes || ''}
    `;
    
    // Mostra alvos recomendados
    if (analise.gatilho.alvos.length > 0) {
        elementos.gatilhoAlvosTitle.style.display = 'block';
        elementos.gatilhoAlvos.innerHTML = '';
        
        analise.gatilho.alvos.forEach(alvo => {
            const alvoEl = document.createElement('div');
            const cor = window.Logica.getCorNumero(alvo);
            
            let classesCor = '';
            if (cor === 'vermelho') classesCor = 'bg-red-600';
            else if (cor === 'preto') classesCor = 'bg-gray-800';
            else if (cor === 'verde') classesCor = 'bg-green-600';
            
            alvoEl.className = `
                w-16 h-16 flex items-center justify-center
                font-bold text-2xl rounded-full
                ${classesCor} text-white
                border-4 border-green-400
                shadow-lg
            `;
            
            alvoEl.textContent = alvo;
            elementos.gatilhoAlvos.appendChild(alvoEl);
        });
    } else {
        elementos.gatilhoAlvosTitle.style.display = 'none';
    }
}

/**
 * Renderiza o padrão da mesa
 * @param {Object} padrao - Padrão identificado
 */
function renderizarPadrao(padrao) {
    // Cores diferentes para cada padrão
    const coresPadrao = {
        1: 'text-green-500',
        2: 'text-blue-500',
        3: 'text-purple-500',
        4: 'text-yellow-500',
        5: 'text-red-500'
    };
    
    elementos.padraoAtual.className = `font-semibold ${coresPadrao[padrao.id] || 'text-gray-500'}`;
    elementos.padraoAtual.textContent = padrao.nome;
    elementos.padraoDescricao.textContent = padrao.descricao;
}

/**
 * Renderiza as tendências ativas
 * @param {Object} tendencias - Objeto com tendências
 */
function renderizarTendencias(tendencias) {
    elementos.tendenciasAtivas.innerHTML = '';
    
    if (tendencias.ativas.length === 0) {
        elementos.tendenciasAtivas.innerHTML = '<div class="text-azul-texto-escuro">Nenhuma tendência ativa</div>';
        return;
    }
    
    // Renderiza cada tendência ativa
    tendencias.ativas.forEach(tendencia => {
        const tendenciaEl = document.createElement('div');
        tendenciaEl.className = 'bg-azul-fundo p-2 rounded mb-2 border-l-4 border-green-500';
        
        tendenciaEl.innerHTML = `
            <span class="text-green-400 font-bold">${tendencia.numeroOrigem}</span>
            <span class="text-azul-texto-escuro mx-2">→</span>
            <span class="text-white">${tendencia.alvos.join(', ')}</span>
        `;
        
        elementos.tendenciasAtivas.appendChild(tendenciaEl);
    });
}

/**
 * Renderiza as estatísticas
 * @param {Object} estatisticas - Dados estatísticos
 */
function renderizarEstatisticas(estatisticas) {
    elementos.taxaResolucao.textContent = `${estatisticas.taxaResolucao}%`;
    elementos.totalTendencias.textContent = estatisticas.tendenciasAtivas;
    elementos.totalNumeros.textContent = estatisticas.numerosAnalisados;
}

/**
 * Renderiza o log de resoluções
 * @param {Array} logResolucoes - Array com log de resoluções
 */
function renderizarLogResolucoes(logResolucoes) {
    elementos.logResolucao.innerHTML = '';
    
    if (logResolucoes.length === 0) {
        elementos.logResolucao.innerHTML = '<div class="text-azul-texto-escuro">Nenhuma resolução registrada</div>';
        return;
    }
    
    // Mostra apenas as últimas 5 resoluções
    const ultimasResolucoes = logResolucoes.slice(-5);
    
    ultimasResolucoes.forEach(log => {
        const logEl = document.createElement('div');
        logEl.className = 'text-green-400 mb-1';
        logEl.textContent = log.mensagem;
        elementos.logResolucao.appendChild(logEl);
    });
}

/**
 * ====================================
 * FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO
 * ====================================
 */

/**
 * Atualiza toda a interface com os resultados da análise
 * @param {Object} analise - Resultado da análise completa
 * @param {Function} onClickNumero - Callback para edição de números
 */
function atualizarInterface(analise, onClickNumero) {
    // Renderiza cada parte da interface
    renderizarHistorico(analise.historico, onClickNumero);
    renderizarGatilho(analise);
    renderizarPadrao(analise.padrao);
    renderizarTendencias(analise.tendencias);
    renderizarEstatisticas(analise.estatisticas);
    renderizarLogResolucoes(analise.tendencias.logResolucoes);
}

/**
 * ====================================
 * FUNÇÕES AUXILIARES DE UI
 * ====================================
 */

/**
 * Mostra mensagem de erro
 * @param {string} mensagem - Mensagem de erro
 */
function mostrarErro(mensagem) {
    elementos.errorMessage.textContent = mensagem;
    
    // Limpa após 3 segundos
    setTimeout(() => {
        elementos.errorMessage.textContent = '';
    }, 3000);
}

/**
 * Limpa o campo de input
 */
function limparInput() {
    elementos.numeroInput.value = '';
    elementos.numeroInput.focus();
}

/**
 * Abre o modal de edição
 * @param {number} numeroAtual - Número atual para editar
 */
function abrirModalEdicao(numeroAtual) {
    elementos.editNumeroInput.value = numeroAtual;
    elementos.editModal.classList.remove('hidden');
    elementos.editNumeroInput.focus();
    elementos.editNumeroInput.select();
}

/**
 * Fecha o modal de edição
 */
function fecharModalEdicao() {
    elementos.editModal.classList.add('hidden');
    elementos.editNumeroInput.value = '';
}

/**
 * Adiciona classe de gatilho ativo (animação)
 */
function animarGatilhoAtivo() {
    elementos.gatilhoCard.classList.add('gatilho-ativo');
}

/**
 * Remove classe de gatilho ativo
 */
function pararAnimacaoGatilho() {
    elementos.gatilhoCard.classList.remove('gatilho-ativo');
}

/**
 * ====================================
 * EXPORTAÇÕES
 * ====================================
 */

// Exporta funções para uso no main.js
window.Render = {
    // Inicialização
    inicializarElementos,
    elementos,
    
    // Função principal
    atualizarInterface,
    
    // Funções auxiliares
    mostrarErro,
    limparInput,
    abrirModalEdicao,
    fecharModalEdicao,
    animarGatilhoAtivo,
    pararAnimacaoGatilho
};
// main.js - Coordena toda a aplicação, gerencia estado e eventos

/**
 * ====================================
 * ESTADO DA APLICAÇÃO
 * ====================================
 */

// Estado global da aplicação
const estado = {
    historico: [],          // Array com todos os números inseridos
    analiseAtual: null,     // Última análise executada
    indexEdicao: -1         // Índice do número sendo editado
};

/**
 * ====================================
 * INICIALIZAÇÃO
 * ====================================
 */

/**
 * Inicializa a aplicação quando a página carregar
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Franco Atirador - Iniciando aplicação...');
    
    // Inicializa elementos do DOM
    window.Render.inicializarElementos();
    
    // Configura todos os eventos
    configurarEventos();
    
    // Carrega histórico salvo (se existir)
    carregarHistoricoSalvo();
    
    // Executa análise inicial
    executarAnaliseCompleta();
    
    // Foca no input
    window.Render.limparInput();
    
    console.log('✅ Aplicação iniciada com sucesso!');
});

/**
 * ====================================
 * CONFIGURAÇÃO DE EVENTOS
 * ====================================
 */

/**
 * Configura todos os event listeners
 */
function configurarEventos() {
    const elementos = window.Render.elementos;
    
    // Botão adicionar
    elementos.addNumeroBtn.addEventListener('click', adicionarNumero);
    
    // Enter no input também adiciona
    elementos.numeroInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            adicionarNumero();
        }
    });
    
    // Botão desfazer
    elementos.desfazerBtn.addEventListener('click', desfazerUltimo);
    
    // Botão resetar
    elementos.resetBtn.addEventListener('click', resetarTudo);
    
    // Modal - Salvar
    elementos.saveEditBtn.addEventListener('click', salvarEdicao);
    
    // Modal - Cancelar
    elementos.cancelEditBtn.addEventListener('click', () => {
        window.Render.fecharModalEdicao();
    });
    
    // Enter no modal salva
    elementos.editNumeroInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            salvarEdicao();
        }
    });
    
    console.log('✅ Eventos configurados');
}

/**
 * ====================================
 * FUNÇÕES PRINCIPAIS
 * ====================================
 */

/**
 * Adiciona um novo número ao histórico
 */
function adicionarNumero() {
    const input = window.Render.elementos.numeroInput;
    const valor = input.value.trim();
    
    // Valida entrada vazia
    if (!valor) {
        window.Render.mostrarErro('Digite um número');
        return;
    }
    
    const numero = parseInt(valor);
    
    // Valida se é um número válido (0-36)
    if (isNaN(numero) || numero < 0 || numero > 36) {
        window.Render.mostrarErro('Número inválido! Use valores entre 0 e 36');
        return;
    }
    
    // Adiciona ao histórico
    estado.historico.push(numero);
    
    // Limpa o input
    window.Render.limparInput();
    
    // Salva no localStorage
    salvarHistorico();
    
    // Executa nova análise
    executarAnaliseCompleta();
    
    // Feedback visual aprimorado
    if (estado.analiseAtual.podeJogar) {
        mostrarNotificacao('🎯 GATILHO DE OURO DETECTADO!', 'sucesso');
    }
    
    console.log(`✅ Número ${numero} adicionado. Total: ${estado.historico.length}`);
}

/**
 * Remove o último número do histórico
 */
function desfazerUltimo() {
    if (estado.historico.length === 0) {
        window.Render.mostrarErro('Nenhum número para desfazer');
        return;
    }
    
    // Remove último número
    const removido = estado.historico.pop();
    
    // Salva
    salvarHistorico();
    
    // Atualiza análise
    executarAnaliseCompleta();
    
    // Notificação
    mostrarNotificacao(`Número ${removido} removido`, 'info');
    
    console.log(`↶ Número ${removido} removido`);
}

/**
 * Reseta todo o histórico
 */
function resetarTudo() {
    if (estado.historico.length === 0) {
        return;
    }
    
    // Mostra modal customizado
    mostrarModalConfirmacao(
        'Limpar Histórico',
        'Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.',
        () => {
            // Confirmou - limpa tudo
            estado.historico = [];
            estado.analiseAtual = null;
            
            // Limpa localStorage
            localStorage.removeItem('francoAtirador_historico');
            
            // Atualiza interface
            executarAnaliseCompleta();
            
            // Notificação
            mostrarNotificacao('Histórico limpo com sucesso', 'info');
            
            console.log('🗑️ Histórico resetado');
        }
    );
}

/**
 * Abre modal para editar um número
 * @param {number} index - Índice do número no histórico
 */
function abrirEdicao(index) {
    if (index < 0 || index >= estado.historico.length) {
        return;
    }
    
    estado.indexEdicao = index;
    const numeroAtual = estado.historico[index];
    
    window.Render.abrirModalEdicao(numeroAtual);
}

/**
 * Salva a edição de um número
 */
function salvarEdicao() {
    const input = window.Render.elementos.editNumeroInput;
    const valor = input.value.trim();
    
    if (!valor) {
        alert('Digite um número');
        return;
    }
    
    const numero = parseInt(valor);
    
    if (isNaN(numero) || numero < 0 || numero > 36) {
        alert('Número inválido! Use valores entre 0 e 36');
        return;
    }
    
    // Atualiza o número
    const numeroAntigo = estado.historico[estado.indexEdicao];
    estado.historico[estado.indexEdicao] = numero;
    
    // Fecha modal
    window.Render.fecharModalEdicao();
    
    // Salva e atualiza
    salvarHistorico();
    executarAnaliseCompleta();
    
    // Notificação
    mostrarNotificacao(`Alterado: ${numeroAntigo} → ${numero}`, 'sucesso');
    
    console.log(`✏️ Editado: ${numeroAntigo} → ${numero}`);
}

/**
 * ====================================
 * ANÁLISE E ATUALIZAÇÃO
 * ====================================
 */

/**
 * Executa análise completa e atualiza interface
 */
function executarAnaliseCompleta() {
    // Executa análise usando o módulo de lógica
    estado.analiseAtual = window.Logica.executarAnalise(estado.historico);
    
    // Atualiza toda a interface
    window.Render.atualizarInterface(estado.analiseAtual, abrirEdicao);
    
    // Se detectou gatilho forte, anima
    if (estado.analiseAtual.podeJogar) {
        window.Render.animarGatilhoAtivo();
        
        // Feedback sonoro ou visual adicional (opcional)
        console.log('🎯 GATILHO DETECTADO!', estado.analiseAtual.gatilho);
    } else {
        window.Render.pararAnimacaoGatilho();
    }
    
    // Log para debug
    console.log('📊 Análise:', estado.analiseAtual);
}

/**
 * ====================================
 * PERSISTÊNCIA (localStorage)
 * ====================================
 */

/**
 * Salva histórico no localStorage
 */
function salvarHistorico() {
    try {
        localStorage.setItem('francoAtirador_historico', JSON.stringify(estado.historico));
        console.log('💾 Histórico salvo');
    } catch (error) {
        console.error('Erro ao salvar:', error);
    }
}

/**
 * Carrega histórico do localStorage
 */
function carregarHistoricoSalvo() {
    try {
        const historicoSalvo = localStorage.getItem('francoAtirador_historico');
        
        if (historicoSalvo) {
            estado.historico = JSON.parse(historicoSalvo);
            console.log(`📂 Carregados ${estado.historico.length} números salvos`);
            
            // Notificação de boas-vindas
            setTimeout(() => {
                mostrarNotificacao(`${estado.historico.length} números restaurados`, 'info');
            }, 500);
        }
    } catch (error) {
        console.error('Erro ao carregar:', error);
        localStorage.removeItem('francoAtirador_historico');
    }
}

/**
 * ====================================
 * MODAL DE CONFIRMAÇÃO CUSTOMIZADO
 * ====================================
 */

/**
 * Mostra modal de confirmação bonito
 * @param {string} titulo - Título do modal
 * @param {string} mensagem - Mensagem de confirmação
 * @param {Function} onConfirm - Callback se confirmar
 */
function mostrarModalConfirmacao(titulo, mensagem, onConfirm) {
    // Cria o modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-azul-card border border-azul-borda p-8 rounded-xl shadow-2xl max-w-md w-full">
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-red-600 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold mb-2 text-white">${titulo}</h3>
                <p class="text-azul-texto-claro">${mensagem}</p>
            </div>
            <div class="flex gap-3">
                <button id="btnCancelar" class="flex-1 bg-azul-fundo border border-azul-borda hover:bg-azul-borda text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200">
                    Cancelar
                </button>
                <button id="btnConfirmar" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg">
                    Confirmar
                </button>
            </div>
        </div>
    `;
    
    // Adiciona ao body
    document.body.appendChild(modal);
    
    // Adiciona animação de entrada
    const card = modal.querySelector('.bg-azul-card');
    card.style.animation = 'modal-entrada 0.3s ease-out';
    
    // Eventos dos botões
    modal.querySelector('#btnConfirmar').addEventListener('click', () => {
        card.style.animation = 'modal-saida 0.2s ease-in';
        setTimeout(() => {
            document.body.removeChild(modal);
            onConfirm();
        }, 200);
    });
    
    modal.querySelector('#btnCancelar').addEventListener('click', () => {
        card.style.animation = 'modal-saida 0.2s ease-in';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 200);
    });
    
    // Fecha ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            card.style.animation = 'modal-saida 0.2s ease-in';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 200);
        }
    });
}

// CSS para animações
const animacoes = document.createElement('style');
animacoes.textContent = `
    @keyframes modal-entrada {
        from { 
            transform: scale(0.9) translateY(20px); 
            opacity: 0; 
        }
        to { 
            transform: scale(1) translateY(0); 
            opacity: 1; 
        }
    }
    @keyframes modal-saida {
        from { 
            transform: scale(1); 
            opacity: 1; 
        }
        to { 
            transform: scale(0.9); 
            opacity: 0; 
        }
    }
    @keyframes notificacao-entrada {
        from { 
            transform: translateX(100%); 
            opacity: 0; 
        }
        to { 
            transform: translateX(0); 
            opacity: 1; 
        }
    }
    @keyframes notificacao-saida {
        from { 
            transform: translateX(0); 
            opacity: 1; 
        }
        to { 
            transform: translateX(100%); 
            opacity: 0; 
        }
    }
    @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .animate-fade-in {
        animation: fade-in 0.3s ease-out;
    }
    .border-yellow-500 {
        border-color: #eab308 !important;
    }
`;
document.head.appendChild(animacoes);

/**
 * Mostra notificação temporária bonita
 * @param {string} mensagem - Mensagem para mostrar
 * @param {string} tipo - 'sucesso', 'erro', 'info'
 */
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    
    // Classes base
    let classes = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm flex items-center gap-3';
    let icone = '';
    
    // Define cor e ícone baseado no tipo
    switch(tipo) {
        case 'sucesso':
            classes += ' bg-green-600 text-white';
            icone = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`;
            break;
        case 'erro':
            classes += ' bg-red-600 text-white';
            icone = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`;
            break;
        default:
            classes += ' bg-blue-600 text-white';
            icone = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`;
    }
    
    notificacao.className = classes;
    notificacao.innerHTML = `${icone}<span class="font-medium">${mensagem}</span>`;
    notificacao.style.animation = 'notificacao-entrada 0.3s ease-out';
    
    document.body.appendChild(notificacao);
    
    // Remove após 3 segundos
    setTimeout(() => {
        notificacao.style.animation = 'notificacao-saida 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notificacao);
        }, 300);
    }, 3000);
}

/**
 * ====================================
 * FUNÇÕES DE DEBUG (DESENVOLVIMENTO)
 * ====================================
 */

// Expõe estado global para debug no console
window.debug = {
    // Visualizar estado
    verEstado: () => estado,
    
    // Visualizar última análise
    verAnalise: () => estado.analiseAtual,
    
    // Adicionar vários números de uma vez (para teste)
    adicionarVarios: (numeros) => {
        numeros.forEach(n => {
            estado.historico.push(n);
        });
        salvarHistorico();
        executarAnaliseCompleta();
    },
    
    // Simular cenários específicos
    simularConvergencia: () => {
        estado.historico = [3, 16, 5, 33, 10]; // 3→33, 16→33
        executarAnaliseCompleta();
    },
    
    simularDuelo: () => {
        estado.historico = [2, 3, 10, 5, 20]; // 2→22, 3→33
        executarAnaliseCompleta();
    },
    
    simularImprevisivel: () => {
        estado.historico = [1, 5, 10, 15, 20, 25]; // Muitas tendências
        executarAnaliseCompleta();
    }
};

console.log('💡 Dica: Use window.debug no console para funcões de debug');
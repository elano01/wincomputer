// logica.js - Toda a lógica de análise da estratégia Franco Atirador

/**
 * ====================================
 * CONFIGURAÇÕES E CONSTANTES
 * ====================================
 */

// Ordem física da roleta (sentido horário)
const ROLETA = [5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10];

// Cores dos números
const CORES = {
    vermelho: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    preto: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
    verde: [0]
};

// Tabela completa de puxadores
// Cada número puxa seus respectivos alvos
const TABELA_PUXADORES = {
    0:  [10, 20, 30],
    1:  [17, 7],
    2:  [2, 22],
    3:  [3, 33],
    4:  [21, 9],
    5:  [25, 15, 35],
    6:  [20, 17, 7],
    7:  [7, 17, 20],
    8:  [30, 0, 20],
    9:  [9, 19],
    10: [0, 20, 30],
    11: [30, 0, 20],
    12: [33, 15],
    13: [20, 7],
    14: [17, 7],
    15: [35, 9, 5],
    16: [3, 33],
    17: [17, 20, 7],
    18: [2, 22],
    19: [19, 9],
    20: [17, 7, 20],
    21: [2, 22],
    22: [2, 22],
    23: [0, 10],
    24: [35, 15, 25],
    25: [20, 22],
    26: [0, 10, 30],
    27: [17, 7, 20],
    28: [7, 17, 20],
    29: [7, 17, 20],
    30: [0, 20, 30],
    31: [9, 19],
    32: [0, 10, 20, 30],
    33: [3, 33],
    34: [7, 20],
    35: [3, 33, 15],
    36: [20, 30]
};

// Configurações da análise
const CONFIG = {
    JANELA_MINIMA: 3,              // Mudando de 5 para 3 números!
    MAX_TENDENCIAS_IMPREVISIVEL: 3, // 3 ou mais tendências = mesa imprevisível
    LIMIAR_AREA_PROXIMA: 5      // Distância máxima para considerar "mesma área"
};

/**
 * ====================================
 * FUNÇÕES AUXILIARES
 * ====================================
 */

/**
 * Calcula distância entre dois números na roleta
 * @param {number} num1 - Primeiro número
 * @param {number} num2 - Segundo número
 * @returns {number} Distância mínima
 */
function calcularDistanciaRoleta(num1, num2) {
    const idx1 = ROLETA.indexOf(parseInt(num1));
    const idx2 = ROLETA.indexOf(parseInt(num2));
    
    if (idx1 === -1 || idx2 === -1) return 999;
    
    const distanciaDireta = Math.abs(idx2 - idx1);
    const distanciaCircular = ROLETA.length - distanciaDireta;
    
    return Math.min(distanciaDireta, distanciaCircular);
}

/**
 * Agrupa números por proximidade na roleta
 * @param {number[]} numeros - Array de números
 * @param {number} distanciaMax - Distância máxima para agrupar
 * @returns {number[][]} Grupos de números próximos
 */
function agruparPorProximidade(numeros, distanciaMax = 3) {
    const grupos = [];
    const numerosRestantes = [...numeros];
    
    while (numerosRestantes.length > 0) {
        const grupo = [numerosRestantes.shift()];
        
        let i = 0;
        while (i < numerosRestantes.length) {
            let proximoDeAlgum = false;
            
            for (const numGrupo of grupo) {
                const distancia = calcularDistanciaRoleta(numerosRestantes[i], numGrupo);
                if (distancia <= distanciaMax) {
                    proximoDeAlgum = true;
                    break;
                }
            }
            
            if (proximoDeAlgum) {
                grupo.push(numerosRestantes.splice(i, 1)[0]);
                i = 0; // Recomeça
            } else {
                i++;
            }
        }
        
        grupos.push(grupo);
    }
    
    return grupos;
}

/**
 * Retorna a cor de um número
 * @param {number} numero - Número da roleta
 * @returns {string} 'vermelho', 'preto' ou 'verde'
 */
function getCorNumero(numero) {
    if (CORES.vermelho.includes(numero)) return 'vermelho';
    if (CORES.preto.includes(numero)) return 'preto';
    if (CORES.verde.includes(numero)) return 'verde';
    return '';
}

/**
 * Busca vizinhos de um número na roleta
 * @param {number} numeroAlvo - Número central
 * @param {number} qtdVizinhos - Quantidade de vizinhos de cada lado
 * @returns {number[]} Array com o número e seus vizinhos
 */
function buscarVizinhosCompletos(numeroAlvo, qtdVizinhos) {
    const numAlvoInt = parseInt(numeroAlvo);
    const index = ROLETA.indexOf(numAlvoInt);
    
    // Se número não está na roleta, retorna apenas ele
    if (index === -1) {
        return [numAlvoInt];
    }
    
    let vizinhosColetados = new Set();
    vizinhosColetados.add(numAlvoInt);
    
    // Coleta vizinhos de cada lado
    for (let i = 1; i <= qtdVizinhos; i++) {
        // Vizinho à esquerda (anti-horário)
        const idxEsquerda = (index - i + ROLETA.length) % ROLETA.length;
        vizinhosColetados.add(ROLETA[idxEsquerda]);
        
        // Vizinho à direita (horário)
        const idxDireita = (index + i) % ROLETA.length;
        vizinhosColetados.add(ROLETA[idxDireita]);
    }
    
    return Array.from(vizinhosColetados);
}

/**
 * Verifica se um número respeita o puxador
 * @param {number} numeroOrigem - Número que criou a tendência
 * @param {number} numeroSaido - Número que saiu depois
 * @returns {number} -1 (não respeitou), 0 (na cara), 1-3 (quantidade de vizinhos)
 */
function verificarRespeitoPuxador(numeroOrigem, numeroSaido) {
    const puxadores = TABELA_PUXADORES[numeroOrigem] || [];
    const numSaidoInt = parseInt(numeroSaido);
    
    // Verifica cada puxador
    for (const puxador of puxadores) {
        // Respeitou "na cara" (exatamente o número puxado)
        if (puxador === numSaidoInt) {
            return 0; // 0 = na cara
        }
        
        // Verifica respeito com vizinhos (1 a 3)
        for (let qtdVizinhos = 1; qtdVizinhos <= 3; qtdVizinhos++) {
            const vizinhos = buscarVizinhosCompletos(puxador, qtdVizinhos);
            if (vizinhos.includes(numSaidoInt)) {
                return qtdVizinhos;
            }
        }
    }
    
    // Não respeitou nenhum puxador
    return -1;
}

/**
 * ====================================
 * ANÁLISE DE TENDÊNCIAS
 * ====================================
 */

/**
 * Analisa tendências e resoluções
 * @param {number[]} historico - Array com todos os números
 * @returns {Object} Análise completa das tendências
 */
function analisarTendencias(historico) {
    const tendencias = [];
    const logResolucoes = [];
    
    // Cria uma tendência para cada número
    historico.forEach((numero, index) => {
        // Pega os puxadores, mas remove o próprio número
        const puxadoresBrutos = TABELA_PUXADORES[numero] || [];
        const puxadoresFiltrados = puxadoresBrutos.filter(p => p !== numero);
        
        tendencias.push({
            numeroOrigem: numero,
            alvos: puxadoresFiltrados,
            resolvida: false,
            indexOrigem: index
        });
    });
    
    // Verifica quais tendências foram resolvidas
    for (let i = 1; i < historico.length; i++) {
        for (let j = 0; j < i; j++) {
            if (!tendencias[j].resolvida && tendencias[j].alvos.length > 0) {
                const nivelRespeito = verificarRespeitoPuxador(
                    tendencias[j].numeroOrigem,
                    historico[i]
                );
                
                if (nivelRespeito >= 0) {
                    tendencias[j].resolvida = true;
                    
                    const tipoResolucao = nivelRespeito === 0 ? "NA CARA" : `${nivelRespeito} VIZINHO(S)`;
                    logResolucoes.push({
                        origem: tendencias[j].numeroOrigem,
                        resolvido: historico[i],
                        tipo: tipoResolucao,
                        mensagem: `✅ ${tendencias[j].numeroOrigem} → ${historico[i]} (${tipoResolucao})`
                    });
                }
            }
        }
    }
    
    // Separa tendências ativas das resolvidas
    const tendenciasAtivas = tendencias.filter(t => !t.resolvida && t.alvos.length > 0);
    const tendenciasResolvidas = tendencias.filter(t => t.resolvida);
    
    return {
        todas: tendencias,
        ativas: tendenciasAtivas,
        resolvidas: tendenciasResolvidas,
        logResolucoes: logResolucoes
    };
}

/**
 * ====================================
 * IDENTIFICAÇÃO DOS 5 PADRÕES
 * ====================================
 */

/**
 * Identifica o padrão atual da mesa
 * @param {number[]} historico - Todos os números
 * @param {Object} tendencias - Resultado de analisarTendencias
 * @returns {Object} Padrão identificado
 */
function identificarPadrao(historico, tendencias) {
    // Precisa de pelo menos 3 números
    if (historico.length < CONFIG.JANELA_MINIMA) {
        return {
            id: 0,
            nome: "Aguardando",
            descricao: "Adicione os últimos 3 números da mesa",
            podeJogar: false
        };
    }
    
    // PADRÃO 5: Mesa Imprevisível (3+ tendências ativas)
    if (tendencias.ativas.length >= CONFIG.MAX_TENDENCIAS_IMPREVISIVEL) {
        return {
            id: 5,
            nome: "Mesa Imprevisível",
            descricao: `${tendencias.ativas.length} tendências ativas - NÃO JOGAR!`,
            podeJogar: false
        };
    }
    
    // Analisa como as tendências foram resolvidas
    let resolvidasNaCara = 0;
    let resolvidasVizinho1 = 0;
    let resolvidasVizinho2 = 0;
    let resolvidasVizinho3 = 0;
    
    // Analisa TODAS as resoluções do histórico para encontrar padrão dominante
    tendencias.logResolucoes.forEach(log => {
        if (log.tipo === "NA CARA") resolvidasNaCara++;
        else if (log.tipo === "1 VIZINHO(S)") resolvidasVizinho1++;
        else if (log.tipo === "2 VIZINHO(S)") resolvidasVizinho2++;
        else if (log.tipo === "3 VIZINHO(S)") resolvidasVizinho3++;
    });
    
    // Se não há resoluções suficientes, analisa apenas tendências
    const totalResolucoes = resolvidasNaCara + resolvidasVizinho1 + resolvidasVizinho2 + resolvidasVizinho3;
    
    if (totalResolucoes === 0) {
        // Sem resoluções ainda
        if (tendencias.ativas.length > 0) {
            return {
                id: 4,
                nome: "Aguardando Primeiras Resoluções",
                descricao: `${tendencias.ativas.length} tendência(s) ativa(s) - Aguarde resoluções`,
                podeJogar: false
            };
        }
        
        return {
            id: 0,
            nome: "Iniciando Análise",
            descricao: "Aguardando tendências se formarem",
            podeJogar: false
        };
    }
    
    // Calcula qual padrão é dominante (maior quantidade)
    const padroes = [
        { tipo: "na_cara", count: resolvidasNaCara },
        { tipo: "vizinho_1", count: resolvidasVizinho1 },
        { tipo: "vizinho_2", count: resolvidasVizinho2 },
        { tipo: "vizinho_3", count: resolvidasVizinho3 }
    ];
    
    // Ordena por quantidade (maior primeiro)
    padroes.sort((a, b) => b.count - a.count);
    const padraoDominante = padroes[0];
    const segundoPadrao = padroes[1];
    
    // Verifica se há empate ou padrões muito próximos
    const empateOuProximo = segundoPadrao && 
        segundoPadrao.count > 0 && 
        (padraoDominante.count - segundoPadrao.count) <= 1;
    
    // Calcula porcentagem do padrão dominante
    const porcentagemDominante = totalResolucoes > 0 ? 
        Math.round((padraoDominante.count / totalResolucoes) * 100) : 0;
    
    // Adiciona informação sobre total de resoluções analisadas
    const infoResolucoes = totalResolucoes > 0 ? 
        ` (${padraoDominante.count}/${totalResolucoes} resoluções)` : "";
    
    // Debug: mostra cálculo estatístico (apenas em modo debug)
    if (totalResolucoes > 0 && typeof window !== 'undefined' && window.debug) {
        console.log("📊 Análise Estatística de Padrões:");
        padroes.forEach(p => {
            const nome = p.tipo === "na_cara" ? "NA CARA" :
                        p.tipo === "vizinho_1" ? "1 VIZINHO" :
                        p.tipo === "vizinho_2" ? "2 VIZINHOS" :
                        p.tipo === "vizinho_3" ? "3 VIZINHOS" : p.tipo;
            console.log(`- ${nome}: ${p.count} vezes (${Math.round((p.count/totalResolucoes)*100)}%)`);
        });
        console.log(`- TOTAL RESOLUÇÕES: ${totalResolucoes}`);
    }
    
    // Se há empate ou padrões muito próximos, indica padrão misto
    if (empateOuProximo && porcentagemDominante < 60) {
        // Mostra os dois padrões principais
        const formatarTipo = (tipo) => {
            switch(tipo) {
                case "na_cara": return "NA CARA";
                case "vizinho_1": return "1 VIZ";
                case "vizinho_2": return "2 VIZ";
                case "vizinho_3": return "3 VIZ";
                default: return tipo;
            }
        };
        
        const tipo1 = formatarTipo(padraoDominante.tipo);
        const tipo2 = formatarTipo(segundoPadrao.tipo);
        
        return {
            id: 4,
            nome: "Padrão Misto",
            descricao: `Mesa instável - ${tipo1} (${padraoDominante.count}) vs ${tipo2} (${segundoPadrao.count})`,
            podeJogar: false
        };
    }
    
    // Verifica se há resoluções suficientes para confiar no padrão
    const confiancaPadrao = totalResolucoes >= 5 ? "Muito Alta" :
                           totalResolucoes >= 3 ? "Alta" : 
                           totalResolucoes >= 2 ? "Média" : "Baixa";
    
    // PADRÃO 1: Na cara ou 1 vizinho dominante
    if ((padraoDominante.tipo === "na_cara" || padraoDominante.tipo === "vizinho_1") && padraoDominante.count > 0) {
        const detalhes = padraoDominante.tipo === "na_cara" ? "NA CARA" : "1 VIZINHO";
        return {
            id: 1,
            nome: "Respeitando na Cara/1 Vizinho",
            descricao: `MELHOR MOMENTO - ${detalhes} dominante${infoResolucoes} - Confiança: ${confiancaPadrao}`,
            podeJogar: true
        };
    }
    
    // PADRÃO 2: 2 vizinhos dominante
    if (padraoDominante.tipo === "vizinho_2" && padraoDominante.count > 0) {
        return {
            id: 2,
            nome: "Respeitando para 2 Vizinhos",
            descricao: `Boa oportunidade - 2 VIZINHOS dominante${infoResolucoes} - Confiança: ${confiancaPadrao}`,
            podeJogar: true
        };
    }
    
    // PADRÃO 3: 3 vizinhos dominante
    if (padraoDominante.tipo === "vizinho_3" && padraoDominante.count > 0) {
        return {
            id: 3,
            nome: "Respeitando para 3 Vizinhos",
            descricao: `Oportunidade moderada - 3 VIZINHOS dominante${infoResolucoes} - Confiança: ${confiancaPadrao}`,
            podeJogar: true
        };
    }
    
    // PADRÃO 4: Verificar repetição (números na mesma área)
    // Por enquanto, vamos considerar padrão 4 quando não há resoluções claras
    // mas há tendências ativas
    if (tendencias.ativas.length > 0) {
        // Verifica se os últimos números estão próximos na roleta
        const ultimos5 = historico.slice(-5);
        if (ultimos5.length >= 3) {
            // Agrupa por proximidade
            const grupos = agruparPorProximidade(ultimos5, 4);
            const maiorGrupo = grupos.reduce((maior, atual) => 
                atual.length > maior.length ? atual : maior, []
            );
            
            // Se 60%+ dos números estão na mesma área
            if ((maiorGrupo.length / ultimos5.length) >= 0.6) {
                return {
                    id: 4,
                    nome: "Repetição de Área",
                    descricao: `Números concentrados na mesma região - Apostar na área`,
                    podeJogar: true,
                    area: maiorGrupo
                };
            }
        }
        
        return {
            id: 4,
            nome: "Mesa em Transição",
            descricao: "Aguardando padrão se estabelecer",
            podeJogar: false
        };
    }
    
    // Padrão indefinido
    return {
        id: 0,
        nome: "Analisando",
        descricao: "Coletando mais dados...",
        podeJogar: false
    };
}

/**
 * ====================================
 * DETECÇÃO DOS 3 GATILHOS DE OURO
 * ====================================
 */

/**
 * Detecta os gatilhos de ouro
 * @param {Object} tendencias - Resultado de analisarTendencias
 * @returns {Object} Gatilho detectado (se houver)
 */
function detectarGatilhos(tendencias) {
    // Sem tendências ativas, sem gatilho
    if (tendencias.ativas.length === 0) {
        return {
            tipo: "nenhum",
            nome: "Nenhum Gatilho",
            alvos: [],
            forca: 0
        };
    }
    
    // GATILHO 1: Convergência FORTE (2+ tendências apontam para o MESMO alvo SEM muita dispersão)
    const contagemAlvos = {};
    const todosAlvosUnicos = new Set();
    
    tendencias.ativas.forEach(tendencia => {
        tendencia.alvos.forEach(alvo => {
            contagemAlvos[alvo] = (contagemAlvos[alvo] || 0) + 1;
            todosAlvosUnicos.add(alvo);
        });
    });
    
    // Encontra alvos com convergência
    const alvosConvergentes = Object.entries(contagemAlvos)
        .filter(([alvo, count]) => count >= 2)
        .map(([alvo, count]) => ({
            numero: parseInt(alvo),
            quantidadeTendencias: count
        }))
        .sort((a, b) => b.quantidadeTendencias - a.quantidadeTendencias);
    
    // Verifica se há convergência FORTE (sem muita dispersão)
    if (alvosConvergentes.length > 0) {
        // Calcula dispersão: quantos alvos existem além dos convergentes
        const totalAlvosDispersao = todosAlvosUnicos.size;
        const alvosNaoConvergentes = totalAlvosDispersao - alvosConvergentes.length;
        
        // Se há muitos alvos dispersos (mais que 2), não é um gatilho forte
        if (alvosNaoConvergentes > 2) {
            return {
                tipo: "convergencia_fraca",
                nome: "Convergência com Dispersão",
                alvos: alvosConvergentes.map(a => a.numero),
                forca: 60,
                detalhes: `Convergência detectada mas há ${alvosNaoConvergentes} outros alvos dispersos`
            };
        }
        
        // Convergência FORTE - poucos alvos dispersos
        return {
            tipo: "convergencia",
            nome: "Convergência de Ouro",
            alvos: alvosConvergentes.map(a => a.numero),
            forca: 95,
            detalhes: `${alvosConvergentes[0].quantidadeTendencias} tendências convergem com foco!`
        };
    }
    
    // GATILHO 2: Convergência de ÁREA (alvos muito próximos fisicamente)
    if (tendencias.ativas.length >= 2) {
        // Pega todos os alvos
        const todosAlvos = [];
        tendencias.ativas.forEach(t => todosAlvos.push(...t.alvos));
        
        // Agrupa alvos próximos (máximo 3 posições de distância na roleta)
        const grupos = agruparPorProximidade(todosAlvos, 3);
        
        // Procura grupo dominante (60%+ dos alvos)
        const maiorGrupo = grupos.reduce((maior, atual) => 
            atual.length > maior.length ? atual : maior, []
        );
        
        const porcentagemGrupo = (maiorGrupo.length / todosAlvos.length) * 100;
        
        if (porcentagemGrupo >= 70) {
            return {
                tipo: "convergencia_area",
                nome: "Convergência de Área",
                alvos: [...new Set(maiorGrupo)], // Remove duplicatas
                forca: 85,
                detalhes: `${Math.round(porcentagemGrupo)}% dos alvos na mesma região!`
            };
        }
    }
    
    // GATILHO 3: Duelo Limpo PERFEITO (exatamente 2 tendências, 1 alvo cada, SEM dispersão)
    if (tendencias.ativas.length === 2) {
        const [t1, t2] = tendencias.ativas;
        
        // Deve ter EXATAMENTE 1 alvo cada
        if (t1.alvos.length === 1 && t2.alvos.length === 1 && t1.alvos[0] !== t2.alvos[0]) {
            return {
                tipo: "duelo",
                nome: "Duelo Limpo Perfeito",
                alvos: [t1.alvos[0], t2.alvos[0]],
                forca: 90,
                detalhes: `${t1.numeroOrigem}→${t1.alvos[0]} vs ${t2.numeroOrigem}→${t2.alvos[0]}`
            };
        }
    }
    
    // Se há tendências mas sem gatilho forte
    if (tendencias.ativas.length > 0) {
        return {
            tipo: "tendencias",
            nome: "Tendências Ativas",
            alvos: [],
            forca: 40,
            detalhes: `${tendencias.ativas.length} tendência(s) sem convergência clara`
        };
    }
    
    return {
        tipo: "nenhum",
        nome: "Aguardando Gatilho",
        alvos: [],
        forca: 0
    };
}

/**
 * ====================================
 * FUNÇÃO PRINCIPAL DE ANÁLISE
 * ====================================
 */

/**
 * Executa análise completa
 * @param {number[]} historico - Todos os números inseridos
 * @returns {Object} Análise completa com padrão, gatilho e recomendações
 */
function executarAnalise(historico) {
    // Analisa tendências
    const tendencias = analisarTendencias(historico);
    
    // Identifica padrão
    const padrao = identificarPadrao(historico, tendencias);
    
    // Detecta gatilhos
    const gatilho = detectarGatilhos(tendencias);
    
    // Decisão final
    const podeJogar = padrao.podeJogar && gatilho.forca >= 80; // Aumentei para 80!
    
    // Calcula estatísticas
    const totalTendencias = tendencias.todas.filter(t => t.alvos.length > 0).length;
    const taxaResolucao = totalTendencias > 0 
        ? Math.round((tendencias.resolvidas.length / totalTendencias) * 100)
        : 0;
    
    return {
        historico: historico,
        tendencias: tendencias,
        padrao: padrao,
        gatilho: gatilho,
        podeJogar: podeJogar,
        estatisticas: {
            numerosAnalisados: historico.length,
            tendenciasAtivas: tendencias.ativas.length,
            tendenciasResolvidas: tendencias.resolvidas.length,
            taxaResolucao: taxaResolucao,
            // Adiciona detalhes das resoluções
            resolucoes: {
                naCara: tendencias.logResolucoes.filter(l => l.tipo === "NA CARA").length,
                vizinho1: tendencias.logResolucoes.filter(l => l.tipo === "1 VIZINHO(S)").length,
                vizinho2: tendencias.logResolucoes.filter(l => l.tipo === "2 VIZINHO(S)").length,
                vizinho3: tendencias.logResolucoes.filter(l => l.tipo === "3 VIZINHO(S)").length
            }
        }
    };
}

/**
 * ====================================
 * EXPORTAÇÕES
 * ====================================
 */

// Exporta funções e constantes necessárias
window.Logica = {
    // Funções principais
    executarAnalise,
    
    // Funções auxiliares (caso o render precise)
    getCorNumero,
    buscarVizinhosCompletos,
    
    // Constantes
    CONFIG,
    CORES,
    TABELA_PUXADORES
};

/**
 * ====================================
 * EXEMPLOS DOS GATILHOS (PARA TESTE)
 * ====================================
 */

// Exemplos de cada gatilho para referência
window.exemplosGatilhos = {
    // Com apenas 3 números já funciona!
    rapidoComTres: {
        descricao: "Análise rápida com apenas 3 números",
        exemplo: "Números: 3, 16, 33",
        explicacao: "Com 3 números já detecta convergência: 3→33 e 16→33!",
        comando: "window.debug.adicionarVarios([3, 16, 33])"
    },
    
    // GATILHO 1: Convergência de Ouro (força: 95)
    convergenciaForte: {
        descricao: "2+ tendências convergem SEM dispersão",
        exemplo: "Números: 3, 16, 10, 33",
        explicacao: "3→33 e 16→33 convergem. Apenas 1 outro alvo (3), pouca dispersão!",
        comando: "window.debug.adicionarVarios([3, 16, 10, 33])"
    },
    
    // Convergência Fraca (força: 60) - NÃO É GATILHO DE OURO
    convergenciaFraca: {
        descricao: "Convergência mas com muita dispersão",
        exemplo: "Números: 10, 25, 5, 20", 
        explicacao: "10→20 e 25→20 convergem, MAS também tem 0,30,22 dispersos",
        comando: "window.debug.adicionarVarios([10, 25, 5, 20])"
    },
    
    // GATILHO 2: Convergência de Área (força: 85)
    convergenciaArea: {
        descricao: "70%+ dos alvos na mesma região física",
        exemplo: "Números: 24, 12, 35, 10",
        explicacao: "Alvos 35,15,25,33,15 todos próximos na roleta",
        comando: "window.debug.adicionarVarios([24, 12, 35, 10])"
    },
    
    // GATILHO 3: Duelo Limpo Perfeito (força: 90)
    dueloLimpo: {
        descricao: "Exatamente 2 tendências, 1 alvo cada",
        exemplo: "Números: 2, 3, 10, 5",
        explicacao: "2→22 vs 3→33. Limpo, sem dispersão!",
        comando: "window.debug.adicionarVarios([2, 3, 10, 5])"
    },
    
    // NÃO É GATILHO - Mesa Imprevisível
    mesaImprevisivel: {
        descricao: "3+ tendências ativas = NÃO JOGAR",
        exemplo: "Números: 1, 5, 10, 15, 20",
        explicacao: "Muitas tendências, mesa confusa",
        comando: "window.debug.adicionarVarios([1, 5, 10, 15, 20])"
    }
};

console.log("💡 Use window.exemplosGatilhos para ver exemplos de cada gatilho");
console.log("📝 Exemplo: window.exemplosGatilhos.convergenciaForte");
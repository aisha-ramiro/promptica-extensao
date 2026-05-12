document.addEventListener("DOMContentLoaded", () => {
  // =====================================
  // UTILITÁRIO PARA TROCAR TELAS
  // =====================================
  const STORAGE_KEY = "prompticaHistory";
  const GEMINI_API_KEY = window.GEMINI_API_KEY || "";
  const PRIMARY_MODEL = "gemini-3-flash-preview";
  const FALLBACK_MODEL = "gemini-2.5-flash-lite";
  const GENERATIVE_LANGUAGE_BASES = [
    "https://generativelanguage.googleapis.com/v1beta/models",
    "https://generativelanguage.googleapis.com/v1beta2/models",
    "https://generativelanguage.googleapis.com/v1/models"
  ];
  const MODEL_ALIASES = {
    "gemini-3-flash-preview": ["gemini-3-flash-preview", "gemini-3-flash"],
    "gemini-2.5-flash-lite": ["gemini-2.5-flash-lite", "gemini-2.5-flash"]
  };
  let historyData = [];
  let currentPromptData = null;

  function mostrarTela(telaId) {
    document.querySelectorAll(
      "#telaInicial, #checklist, #resultado, #login-screen, #cadastro-screen, #historico-screen, #visualizar-prompt-screen, #minha-conta, #editar-perfil, #ajuda-suporte, #fale-conosco, #politica-privacidade"
    ).forEach(tela => tela.classList.add("hidden"));

    document.getElementById(telaId).classList.remove("hidden");
  }

  function salvarHistorico(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function carregarHistorico() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("Erro ao carregar histórico:", error);
      return [];
    }
  }

  function buscarPromptPorId(id) {
    return historyData.find(entry => entry.id === id);
  }

  function renderizarHistorico() {
    const lista = document.querySelector(".prompt-list");
    if (!lista) return;

    lista.innerHTML = "";

    if (!historyData.length) {
      lista.innerHTML = `<div class="prompt-empty">Nenhum prompt salvo. Gere e salve seu primeiro prompt.</div>`;
      return;
    }

    historyData.slice().reverse().forEach(prompt => {
      const item = document.createElement("div");
      item.className = "prompt-item";

      const row = document.createElement("div");
      row.className = "prompt-checkbox-row";

      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.className = "prompt-checkbox";
      checkbox.type = "checkbox";
      checkbox.dataset.id = prompt.id;
      label.appendChild(checkbox);

      const text = document.createElement("div");
      text.className = "prompt-text";
      text.textContent = prompt.text.split("\n")[0] || "Prompt salvo";

      row.append(label, text);

      const actions = document.createElement("div");
      actions.className = "prompt-actions";
      actions.innerHTML = `
        <a href="#" class="visualizarPrompt" data-id="${prompt.id}">Visualizar</a> /
        <a href="#" class="editarPrompt" data-id="${prompt.id}">Editar</a> /
        <a href="#" class="excluirPrompt" data-id="${prompt.id}">Excluir</a>
      `;

      item.append(row, actions);
      lista.appendChild(item);
    });
  }

  function abrirVisualizacao(id) {
    const prompt = buscarPromptPorId(id);
    if (!prompt) return;
    const visualizarOutput = document.getElementById("visualizarOutput");
    if (visualizarOutput) {
      visualizarOutput.innerText = prompt.text;
    }
    currentPromptData = prompt;
    mostrarTela("visualizar-prompt-screen");
  }

  function abrirEdicao(id) {
    const prompt = buscarPromptPorId(id);
    if (!prompt) return;

    Object.keys(prompt.data).forEach(campo => {
      const el = document.getElementById(campo);
      if (el) el.value = prompt.data[campo] || "";
    });

    currentPromptData = prompt;
    mostrarTela("checklist");
  }

  function excluirPrompt(id) {
    historyData = historyData.filter(entry => entry.id !== id);
    salvarHistorico(historyData);
    renderizarHistorico();
  }

  function coletarCamposSelecionados() {
    const campos = {
      contexto: "Contexto",
      instrucao: "Instruções",
      exemplo: "Exemplos",
      restricoes: "Restrições",
      tom: "Tom",
      saida: "Saída esperada",
      suporte: "Conteúdo adicional"
    };

    const data = {};
    let promptFinal = "";

    for (const campo in campos) {
      const el = document.getElementById(campo);
      const card = el ? el.closest(".card") : null;
      const checkbox = card ? card.querySelector(".card-header input[type='checkbox']") : null;
      const checked = checkbox ? checkbox.checked : true;
      const valor = el ? el.value.trim() : "";

      data[campo] = valor;
      if (checked && valor) {
        promptFinal += `${campos[campo]}: ${valor}\n\n`;
      }
    }

    return { data, promptFinal };
  }

  function copiarTexto(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return Promise.resolve();
  }

  function construirPromptDeIA(data) {
    const campos = {
      contexto: "Contexto",
      instrucao: "Instruções",
      exemplo: "Exemplos",
      restricoes: "Restrições",
      tom: "Tom",
      saida: "Saída esperada",
      suporte: "Conteúdo adicional"
    };

    const partes = [];
    for (const campo in campos) {
      if (data[campo] && data[campo].trim()) {
        partes.push(`${campos[campo]}: ${data[campo].trim()}`);
      }
    }

    return `Você é um engenheiro de prompts especializado em criar instruções perfeitas para IA. Use as informações abaixo para montar um prompt final claro, completo e pronto para uso.

${partes.join("\n\n")}

- Mantenha a linguagem objetiva.
- Respeite o tom, as restrições e o formato de saída esperados.
- Retorne apenas o prompt final, sem explicações adicionais.`;
  }

  function extrairRespostaGemini(json) {
    if (!json) return null;
    if (json.candidates && Array.isArray(json.candidates) && json.candidates.length) {
      const candidate = json.candidates[0];
      if (candidate.content && Array.isArray(candidate.content.parts)) {
        return candidate.content.parts.map(part => part.text || "").join("");
      }
      if (candidate.content && candidate.content.text) {
        return candidate.content.text;
      }
    }
    if (json.predictions && Array.isArray(json.predictions) && json.predictions.length) {
      const prediction = json.predictions[0];
      if (prediction.content) {
        if (Array.isArray(prediction.content)) {
          return prediction.content.map(item => item.text || item).join("");
        }
        return prediction.content;
      }
    }
    return json.response || json.text || null;
  }

  function buildEndpoint(model, base) {
    return `${base}/${model}:generateContent`;
  }

  async function requestModel(model, data) {
    if (!GEMINI_API_KEY) {
      throw new Error("Chave de API não definida. Coloque sua chave em config.js.");
    }
    const aliases = MODEL_ALIASES[model] || [model];
    const promptText = construirPromptDeIA(data);
    const payload = {
      contents: [
        {
          parts: [
            {
              text: promptText
            }
          ]
        }
      ]
    };

    const triedEndpoints = [];

    for (const base of GENERATIVE_LANGUAGE_BASES) {
      for (const alias of aliases) {
        const endpoint = buildEndpoint(alias, base);
        triedEndpoints.push(endpoint);
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          if (response.status === 404) {
            continue;
          }
          const errorText = await response.text();
          const error = new Error(`${alias} -> ${response.status} ${errorText}`);
          error.code = response.status;
          throw error;
        }

        const result = await response.json();
        const texto = extrairRespostaGemini(result);
        if (!texto) {
          continue;
        }
        return texto.trim();
      }
    }

    const endpoints = triedEndpoints.join("\n");
    throw new Error(`Nenhum endpoint válido encontrado para o modelo ${model}. Endpoints testados:\n${endpoints}`);
  }

  async function gerarPromptGemini(data) {
    try {
      return await requestModel(PRIMARY_MODEL, data);
    } catch (error) {
      console.warn(`Falha no modelo ${PRIMARY_MODEL}, tentando fallback ${FALLBACK_MODEL}.`, error);
      return await requestModel(FALLBACK_MODEL, data);
    }
  }

  historyData = carregarHistorico();
  renderizarHistorico();

  // =====================================
  // BOTÕES DA TELA INICIAL
  // =====================================
  const btnNovoPrompt = document.getElementById("novoPrompt");
  if (btnNovoPrompt) {
    btnNovoPrompt.addEventListener("click", () => mostrarTela("checklist"));
  }

  const btnLogin = document.getElementById("login");
  if (btnLogin) {
    btnLogin.addEventListener("click", () => mostrarTela("login-screen"));
  }

  const btnMeusPrompts = document.getElementById("meusPrompts");
  if (btnMeusPrompts) {
    btnMeusPrompts.addEventListener("click", () => mostrarTela("historico-screen"));
  }

  // =====================================
  // VOLTAR ENTRE TELAS
  // =====================================
  const backFromChecklist = document.getElementById("backFromChecklist");
  if (backFromChecklist)
    backFromChecklist.addEventListener("click", () => mostrarTela("telaInicial"));

  const backFromResult = document.getElementById("backFromResult");
  if (backFromResult)
    backFromResult.addEventListener("click", () => mostrarTela("checklist"));

  const backFromLogin = document.getElementById("backFromLogin");
  if (backFromLogin)
    backFromLogin.addEventListener("click", () => mostrarTela("telaInicial"));

  const backFromCadastro = document.getElementById("backFromCadastro");
  if (backFromCadastro)
    backFromCadastro.addEventListener("click", () => mostrarTela("login-screen"));

  const backFromHistorico = document.getElementById("backFromHistorico");
  if (backFromHistorico)
    backFromHistorico.addEventListener("click", () => mostrarTela("telaInicial"));

  const backFromVisualizar = document.getElementById("backFromVisualizar");
  if (backFromVisualizar)
    backFromVisualizar.addEventListener("click", () => mostrarTela("historico-screen"));

  // =====================================
  // LINK PARA CADASTRAR-SE
  // =====================================
  const goToCadastro = document.getElementById("goToCadastro");
  if (goToCadastro)
    goToCadastro.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarTela("cadastro-screen");
    });

  // =====================================
  // GERAR PROMPT
  // =====================================
  const gerarBtn = document.getElementById("gerar");
  if (gerarBtn) {
    gerarBtn.addEventListener("click", async () => {
      const { data } = coletarCamposSelecionados();
      const outputEl = document.getElementById("output");
      const loader = document.getElementById("loadingIndicator");

      if (loader) {
        loader.classList.remove("hidden");
      }
      if (outputEl) {
        outputEl.classList.add("hidden");
        outputEl.innerText = "";
      }
      mostrarTela("resultado");

      try {
        const resultText = await gerarPromptGemini(data);
        currentPromptData = {
          id: Date.now().toString(),
          text: resultText,
          data,
          createdAt: new Date().toISOString()
        };
        if (outputEl) {
          outputEl.innerText = resultText;
          outputEl.classList.remove("hidden");
        }
      } catch (error) {
        const message = error.message || "Erro desconhecido ao gerar prompt.";
        if (outputEl) {
          outputEl.innerText = `Erro: ${message}`;
          outputEl.classList.remove("hidden");
        }
        console.error("Gemini generation error:", error);
      } finally {
        if (loader) {
          loader.classList.add("hidden");
        }
      }
    });
  }

  // =====================================
  // ACCORDION DOS CARDS
  // =====================================
  document.querySelectorAll('.card-header').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.card');
      const content = card.querySelector('.card-content');
      const toggleIcon = header.querySelector('.accordion-toggle');

      content.classList.toggle('show');
      toggleIcon.classList.toggle('rotated');
    });
  });

  document.querySelectorAll('.card-header input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('click', e => e.stopPropagation());
  });

  // =====================================
  // HISTÓRICO: SELECIONAR TUDO
  // =====================================
  const selectAll = document.getElementById("selectAllPrompts");
  if (selectAll) {
    selectAll.addEventListener("change", () => {
      const checkboxes = document.querySelectorAll(".prompt-checkbox");
      checkboxes.forEach(cb => cb.checked = selectAll.checked);
    });
  }

  // =====================================
  // HISTÓRICO: VISUALIZAR, EDITAR E EXCLUIR
  // =====================================
  const promptList = document.querySelector(".prompt-list");
  if (promptList) {
    promptList.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      const id = target.dataset.id;
      if (!id) return;

      e.preventDefault();

      if (target.classList.contains("visualizarPrompt")) {
        abrirVisualizacao(id);
      } else if (target.classList.contains("editarPrompt")) {
        abrirEdicao(id);
      } else if (target.classList.contains("excluirPrompt")) {
        excluirPrompt(id);
      }
    });
  }

  const deletarSelecionados = document.getElementById("deletarSelecionados");
  if (deletarSelecionados) {
    deletarSelecionados.addEventListener("click", () => {
      const selecionados = Array.from(document.querySelectorAll(".prompt-checkbox:checked")).map(cb => cb.dataset.id);
      if (!selecionados.length) {
        alert("Selecione ao menos um prompt para excluir.");
        return;
      }
      historyData = historyData.filter(entry => !selecionados.includes(entry.id));
      salvarHistorico(historyData);
      renderizarHistorico();
      if (selectAll) selectAll.checked = false;
    });
  }

  const copiarBtn = document.getElementById("copiar");
  if (copiarBtn) {
    copiarBtn.addEventListener("click", () => {
      if (!currentPromptData || !currentPromptData.text) return;
      copiarTexto(currentPromptData.text).then(() => alert("Prompt copiado!"));
    });
  }

  const salvarBtn = document.getElementById("salvarPrompt");
  if (salvarBtn) {
    salvarBtn.addEventListener("click", () => {
      if (!currentPromptData || !currentPromptData.text) return;
      historyData.push(currentPromptData);
      salvarHistorico(historyData);
      renderizarHistorico();
      alert("Prompt salvo no histórico!");
    });
  }

  const copiarVisualizacao = document.getElementById("copiarVisualizacao");
  if (copiarVisualizacao) {
    copiarVisualizacao.addEventListener("click", () => {
      const output = document.getElementById("visualizarOutput");
      if (!output) return;
      copiarTexto(output.innerText).then(() => alert("Prompt copiado!"));
    });
  }

  const editarVisualizacao = document.getElementById("editarVisualizacao");
  if (editarVisualizacao) {
    editarVisualizacao.addEventListener("click", () => {
      if (!currentPromptData) return;
      abrirEdicao(currentPromptData.id);
    });
  }

  const excluirVisualizacao = document.getElementById("excluirVisualizacao");
  if (excluirVisualizacao) {
    excluirVisualizacao.addEventListener("click", () => {
      if (!currentPromptData) return;
      excluirPrompt(currentPromptData.id);
      mostrarTela("historico-screen");
    });
  }

// ============================
// PÁGINAS DO USUÁRIO
// ============================

// Botão do cabeçalho para abrir "Minha Conta"
const userBtn = document.getElementById("userIconBtn");
if (userBtn) {
  userBtn.addEventListener("click", () => {
    mostrarTela("minha-conta");
  });
}

// Botão "Voltar" de Minha Conta para tela inicial
const backFromMinhaConta = document.getElementById("backFromMinhaConta");
if (backFromMinhaConta) {
  backFromMinhaConta.addEventListener("click", () => {
    mostrarTela("telaInicial");
  });
}

// Botão "Editar perfil"
const editarPerfilBtn = document.getElementById("editarPerfilBtn");
if (editarPerfilBtn) {
  editarPerfilBtn.addEventListener("click", () => {
    mostrarTela("editar-perfil");
  });
}

// Botão "Ajuda e Suporte"
const ajudaSuporteBtn = document.getElementById("ajudaSuporteBtn");
if (ajudaSuporteBtn) {
  ajudaSuporteBtn.addEventListener("click", () => {
    mostrarTela("ajuda-suporte");
  });
}

// Botão "Fale Conosco"
const faleConoscoBtn = document.getElementById("faleConoscoBtn");
if (faleConoscoBtn) {
  faleConoscoBtn.addEventListener("click", () => {
    mostrarTela("fale-conosco");
  });
}

// Botão "Política de Privacidade"
const privacidadeBtn = document.getElementById("privacidadeBtn");
if (privacidadeBtn) {
  privacidadeBtn.addEventListener("click", () => {
    mostrarTela("politica-privacidade");
  });
}

// Botões de voltar dessas páginas
const backFromEditarPerfil = document.getElementById("backFromEditarPerfil");
if (backFromEditarPerfil) {
  backFromEditarPerfil.addEventListener("click", () => {
    mostrarTela("minha-conta");
  });
}

const backFromAjudaSuporte = document.getElementById("backFromAjudaSuporte");
if (backFromAjudaSuporte) {
  backFromAjudaSuporte.addEventListener("click", () => {
    mostrarTela("minha-conta");
  });
}

const backFromFaleConosco = document.getElementById("backFromFaleConosco");
if (backFromFaleConosco) {
  backFromFaleConosco.addEventListener("click", () => {
    mostrarTela("minha-conta");
  });
}

const backFromPrivacidade = document.getElementById("backFromPrivacidade");
if (backFromPrivacidade) {
  backFromPrivacidade.addEventListener("click", () => {
    mostrarTela("minha-conta");
  });
}


});

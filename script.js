document.addEventListener("DOMContentLoaded", () => {
  // =====================================
  // UTILITÁRIO PARA TROCAR TELAS
  // =====================================
  const STORAGE_KEY = "prompticaHistory";
  const SUPABASE_SESSION_KEY = "prompticaSupabaseSession";
  const GEMINI_API_KEY = window.GEMINI_API_KEY || "";
  const SUPABASE_URL = window.SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";
  const SUPABASE_PROMPTS_TABLE = window.SUPABASE_PROMPTS_TABLE || "prompts";
  const SUPABASE_PROMPTS_DATA_COLUMN = window.SUPABASE_PROMPTS_DATA_COLUMN || "";
  const SUPABASE_PROFILES_TABLE = window.SUPABASE_PROFILES_TABLE || "profiles";
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
  let supabaseSession = null;
  let currentUser = null;
  let currentProfile = null;
  let screenHistory = [];
  let currentScreen = "telaInicial";

  function normalizeSupabaseUrl(url) {
    if (!url) return "";
    return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  }

  function supabaseApiUrl(path) {
    const base = normalizeSupabaseUrl(SUPABASE_URL);
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  function getSupabaseSession() {
    const raw = localStorage.getItem(SUPABASE_SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("Erro ao ler sessão Supabase:", error);
      return null;
    }
  }

  function saveSupabaseSession(session) {
    if (!session) {
      localStorage.removeItem(SUPABASE_SESSION_KEY);
      return;
    }
    localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(session));
  }

  function clearSupabaseSession() {
    supabaseSession = null;
    currentUser = null;
    localStorage.removeItem(SUPABASE_SESSION_KEY);
  }

  function getSupabaseHeaders(useAuth = true) {
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Accept: "application/json"
    };
    if (useAuth && supabaseSession && supabaseSession.access_token) {
      headers.Authorization = `Bearer ${supabaseSession.access_token}`;
    }
    headers["Content-Type"] = "application/json";
    return headers;
  }

  async function initSupabase() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return;
    }
    supabaseSession = getSupabaseSession();
    currentUser = supabaseSession?.user || null;
    updateHomeButtonsVisibility();
    if (currentUser) {
      await loadUserProfile();
      await loadPromptsFromSupabase();
    }
  }

  async function signInSupabase(email, password) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Configuração do Supabase não definida.");
    }

    const response = await fetch(supabaseApiUrl("/auth/v1/token?grant_type=password"), {
      method: "POST",
      headers: getSupabaseHeaders(false),
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error_description || result.error || "Falha ao autenticar no Supabase.");
    }

    const authData = result.user ? result : (result.data || result);
    if (!authData.user) {
      throw new Error("Falha ao autenticar: resposta de login inválida.");
    }

    supabaseSession = authData;
    currentUser = authData.user;
    saveSupabaseSession(authData);
    updateHomeButtonsVisibility();
    await loadUserProfile();
    await loadPromptsFromSupabase();
  }

  async function signUpSupabase(email, password, profileData = {}) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Configuração do Supabase não definida.");
    }

    const response = await fetch(supabaseApiUrl("/auth/v1/signup"), {
      method: "POST",
      headers: getSupabaseHeaders(false),
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    console.log("Supabase signup result:", result);
    if (!response.ok) {
      throw new Error(result.error_description || result.msg || result.error || "Falha ao cadastrar no Supabase.");
    }

    const authData = result.user ? result : (result.data || result);
    if (!authData.user) {
      throw new Error(authData.msg || authData.error || "Usuário não foi criado. Verifique as configurações do Supabase.");
    }

    if (!authData.access_token) {
      alert("Cadastro criado. Confirme seu email e faça login para continuar.");
      return;
    }

    supabaseSession = authData;
    currentUser = authData.user;
    saveSupabaseSession(authData);
    updateHomeButtonsVisibility();
    if (currentUser) {
      await createUserProfile(profileData);
      await loadUserProfile();
    }
    await loadPromptsFromSupabase();
  }

  async function createUserProfile(profileData) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !currentUser) {
      return;
    }

    const profile = {
      id: currentUser.id,
      nome: profileData.nome || "",
      sobrenome: profileData.sobrenome || "",
      data_nascimento: profileData.data_nascimento || null,
      codigo_pais: profileData.codigo_pais || "",
      numero_celular: profileData.numero_celular || ""
    };

    const response = await fetch(supabaseApiUrl(`/rest/v1/${SUPABASE_PROFILES_TABLE}`), {
      method: "POST",
      headers: {
        ...getSupabaseHeaders(true),
        Prefer: "return=minimal"
      },
      body: JSON.stringify([profile])
    });

    if (!response.ok) {
      console.warn("Erro ao criar perfil no Supabase", await response.text());
    }
  }

  async function updateUserProfile(profileData) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !currentUser) {
      return;
    }

    const response = await fetch(supabaseApiUrl(`/rest/v1/${SUPABASE_PROFILES_TABLE}?id=eq.${currentUser.id}`), {
      method: "PATCH",
      headers: {
        ...getSupabaseHeaders(true),
        Prefer: "return=minimal"
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      console.warn("Erro ao atualizar perfil no Supabase", await response.text());
    } else {
      await loadUserProfile();
    }
  }

  async function loadUserProfile() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !currentUser) {
      return;
    }

    const response = await fetch(supabaseApiUrl(`/rest/v1/${SUPABASE_PROFILES_TABLE}?id=eq.${currentUser.id}&select=*`), {
      headers: getSupabaseHeaders(true)
    });

    if (!response.ok) {
      console.warn("Erro ao carregar perfil do Supabase", await response.text());
      return;
    }

    const rows = await response.json();
    currentProfile = rows[0] || null;
    renderUserProfile();
  }

  function renderUserProfile() {
    const userBox = document.querySelector('.user-box h2');
    const nomeInput = document.getElementById('nome');
    const sobrenomeInput = document.getElementById('sobrenome');
    const nascimentoInput = document.getElementById('nascimento');
    const telefoneInput = document.getElementById('telefone');

    if (userBox) {
      userBox.textContent = currentProfile ? `${currentProfile.nome || ''} ${currentProfile.sobrenome || ''}`.trim() : 'Usuário';
    }
    if (nomeInput) nomeInput.value = currentProfile?.nome || '';
    if (sobrenomeInput) sobrenomeInput.value = currentProfile?.sobrenome || '';
    if (nascimentoInput) nascimentoInput.value = currentProfile?.data_nascimento || '';
    if (telefoneInput) telefoneInput.value = currentProfile?.numero_celular || '';
  }

  function updateHomeButtonsVisibility() {
    const btnNovoPrompt = document.getElementById('novoPrompt');
    const btnMeusPrompts = document.getElementById('meusPrompts');
    const btnLogin = document.getElementById('login');

    if (btnNovoPrompt) {
      btnNovoPrompt.classList.toggle('hidden', !currentUser);
    }
    if (btnMeusPrompts) {
      btnMeusPrompts.classList.toggle('hidden', !currentUser);
    }
    if (btnLogin) {
      if (currentUser) {
        btnLogin.textContent = 'Encerrar Sessão';
        btnLogin.classList.add('btn-logout');
      } else {
        btnLogin.textContent = 'Login';
        btnLogin.classList.remove('btn-logout');
      }
    }
  }

  async function logoutSupabase() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return;
    }
    clearSupabaseSession();
    currentUser = null;
    currentProfile = null;
    updateHomeButtonsVisibility();
    historyData = carregarHistorico();
    renderizarHistorico();
  }

  async function loadPromptsFromSupabase() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !currentUser) {
      return;
    }

    const url = supabaseApiUrl(`/rest/v1/${SUPABASE_PROMPTS_TABLE}?usuario_id=eq.${currentUser.id}&select=*&order=criado_em.desc`);
    const response = await fetch(url, {
      headers: getSupabaseHeaders(true)
    });

    if (!response.ok) {
      console.warn("Erro ao carregar prompts do Supabase", await response.text());
      return;
    }

    const rows = await response.json();
    const remoteHistory = rows.map(row => ({
      id: row.id,
      text: row.prompt || row.text || "",
      data: (SUPABASE_PROMPTS_DATA_COLUMN ? row[SUPABASE_PROMPTS_DATA_COLUMN] : row.data) || {},
      createdAt: row.criado_em || row.created_at || new Date().toISOString(),
      updatedAt: row.editado_em || row.updated_at || null
    }));

    const localHistory = carregarHistorico();
    const remoteIds = new Set(remoteHistory.map(item => item.id));
    const mergedHistory = [...remoteHistory];

    localHistory.forEach(item => {
      if (!remoteIds.has(item.id)) {
        mergedHistory.push(item);
      }
    });

    historyData = mergedHistory;
    renderizarHistorico();
  }

  async function persistPromptToSupabase(prompt) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !currentUser) {
      return;
    }

    const payload = {
      id: prompt.id,
      usuario_id: currentUser.id,
      prompt: prompt.text,
      criado_em: prompt.createdAt,
      editado_em: prompt.updatedAt || prompt.createdAt
    };

    if (prompt.data && Object.keys(prompt.data).length && SUPABASE_PROMPTS_DATA_COLUMN) {
      payload[SUPABASE_PROMPTS_DATA_COLUMN] = prompt.data;
    }

    const url = supabaseApiUrl(`/rest/v1/${SUPABASE_PROMPTS_TABLE}`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...getSupabaseHeaders(true),
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify([payload])
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("Erro ao salvar prompt no Supabase", errorText);
      alert(`Erro ao salvar no Supabase: ${errorText}`);
    }
  }

  async function deletePromptFromSupabase(id) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !currentUser) {
      return;
    }

    const url = supabaseApiUrl(`/rest/v1/${SUPABASE_PROMPTS_TABLE}?id=eq.${id}&usuario_id=eq.${currentUser.id}`);
    const response = await fetch(url, {
      method: "DELETE",
      headers: getSupabaseHeaders(true)
    });

    if (!response.ok) {
      console.warn("Erro ao excluir prompt no Supabase", await response.text());
    }
  }

  function setPersistentTitle(title) {
    const titleEl = document.getElementById("persistentTitle");
    if (titleEl) {
      titleEl.textContent = title;
    }
  }

  function updateBackButtonVisibility() {
    const backBtn = document.getElementById("headerBackBtn");
    if (!backBtn) return;
    backBtn.classList.toggle("hidden", currentScreen === "telaInicial");
  }

  function goBack() {
    if (!screenHistory.length) {
      mostrarTela("telaInicial", { replace: true });
      return;
    }
    const previousScreen = screenHistory.pop();
    mostrarTela(previousScreen, { replace: true });
  }

  function mostrarTela(telaId, options = {}) {
    if (!options.replace && currentScreen && currentScreen !== telaId) {
      screenHistory.push(currentScreen);
    }

    const allScreens = document.querySelectorAll(
      "#telaInicial, #checklist, #resultado, #login-screen, #cadastro-screen, #historico-screen, #visualizar-prompt-screen, #minha-conta, #editar-perfil, #ajuda-suporte, #fale-conosco, #politica-privacidade"
    );
    allScreens.forEach(tela => tela.classList.add("hidden"));

    const screen = document.getElementById(telaId);
    if (screen) {
      screen.classList.remove("hidden");
    }

    const titleMap = {
      telaInicial: "Promptica",
      checklist: "Criar Novo Prompt",
      resultado: "Meu Prompt",
      "login-screen": "Login",
      "cadastro-screen": "Cadastro",
      "historico-screen": "Meus Prompts",
      "visualizar-prompt-screen": "Visualizar Prompt",
      "minha-conta": "Minha Conta",
      "editar-perfil": "Editar Perfil",
      "ajuda-suporte": "Ajuda & Suporte",
      "fale-conosco": "Fale Conosco",
      "politica-privacidade": "Política de Privacidade"
    };
    setPersistentTitle(titleMap[telaId] || "Promptica");
    currentScreen = telaId;
    updateBackButtonVisibility();
  }

  function salvarHistorico(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function savePromptLocally(prompt) {
    const index = historyData.findIndex(entry => entry.id === prompt.id);
    if (index >= 0) {
      historyData[index] = prompt;
    } else {
      historyData.push(prompt);
    }
    salvarHistorico(historyData);
    renderizarHistorico();
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
    if (currentUser) {
      deletePromptFromSupabase(id).catch(error => console.warn("Erro ao excluir prompt no Supabase:", error));
    }
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
  initSupabase();

  // =====================================
  // BOTÕES DA TELA INICIAL
  // =====================================
  const btnNovoPrompt = document.getElementById("novoPrompt");
  if (btnNovoPrompt) {
    btnNovoPrompt.addEventListener("click", () => {
      if (!currentUser) return;
      mostrarTela("checklist");
    });
  }

  const btnLogin = document.getElementById("login");
  if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
      if (currentUser) {
        await logoutSupabase();
        mostrarTela("telaInicial", { replace: true });
      } else {
        mostrarTela("login-screen");
      }
    });
  }

  const profileBtn = document.getElementById("profileBtn");
  if (profileBtn) {
    profileBtn.addEventListener("click", () => {
      if (currentUser) {
        mostrarTela("minha-conta");
      } else {
        mostrarTela("login-screen");
      }
    });
  }

  const headerBackBtn = document.getElementById("headerBackBtn");
  if (headerBackBtn) {
    headerBackBtn.addEventListener("click", goBack);
  }

  const btnMeusPrompts = document.getElementById("meusPrompts");
  if (btnMeusPrompts) {
    btnMeusPrompts.addEventListener("click", () => {
      if (!currentUser) return;
      mostrarTela("historico-screen");
    });
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

  const btnSupabaseLogin = document.getElementById("btnLogin");
  if (btnSupabaseLogin) {
    btnSupabaseLogin.addEventListener("click", async () => {
      const email = document.getElementById("email")?.value?.trim();
      const password = document.getElementById("password")?.value?.trim();
      if (!email || !password) {
        alert("Preencha email e senha para fazer login.");
        return;
      }
      try {
        await signInSupabase(email, password);
        alert("Login realizado com sucesso.");
        mostrarTela("telaInicial");
      } catch (error) {
        alert(error.message || "Falha ao fazer login.");
      }
    });
  }

  const btnSupabaseCadastro = document.getElementById("btnCadastro");
  if (btnSupabaseCadastro) {
    const cadastroError = document.getElementById("cadastroError");
    const fieldsToValidate = [
      { id: "nomeCadastro", label: "Nome" },
      { id: "sobrenomeCadastro", label: "Sobrenome" },
      { id: "emailCadastro", label: "Email" },
      { id: "senhaCadastro", label: "Senha" }
    ];

    fieldsToValidate.forEach(field => {
      const input = document.getElementById(field.id);
      if (input) {
        input.addEventListener("input", () => {
          input.classList.toggle("input-error", !input.value.trim());
          if (cadastroError) cadastroError.classList.add("hidden");
        });
      }
    });

    btnSupabaseCadastro.addEventListener("click", async () => {
      const email = document.getElementById("emailCadastro")?.value?.trim();
      const password = document.getElementById("senhaCadastro")?.value?.trim();
      const nome = document.getElementById("nomeCadastro")?.value?.trim();
      const sobrenome = document.getElementById("sobrenomeCadastro")?.value?.trim();
      const nascimento = document.getElementById("nascimentoCadastro")?.value?.trim();
      const telefone = document.getElementById("telefoneCadastro")?.value?.trim();

      let hasError = false;
      fieldsToValidate.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
          const invalid = !input.value.trim();
          input.classList.toggle("input-error", invalid);
          if (invalid) hasError = true;
        }
      });

      if (hasError) {
        if (cadastroError) {
          cadastroError.textContent = "* Campos obrigatórios";
          cadastroError.classList.remove("hidden");
        }
        return;
      }

      if (cadastroError) cadastroError.classList.add("hidden");

      try {
        await signUpSupabase(email, password, {
          nome,
          sobrenome,
          data_nascimento: nascimento,
          numero_celular: telefone,
          codigo_pais: ""
        });
        alert("Cadastro realizado e sessão iniciada.");
        mostrarTela("historico-screen");
      } catch (error) {
        alert(error.message || "Falha ao cadastrar.");
      }
    });
  }

  const btnLogout = document.getElementById("btnSair");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      await logoutSupabase();
      alert("Sessão encerrada.");
      mostrarTela("telaInicial");
    });
  }

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
        const now = new Date().toISOString();
        currentPromptData = {
          id: currentPromptData?.id || Date.now().toString(),
          text: resultText,
          data,
          createdAt: currentPromptData?.createdAt || now,
          updatedAt: now
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
    deletarSelecionados.addEventListener("click", async () => {
      const selecionados = Array.from(document.querySelectorAll(".prompt-checkbox:checked")).map(cb => cb.dataset.id);
      if (!selecionados.length) {
        alert("Selecione ao menos um prompt para excluir.");
        return;
      }
      historyData = historyData.filter(entry => !selecionados.includes(entry.id));
      salvarHistorico(historyData);
      renderizarHistorico();
      if (currentUser) {
        await Promise.all(selecionados.map(id => deletePromptFromSupabase(id).catch(error => console.warn("Erro ao excluir prompt no Supabase:", error))));
      }
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
      if (!currentPromptData.createdAt) {
        currentPromptData.createdAt = new Date().toISOString();
      }
      currentPromptData.updatedAt = new Date().toISOString();
      savePromptLocally(currentPromptData);
      if (currentUser) {
        persistPromptToSupabase(currentPromptData).catch(error => console.warn("Erro ao salvar prompt no Supabase:", error));
      }
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

const btnAtualizarPerfil = document.getElementById("btnAtualizarPerfil");
if (btnAtualizarPerfil) {
  btnAtualizarPerfil.addEventListener("click", async () => {
    const nome = document.getElementById("nome")?.value?.trim();
    const sobrenome = document.getElementById("sobrenome")?.value?.trim();
    const nascimento = document.getElementById("nascimento")?.value?.trim();
    const telefone = document.getElementById("telefone")?.value?.trim();

    if (!currentUser) {
      alert("Faça login para atualizar seu perfil.");
      return;
    }

    try {
      await updateUserProfile({
        nome,
        sobrenome,
        data_nascimento: nascimento,
        numero_celular: telefone
      });
      alert("Perfil atualizado com sucesso.");
      mostrarTela("minha-conta");
    } catch (error) {
      console.warn(error);
      alert("Falha ao atualizar o perfil.");
    }
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

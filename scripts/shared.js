// scripts/shared.js - Funções compartilhadas entre todas as páginas

const STORAGE_KEY = "prompticaHistory";
const SUPABASE_SESSION_KEY = "prompticaSupabaseSession";

// Configurações
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

// =====================================
// SUPABASE - Autenticação e Sessão
// =====================================

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
  localStorage.removeItem(SUPABASE_SESSION_KEY);
}

function getSupabaseHeaders(useAuth = true) {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Accept: "application/json"
  };
  const session = getSupabaseSession();
  if (useAuth && session && session.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  headers["Content-Type"] = "application/json";
  return headers;
}

async function signInSupabase(email, password) {
  if (!email || !password) {
    throw new Error("E-mail e senha são obrigatórios.");
  }
  const response = await fetch(supabaseApiUrl("/auth/v1/token?grant_type=password"), {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const json = await response.json();
  if (!response.ok) {
    const message = json?.error_description || json?.error || JSON.stringify(json);
    throw new Error(message || "Falha no login.");
  }

  saveSupabaseSession(json);
  return json;
}

async function signUpSupabase(email, password, metadata = {}) {
  if (!email || !password) {
    throw new Error("E-mail e senha são obrigatórios.");
  }
  const response = await fetch(supabaseApiUrl("/auth/v1/signup"), {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password, data: metadata })
  });

  const json = await response.json();
  if (!response.ok) {
    const message = json?.error_description || json?.error || JSON.stringify(json);
    throw new Error(message || "Falha no cadastro.");
  }

  if (json.access_token) {
    saveSupabaseSession(json);
  }
  return json;
}

function signOutSupabase() {
  clearSupabaseSession();
}

function setSelectedPromptId(id) {
  if (id == null) {
    localStorage.removeItem("selectedPromptId");
    return;
  }
  localStorage.setItem("selectedPromptId", String(id));
}

function getSelectedPromptId() {
  return localStorage.getItem("selectedPromptId");
}

function addPromptToHistory(text) {
  if (!text || !text.trim()) return null;
  const historico = carregarHistorico();
  const prompt = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };
  historico.unshift(prompt);
  salvarHistorico(historico);
  return prompt;
}

function removePromptFromHistory(id) {
  if (!id) return;
  const historico = carregarHistorico();
  salvarHistorico(historico.filter(item => item.id !== id));
}

function removePromptsFromHistory(ids) {
  if (!Array.isArray(ids) || !ids.length) return;
  const historico = carregarHistorico();
  salvarHistorico(historico.filter(item => !ids.includes(item.id)));
}

// =====================================
// HISTÓRICO - Armazenamento Local
// =====================================

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
  const data = carregarHistorico();
  return data.find(entry => entry.id === id);
}

// =====================================
// GEMINI - Geração de Prompts
// =====================================

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

// =====================================
// UTILITÁRIOS
// =====================================

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

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORAGE_KEY,
    SUPABASE_SESSION_KEY,
    salvarHistorico,
    carregarHistorico,
    buscarPromptPorId,
    getSupabaseSession,
    saveSupabaseSession,
    clearSupabaseSession,
    getSupabaseHeaders,
    signInSupabase,
    signUpSupabase,
    signOutSupabase,
    setSelectedPromptId,
    getSelectedPromptId,
    addPromptToHistory,
    removePromptFromHistory,
    removePromptsFromHistory,
    carregarHistorico,
    buscarPromptPorId,
    gerarPromptGemini,
    copiarTexto,
    construirPromptDeIA
  };
}

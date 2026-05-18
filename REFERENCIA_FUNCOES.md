# 🔧 REFERÊNCIA DE FUNÇÕES - scripts/shared.js

## Importar Shared.js

Todas as páginas devem incluir:
```html
<script src="../config.js"></script>
<script src="../scripts/shared.js"></script>
<script src="../scripts/seu-script.js"></script>
```

## Autenticação Supabase

### getSupabaseSession()
Recupera a sessão de autenticação do storage.

```javascript
const session = getSupabaseSession();
if (session) {
  console.log("Usuário autenticado:", session.user.email);
}
```

### saveSupabaseSession(session)
Salva a sessão de autenticação no storage.

```javascript
const session = { user: { id: "123", email: "user@example.com" }, access_token: "..." };
saveSupabaseSession(session);
```

### clearSupabaseSession()
Remove a sessão de autenticação.

```javascript
clearSupabaseSession();
console.log("Sessão limpa");
```

### getSupabaseHeaders(useAuth = true)
Retorna headers necessários para requisições ao Supabase.

```javascript
const headers = getSupabaseHeaders(true);
fetch("https://api.supabase.co/...", { headers });
```

---

## Histórico Local

### salvarHistorico(data)
Salva array de prompts no localStorage.

```javascript
const prompts = [
  { id: "1", text: "Prompt 1", data: {...}, createdAt: "2024-05-18", updatedAt: "2024-05-18" },
  { id: "2", text: "Prompt 2", data: {...}, createdAt: "2024-05-17", updatedAt: "2024-05-18" }
];
salvarHistorico(prompts);
```

### carregarHistorico()
Carrega histórico do localStorage.

```javascript
const prompts = carregarHistorico();
console.log(`${prompts.length} prompts salvos`);
```

### buscarPromptPorId(id)
Encontra um prompt específico pelo ID.

```javascript
const prompt = buscarPromptPorId("123");
if (prompt) {
  console.log("Prompt encontrado:", prompt.text);
}
```

---

## Geração de Prompts - Gemini

### gerarPromptGemini(data)
Gera um prompt otimizado usando Gemini AI.

```javascript
const data = {
  contexto: "Você é um especialista em...",
  instrucao: "Liste 3 vantagens de...",
  exemplo: "Entrada: X → Saída: Y",
  restricoes: "Máx 100 palavras",
  tom: "Formal",
  saida: "JSON",
  suporte: "Use documentação oficial"
};

try {
  const resultText = await gerarPromptGemini(data);
  console.log("Prompt gerado:", resultText);
} catch (error) {
  console.error("Erro:", error.message);
}
```

### construirPromptDeIA(data)
Constrói o prompt que será enviado para o Gemini.

```javascript
const data = {
  contexto: "Um contexto",
  instrucao: "Uma instrução",
  exemplo: "Um exemplo"
};

const promptFinal = construirPromptDeIA(data);
console.log(promptFinal);
// Retorna: "Você é um engenheiro de prompts..."
```

### requestModel(model, data)
Faz requisição direta a um modelo específico do Gemini.

```javascript
try {
  const resultado = await requestModel("gemini-3-flash-preview", data);
  console.log("Resultado:", resultado);
} catch (error) {
  console.log("Falha, tentando modelo fallback");
}
```

---

## Utilitários

### copiarTexto(text)
Copia texto para clipboard.

```javascript
await copiarTexto("Seu texto aqui");
// Mostra feedback visual se suportado
```

---

## Constantes Globais (em shared.js)

```javascript
STORAGE_KEY = "prompticaHistory"
SUPABASE_SESSION_KEY = "prompticaSupabaseSession"
GEMINI_API_KEY = window.GEMINI_API_KEY (vem de config.js)
SUPABASE_URL = window.SUPABASE_URL (vem de config.js)
PRIMARY_MODEL = "gemini-3-flash-preview"
FALLBACK_MODEL = "gemini-2.5-flash-lite"
```

---

## Exemplos de Uso Completo

### Exemplo 1: Carregar e Exibir Histórico

```javascript
document.addEventListener("DOMContentLoaded", () => {
  const historyData = carregarHistorico();
  
  const lista = document.getElementById("prompt-list");
  historyData.forEach(prompt => {
    const item = document.createElement("div");
    item.textContent = prompt.text.substring(0, 50) + "...";
    lista.appendChild(item);
  });
});
```

### Exemplo 2: Gerar e Salvar Prompt

```javascript
const btnGerar = document.getElementById("gerar");
btnGerar.addEventListener("click", async () => {
  const data = {
    contexto: document.getElementById("contexto").value,
    instrucao: document.getElementById("instrucao").value,
    // ... outros campos
  };
  
  try {
    const promptGerado = await gerarPromptGemini(data);
    
    const novoPrompt = {
      id: Date.now().toString(),
      text: promptGerado,
      data: data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Salvar localmente
    const historico = carregarHistorico();
    historico.push(novoPrompt);
    salvarHistorico(historico);
    
    alert("Prompt salvo!");
  } catch (error) {
    alert("Erro: " + error.message);
  }
});
```

### Exemplo 3: Autenticação

```javascript
async function fazerLogin(email, senha) {
  try {
    // Chamaria função de login do Supabase
    const response = await fetch(supabaseApiUrl("/auth/v1/token?grant_type=password"), {
      method: "POST",
      headers: getSupabaseHeaders(false),
      body: JSON.stringify({ email, senha })
    });
    
    const result = await response.json();
    if (response.ok) {
      saveSupabaseSession(result);
      console.log("Login bem-sucedido");
    } else {
      console.error("Login falhou:", result.error);
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
  }
}
```

---

## Configurações de Ambiente

Para funcionar, certifique-se de que `config.js` contém:

```javascript
window.GEMINI_API_KEY = "AIzaSy..."; // Sua chave Gemini
window.SUPABASE_URL = "https://....supabase.co/rest/v1/";
window.SUPABASE_ANON_KEY = "sb_publishable_...";
window.SUPABASE_PROMPTS_TABLE = "prompts";
window.SUPABASE_PROFILES_TABLE = "profiles";
```

---

## Debugging

Para debugar em um script:

```javascript
// Verificar se shared.js foi carregado
console.log(typeof carregarHistorico); // deve ser "function"

// Verificar config
console.log("Gemini Key definida:", !!window.GEMINI_API_KEY);
console.log("Supabase URL:", window.SUPABASE_URL);

// Verificar dados armazenados
console.log("Histórico local:", carregarHistorico());
console.log("Sessão Supabase:", getSupabaseSession());
```

---

**Versão**: 1.0  
**Última atualização**: 18 de maio de 2026

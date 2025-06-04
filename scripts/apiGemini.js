// scripts/apiGemini.js  (ES module)

/* 1. chave salva localmente (NÃO publique esse arquivo) */
import { API_KEY } from "./gemini-key.js";

/* 2. número do projeto onde a API Gemini está ativada */
const PROJECT_NUMBER = "800958394568";          // ← ajuste se mudar
const MODEL_PATH = `projects/${PROJECT_NUMBER}/locations/us-central1/models/gemini-pro`;

/* 3. SDK já carregado pelo load-genai.js */
const { GoogleGenerativeAI } = window;
if (!GoogleGenerativeAI) {
  throw new Error("SDK @google/generative-ai não carregado – verifique load-genai.js");
}

/* 4. instancia com a sua API KEY */
const ai = new GoogleGenerativeAI({ apiKey: API_KEY });

/**
 * Refina um rascunho usando o modelo Gemini-pro.
 * Se falhar (quota, chave, timeout), devolve o texto original.
 * @param {string} rascunho Texto concatenado dos cards
 * @param {number} abortMs  Timeout (ms) — default 15 s
 * @returns {Promise<string>}
 */
export async function refinarPrompt(rascunho, abortMs = 15000) {
  /* Timeout defensivo */
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), abortMs);

  try {
    /* 5. obtém o modelo pelo caminho completo */
    const model = await ai.getGenerativeModel({
  model: `projects/${PROJECT_NUMBER}/locations/us-central1/models/gemini-pro`
});

    const result = await model.generateContent(
      {
        contents: [
          {
            parts: [
              {
                text:
`Reescreva de forma concisa, clara e eficaz usando técnicas de engenharia de prompt:

${rascunho}`
              }
            ]
          }
        ]
      },
      { signal: ctrl.signal }                   // respeita timeout/abort
    );

    return result.response.text().trim();

  } catch (err) {
    console.error("Gemini SDK error:", err);
    return rascunho;                            // fallback silencioso
  } finally {
    clearTimeout(timer);
  }
}

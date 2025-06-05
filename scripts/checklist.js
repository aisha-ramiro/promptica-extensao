// scripts/checklist.js
document.addEventListener("DOMContentLoaded", () => {

  /* ──────────── NAVEGAÇÃO ──────────── */
  voltarHome.onclick = () => location.href = "home.html";
  userBtn  .onclick = () => location.href = "usuario.html";

  /* ──────────── ABRE/FECHA CARDS ──────────── */
  document.querySelectorAll(".card").forEach(card => {
    const head   = card.querySelector(".card-head");
    const toggle = card.querySelector(".toggle");
    const info   = card.querySelector(".info");
    info.setAttribute("data-tooltip", card.dataset.info);

    head.addEventListener("click", e => {
      if (e.target.tagName === "INPUT") return;     // ignora clique no checkbox
      card.classList.toggle("open");
      toggle.textContent = card.classList.contains("open") ? "▲" : "▼";
    });
  });

  /* ──────────── CRIAR PROMPT ──────────── */
  const criarPromptBtn = document.getElementById("criarPrompt");

  criarPromptBtn.onclick = () => {

    /* helpers */
    const valor   = id => document.getElementById(id).value.trim();
    const marcado = id => document.getElementById(id + "Check").checked;

    const papelIA = "especialista em comunicação clara";
    const partes  = [];

    /* Contexto (vem antes da tarefa) */
    if (marcado("contexto") && valor("contexto")) {
      partes.push(
        `Você é um(a) ${papelIA}, e está atuando em um cenário onde ${valor("contexto")}.`
      );
    }

    /* Tarefa / instruções */
    if (marcado("instrucao") && valor("instrucao")) {
      partes.push(`Sua tarefa é ${valor("instrucao")}.`);
    }

    /* Exemplos */
    if (marcado("exemplo") && valor("exemplo")) {
      partes.push(
`Considere os exemplos a seguir para entender o formato da resposta esperada:
${valor("exemplo")}`
      );
    }

    /* Conteúdo de suporte */
    if (marcado("suporte") && valor("suporte")) {
      partes.push(`Baseie sua resposta em ${valor("suporte")}.`);
    }

    /* Orientações de tom */
    if (marcado("tom") && valor("tom")) {
      partes.push(`Siga estas orientações: ${valor("tom")}.`);
    }

    /* Formato desejado */
    if (marcado("saida") && valor("saida")) {
      partes.push(`Sua resposta deve ser apresentada no seguinte formato: ${valor("saida")}.`);
    }

    /* Restrições */
    if (marcado("restricoes") && valor("restricoes")) {
      partes.push(`Atenha-se às seguintes limitações: ${valor("restricoes")}.`);
    }

    if (!partes.length) {
      alert("Marque pelo menos um card e preencha o texto.");
      return;
    }

    const promptFinal = partes.join("\n\n");   // junta com linha em branco
    localStorage.setItem("promptGerado", promptFinal);
    location.href = "resultado.html";
  };
});

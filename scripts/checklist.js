/** checklist.js  (ES-module) **/
import { refinarPrompt } from "./apiGemini.js";

document.addEventListener("DOMContentLoaded", () => {
  /* navegação */
  voltarHome.onclick = () => location.href = "home.html";
  userBtn   .onclick = () => location.href = "usuario.html";

  /* abre/fecha cartões */
  document.querySelectorAll(".card").forEach(card => {
    const head   = card.querySelector(".card-head");
    const toggle = card.querySelector(".toggle");
    const info   = card.querySelector(".info");

    info.setAttribute("data-tooltip", card.dataset.info);

    head.addEventListener("click", e => {
      if (e.target.tagName === "INPUT") return;     // ignora checkbox
      card.classList.toggle("open");
      toggle.textContent = card.classList.contains("open") ? "▲" : "▼";
    });
  });

  /* ------- CRIAR PROMPT ------- */
  criarPrompt.onclick = async () => {
    const blocos = [];

    /* coleta apenas cards marcados ✓ */
    document.querySelectorAll(".card").forEach(card => {
      const marcado  = card.querySelector("input[type=checkbox]").checked;
      const txt      = card.querySelector("textarea").value.trim();
      const titulo   = card.querySelector("label").innerText.trim();
      if (marcado && txt) blocos.push(`${titulo}: ${txt}`);
    });

    if (!blocos.length){
      alert("Marque pelo menos um campo."); return;
    }

    const rascunho = blocos.join("\n\n");

    /* chama Gemini para refinar */
    let promptFinal = rascunho;
    try{
      promptFinal = await refinarPrompt(rascunho);
    }catch(err){
      console.error("Falha Gemini:", err);          // usa rascunho se falhar
    }

    localStorage.setItem("promptGerado", promptFinal);
    location.href = "resultado.html";
  };
});

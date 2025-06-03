document.addEventListener("DOMContentLoaded", () => {
  /* voltar para Home */
  voltarHome.onclick = () => location.href = "home.html";
    userBtn.onclick     = () => location.href = "usuario.html"; // página de usuário
    
  /* abre/fecha cards */
  document.querySelectorAll(".card").forEach(card => {
    const head   = card.querySelector(".card-head");
    const toggle = card.querySelector(".toggle");
    const info   = card.querySelector(".info");

    /* tooltip */
    info.setAttribute("data-tooltip", card.dataset.info);

    head.addEventListener("click", e => {
      if (e.target.tagName === "INPUT") return;    // ignora clique no checkbox
      card.classList.toggle("open");
      toggle.textContent = card.classList.contains("open") ? "▲" : "▼";
    });
  });

  /* === CRIAR PROMPT === */
criarPrompt.onclick = () => {

  const blocos = [];   // ← array para não perder nenhuma entrada

  document.querySelectorAll(".card").forEach(card => {
    const marcado  = card.querySelector("input[type=checkbox]").checked;
    const conteudo = card.querySelector("textarea").value.trim();
    const titulo   = card.querySelector("label").innerText.trim();

    if (marcado && conteudo) {
      blocos.push(`${titulo}: ${conteudo}`);
    }
  });

  /* junta blocos separados por linha em branco */
  const promptFinal = blocos.join("\n\n");

  localStorage.setItem("promptGerado", promptFinal);
  location.href = "resultado.html";
};
});

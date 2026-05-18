// scripts/checklist.js
document.addEventListener("DOMContentLoaded", async () => {
  
  // =====================================
  // RESTAURAR RASCUNHO DO STORAGE
  // =====================================
  const draftRaw = localStorage.getItem("draftPromptica");
  if (draftRaw) {
    const d = JSON.parse(draftRaw);
    Object.keys(d).forEach(k => {
      if (k.endsWith("Check")) {
        const chk = document.getElementById(k);
        if (chk) chk.checked = d[k];
      } else {
        const ta = document.getElementById(k);
        if (ta) ta.value = d[k];
      }
    });
  }

  // =====================================
  // NAVEGAÇÃO
  // =====================================
  const voltarHome = document.getElementById("voltarHome");
  const userBtn = document.getElementById("userBtn");
  
  if (voltarHome) voltarHome.onclick = () => location.href = "home.html";
  if (userBtn) userBtn.onclick = () => location.href = "usuario.html";

  // =====================================
  // ABRE/FECHA CARDS (ACORDEÃO)
  // =====================================
  document.querySelectorAll(".card").forEach(card => {
    const head = card.querySelector(".card-head");
    const toggle = card.querySelector(".toggle");
    const info = card.querySelector(".info");
    
    if (info && card.dataset.info) {
      info.setAttribute("data-tooltip", card.dataset.info);
    }

    if (head) {
      head.addEventListener("click", e => {
        if (e.target.tagName === "INPUT") return;
        card.classList.toggle("open");
        if (toggle) {
          toggle.textContent = card.classList.contains("open") ? "▲" : "▼";
        }
      });
    }
  });

  // =====================================
  // COLETAR CAMPOS SELECIONADOS
  // =====================================
  function coletarCampos() {
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
    for (const campo in campos) {
      const el = document.getElementById(campo);
      const checkId = campo + "Check";
      const checkbox = document.getElementById(checkId);
      const checked = checkbox ? checkbox.checked : true;
      const valor = el ? el.value.trim() : "";
      
      data[campo] = valor;
    }
    return data;
  }

  // =====================================
  // GERAR PROMPT
  // =====================================
  const criarPromptBtn = document.getElementById("criarPrompt");

  if (criarPromptBtn) {
    criarPromptBtn.addEventListener("click", async () => {
      const data = coletarCampos();
      
      // Guardar rascunho
      const draft = {};
      Object.keys(data).forEach(k => {
        draft[k] = document.getElementById(k)?.value || "";
        draft[k + "Check"] = document.getElementById(k + "Check")?.checked || false;
      });
      localStorage.setItem("draftPromptica", JSON.stringify(draft));

      try {
        // Mostrar carregamento
        const loader = document.createElement("div");
        loader.className = "loader";
        loader.innerHTML = "Gerando prompt...";
        criarPromptBtn.disabled = true;
        criarPromptBtn.textContent = "Gerando...";

        // Gerar com Gemini
        const resultText = await gerarPromptGemini(data);
        
        // Guardar resultado
        const promptObj = {
          id: Date.now().toString(),
          text: resultText,
          data: data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem("currentPrompt", JSON.stringify(promptObj));
        localStorage.setItem("promptGerado", resultText);

        // Navegar para resultado
        location.href = "resultado.html";
      } catch (error) {
        alert("Erro ao gerar prompt: " + error.message);
        criarPromptBtn.disabled = false;
        criarPromptBtn.textContent = "Criar Prompt";
      }
    });
  }
});

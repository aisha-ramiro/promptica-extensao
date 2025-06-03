document.addEventListener("DOMContentLoaded", () => {
  // ========================
  // UTILITÁRIOS
  // ========================
  function mostrarTela(telaId) {
    document.querySelectorAll(
      "#telaInicial, #checklist, #resultado, #login-screen, #cadastro-screen"
    ).forEach(tela => tela.classList.add("hidden"));

    document.getElementById(telaId).classList.remove("hidden");
  }

  // ========================
  // NAVEGAÇÃO PRINCIPAL
  // ========================
  document.getElementById("novoPrompt").onclick = () => {
    mostrarTela("checklist");
  };

  document.getElementById("meusPrompts").onclick = () => {
    mostrarTela("historico-screen");
  };

  document.getElementById("login").onclick = () => {
    mostrarTela("login-screen");
  };



  // ========================
  // VOLTAR
  // ========================
  const backFromChecklist = document.getElementById("backFromChecklist");
  const backFromResult = document.getElementById("backFromResult");
  const backFromLogin = document.getElementById("backFromLogin");
  const backFromCadastro = document.getElementById("backFromCadastro");
  const voltarResultado = document.getElementById("voltar");

  if (backFromChecklist)
    backFromChecklist.addEventListener("click", () => mostrarTela("telaInicial"));

  if (backFromResult)
    backFromResult.addEventListener("click", () => mostrarTela("checklist"));

  if (backFromLogin)
    backFromLogin.addEventListener("click", () => mostrarTela("telaInicial"));

  if (backFromCadastro)
    backFromCadastro.addEventListener("click", () => mostrarTela("login-screen"));

  if (voltarResultado)
    voltarResultado.addEventListener("click", () => mostrarTela("checklist"));

  // ========================
  // CADASTRO ↔ LOGIN
  // ========================
  const goToCadastro = document.getElementById("goToCadastro");
  if (goToCadastro)
    goToCadastro.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarTela("cadastro-screen");
    });

  // ========================
  // GERAR PROMPT
  // ========================
  const gerarBtn = document.getElementById("gerar");
  if (gerarBtn) {
    gerarBtn.onclick = () => {
      const campos = {
        contexto: "Contexto",
        instrucao: "Instruções",
        exemplo: "Exemplo",
        restricoes: "Restrições",
        tom: "Tom",
        saida: "Saída esperada",
        suporte: "Conteúdo adicional"
      };

      let promptFinal = "";

      for (let campo in campos) {
        const el = document.getElementById(campo);
        if (el && el.value.trim()) {
          promptFinal += `${campos[campo]}: ${el.value.trim()}\n\n`;
        }
      }

      document.getElementById("output").innerText = promptFinal || "(Nenhum conteúdo preenchido)";
      mostrarTela("resultado");
    };
  }

  // ========================
  // ACCORDION
  // ========================
  document.querySelectorAll('.card-header').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.card');
      const content = card.querySelector('.card-content');
      const toggleIcon = header.querySelector('.accordion-toggle');

      content.classList.toggle('show');
      toggleIcon.classList.toggle('rotated');
    });
  });

  // Evitar que o clique na checkbox dispare o accordion
  document.querySelectorAll('.card-header input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('click', e => e.stopPropagation());
  });



  // HISTÓRICO

  // Referência às telas
const historicoScreen = document.getElementById("historico-screen");
const visualizarPromptScreen = document.getElementById("visualizar-prompt-screen");

// Botões de navegação
const backFromHistorico = document.getElementById("backFromHistorico");
const backFromVisualizar = document.getElementById("backFromVisualizar");

// Mostrar lista de prompts (ex: ao clicar no botão "Histórico")
document.getElementById("historico").addEventListener("click", () => {
  mostrarTela("historico-screen");
});

// Voltar do histórico para a tela inicial
backFromHistorico.addEventListener("click", () => {
  mostrarTela("telaInicial");
});

// Voltar da visualização para a lista de prompts
backFromVisualizar.addEventListener("click", () => {
  mostrarTela("historico-screen");
});

// Clique em "Visualizar" → abre o prompt individual
document.querySelectorAll(".visualizarPrompt").forEach(botao => {
  botao.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarTela("visualizar-prompt-screen");
  });
});

});






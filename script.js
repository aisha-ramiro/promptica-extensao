document.addEventListener("DOMContentLoaded", () => {
  // =====================================
  // UTILITÁRIO PARA TROCAR TELAS
  // =====================================
  function mostrarTela(telaId) {
    document.querySelectorAll(
      "#telaInicial, #checklist, #resultado, #login-screen, #cadastro-screen, #historico-screen, #visualizar-prompt-screen, #minha-conta, #editar-perfil, #ajuda-suporte, #fale-conosco, #politica-privacidade"
    ).forEach(tela => tela.classList.add("hidden"));

    document.getElementById(telaId).classList.remove("hidden");
  }

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
  // HISTÓRICO: VISUALIZAR E EDITAR
  // =====================================
  document.querySelectorAll(".visualizarPrompt").forEach(botao => {
    botao.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarTela("visualizar-prompt-screen");
    });
  });

  document.querySelectorAll(".editarPrompt").forEach(botao => {
    botao.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarTela("checklist");
    });
  });

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

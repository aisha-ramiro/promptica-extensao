document.addEventListener("DOMContentLoaded", () => {
  // Função para trocar de tela
  function mostrarTela(telaId) {
    document.querySelectorAll("#telaInicial, #checklist, #resultado").forEach(tela => {
      tela.classList.add("hidden");
    });
    document.getElementById(telaId).classList.remove("hidden");
  }

  // Clique no botão "Novo Prompt" para ir ao checklist
  document.getElementById("novoPrompt").onclick = () => {
    mostrarTela("checklist");
  };

  // Clique no botão "Voltar" para retornar ao checklist
  document.getElementById("voltar").onclick = () => {
    mostrarTela("checklist");
  };

  // Accordion - clique no header inteiro
  document.querySelectorAll('.card-header').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.card');
      const content = card.querySelector('.card-content');
      const toggleIcon = header.querySelector('.accordion-toggle');

      content.classList.toggle('show');
      toggleIcon.classList.toggle('rotated');
    });
  });

  // Evita que clique na checkbox dispare o accordion
  document.querySelectorAll('.card-header input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('click', e => e.stopPropagation());
  });

  // Geração do prompt e exibição da tela de resultado
  document.getElementById("gerar").onclick = () => {
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

    document.getElementById("output").innerText = promptFinal;
    mostrarTela("resultado");
  };
});





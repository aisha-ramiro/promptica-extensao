document.getElementById("novoPrompt").onclick = () => {
  document.getElementById("checklist").classList.remove("hidden");
};

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
    const valor = document.getElementById(campo)?.value.trim();
    if (valor) {
      promptFinal += `${campos[campo]}: ${valor}\n\n`;
    }
  }

  document.getElementById("output").innerText = promptFinal;
  document.getElementById("resultado").classList.remove("hidden");
};

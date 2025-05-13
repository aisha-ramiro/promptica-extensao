document.getElementById("novoPrompt").onclick = () => {
  document.getElementById("checklist").classList.remove("hidden");
};

document.getElementById("gerar").onclick = () => {
  const instrucao = document.getElementById("instrucao").value;
  const exemplo = document.getElementById("exemplo").value;
  const contexto = document.getElementById("contexto").value;
  const restricoes = document.getElementById("restricoes").value;
  const tom = document.getElementById("tom").value;
  const saida = document.getElementById("saida").value;
  const suporte = document.getElementById("suporte").value;

  let promptFinal = "";

  if (contexto) promptFinal += `Contexto: ${contexto}\n`;
  if (instrucao) promptFinal += `Instruções: ${instrucao}\n`;
  if (exemplo) promptFinal += `Exemplo: ${exemplo}\n`;
  if (restricoes) promptFinal += `Restrições: ${restricoes}\n`;
  if (tom) promptFinal += `Tom: ${tom}\n`;
  if (saida) promptFinal += `Saída esperada: ${saida}\n`;
  if (suporte) promptFinal += `Conteúdo adicional: ${suporte}\n`;

  document.getElementById("output").innerText = promptFinal;
  document.getElementById("resultado").classList.remove("hidden");
};

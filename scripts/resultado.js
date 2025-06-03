document.addEventListener("DOMContentLoaded", () => {
  /* carrega o texto gerado */
  output.textContent = localStorage.getItem("promptGerado") || "(Nenhum conteúdo)";

  /* botões (funcionalidades futuras) */
  btnBack .onclick = () => history.back();          // volta ao checklist
  btnCopy .onclick = () => navigator.clipboard.writeText(output.textContent);
  btnEdit .onclick = () => history.back();          // editar = voltar ao checklist
  btnDelete.onclick = () => alert("Excluir (placeholder)");
  backFromResult.onclick = () => history.back();
  userBtn.onclick     = () => location.href = "usuario.html"; // página de usuário
});



document.addEventListener("DOMContentLoaded", () => {
  // Obter elementos com getElementById
  const novoPrompt = document.getElementById("novoPrompt");
  const meusPrompts = document.getElementById("meusPrompts");
  const login = document.getElementById("login");
  const userBtn = document.getElementById("userBtn");
  const helpLink = document.getElementById("helpLink");

  // Adicionar event listeners
  if (novoPrompt) novoPrompt.onclick = () => location.href = "checklist.html";
  if (meusPrompts) meusPrompts.onclick = () => location.href = "historico.html";
  if (login) login.onclick = () => location.href = "login.html";
  if (userBtn) userBtn.onclick = () => location.href = "usuario.html";
  if (helpLink) helpLink.onclick = e => { e.preventDefault(); alert("Ajuda em construção"); };
});

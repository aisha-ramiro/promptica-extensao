document.addEventListener("DOMContentLoaded", () =>{
  novoPrompt.onclick  = () => location.href = "checklist.html";
  meusPrompts.onclick = () => location.href = "historico.html";
  login.onclick       = () => location.href = "login.html";
  userBtn.onclick     = () => location.href = "usuario.html"; // página de usuário
  helpLink.onclick    = e => { e.preventDefault(); alert("Ajuda em construção"); };
});

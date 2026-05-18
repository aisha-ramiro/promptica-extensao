document.addEventListener("DOMContentLoaded", () => {
  const novoPrompt = document.getElementById("novoPrompt");
  const meusPrompts = document.getElementById("meusPrompts");
  const login = document.getElementById("login");
  const userBtn = document.getElementById("userBtn");
  const helpLink = document.getElementById("helpLink");
  const homeButtonGroup = document.getElementById("homeButtonGroup");

  const session = getSupabaseSession();
  const isLoggedIn = Boolean(session && session.access_token);

  if (novoPrompt) {
    novoPrompt.disabled = !isLoggedIn;
    novoPrompt.onclick = () => {
      if (isLoggedIn) location.href = "checklist.html";
    };
  }

  if (meusPrompts) {
    meusPrompts.disabled = !isLoggedIn;
    meusPrompts.onclick = () => {
      if (isLoggedIn) location.href = "historico.html";
    };
  }

  if (login) {
    login.textContent = isLoggedIn ? "Sair" : "Login";
    login.onclick = () => {
      if (isLoggedIn) {
        signOutSupabase();
        location.href = "login.html";
      } else {
        location.href = "login.html";
      }
    };
  }

  if (userBtn) userBtn.onclick = () => location.href = isLoggedIn ? "usuario.html" : "login.html";
  if (helpLink) helpLink.onclick = e => { e.preventDefault(); alert("Ajuda em construção"); };
});

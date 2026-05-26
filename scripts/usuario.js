document.addEventListener("DOMContentLoaded", () => {
  const backHome = document.getElementById("backHome");
  const goEditar = document.getElementById("goEditar");
  const goAjuda = document.getElementById("goAjuda");
  const goFale = document.getElementById("goFale");
  const goPolitica = document.getElementById("goPolitica");
  const logoutBtn = document.querySelector(".logout-btn");

  if (backHome) backHome.addEventListener("click", () => location.href = "home.html");
  if (goEditar) goEditar.addEventListener("click", () => location.href = "editar-perfil.html");
  if (goAjuda) goAjuda.addEventListener("click", () => location.href = "ajuda.html");
  if (goFale) goFale.addEventListener("click", () => location.href = "fale.html");
  if (goPolitica) goPolitica.addEventListener("click", () => location.href = "politica.html");

  const themeToggle = document.getElementById("themeToggle");
  const themeToggleLabel = themeToggle?.querySelector("em");

  const updateThemeLabel = (theme) => {
    if (!themeToggleLabel) return;
    themeToggleLabel.textContent = theme === THEME_DARK ? "Escuro" : "Claro";
  };

  if (themeToggle) {
    updateThemeLabel(getSavedTheme());
    themeToggle.addEventListener("click", () => {
      const nextTheme = toggleTheme();
      updateThemeLabel(nextTheme);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOutSupabase();
      location.href = "login.html";
    });
  }

  const session = getSupabaseSession();
  const profileName = document.querySelector(".profile h2");
  if (!session || !session.user) {
    location.href = "login.html";
    return;
  }

  if (profileName) {
    profileName.textContent = session.user.email || session.user.user_metadata?.nome || "Minha Conta";
  }
});

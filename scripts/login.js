document.addEventListener("DOMContentLoaded", () => {
  const backHome = document.getElementById("backHome");
  const googleBtn = document.getElementById("googleLogin");
  const statusEl = document.getElementById("loginStatus");
  const loginEmail = document.getElementById("loginEmail");
  const loginSenha = document.getElementById("loginSenha");
  const btnEntrar = document.getElementById("btnEntrar");
  const goCadastro = document.getElementById("goCadastro");

  if (backHome) {
    backHome.addEventListener("click", () => {
      location.href = "home.html";
    });
  }

  if (goCadastro) {
    goCadastro.addEventListener("click", event => {
      event.preventDefault();
      location.href = "cadastro.html";
    });
  }

  if (btnEntrar) {
    btnEntrar.addEventListener("click", async () => {
      const email = loginEmail?.value.trim();
      const password = loginSenha?.value;
      statusEl.textContent = "";

      if (!email || !password) {
        statusEl.textContent = "Preencha e-mail e senha.";
        return;
      }

      try {
        await signInSupabase(email, password);
        statusEl.textContent = "Login realizado com sucesso!";
        setTimeout(() => location.href = "home.html", 500);
      } catch (error) {
        console.error(error);
        statusEl.textContent = error?.message || "Falha ao efetuar o login.";
      }
    });
  }
});

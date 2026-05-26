document.addEventListener("DOMContentLoaded", () => {
  const backLogin = document.getElementById("backLogin");
  const nome = document.getElementById("nome");
  const sobrenome = document.getElementById("sobrenome");
  const email = document.getElementById("email");
  const nascimento = document.getElementById("nascimento");
  const fone = document.getElementById("fone");
  const senha = document.getElementById("senha");
  const btnCadastrar = document.getElementById("btnCadastrar");
  const msgObrig = document.getElementById("msgObrig");

  if (backLogin) {
    backLogin.addEventListener("click", () => {
      location.href = "login.html";
    });
  }

  const obrigatorios = [nome, sobrenome, email, senha];
  obrigatorios.forEach(input => {
    if (input) {
      input.addEventListener("input", () => input.classList.remove("erro"));
    }
  });

  if (btnCadastrar) {
    btnCadastrar.addEventListener("click", async () => {
      let formValido = true;
      obrigatorios.forEach(input => {
        if (input && !input.value.trim()) {
          input.classList.add("erro");
          formValido = false;
        }
      });

      if (!formValido) {
        msgObrig?.classList.remove("hidden");
        return;
      }

      msgObrig?.classList.add("hidden");

      try {
        await signUpSupabase(email.value.trim(), senha.value, {
          nome: nome.value.trim(),
          sobrenome: sobrenome.value.trim(),
          nascimento: nascimento?.value || "",
          telefone: fone?.value.trim() || ""
        });
        alert("Cadastro realizado com sucesso. Faça login.");
        location.href = "login.html";
      } catch (error) {
        alert(error?.message || "Erro ao cadastrar. Tente novamente.");
      }
    });
  }
});

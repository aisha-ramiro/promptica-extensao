document.addEventListener("DOMContentLoaded", () => {
  backHome.onclick  = () => location.href = "home.html";
  goCadastro.onclick= e => { e.preventDefault(); location.href = "cadastro.html"; };

  googleBtn.onclick = () => alert("Login Google (placeholder)");
  

  btnEntrar.onclick = () =>{
    const ok = loginEmail.value.trim() && loginSenha.value.trim();
    alert(ok ? "Login (placeholder)" : "Preencha e-mail e senha.");
  };
});

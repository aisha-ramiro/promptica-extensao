document.addEventListener("DOMContentLoaded", () => {
  backLogin.onclick = () => history.back();

  const obrig = [nome, email, senha];

  /* valida em tempo real */
  obrig.forEach(inp=>{
    inp.addEventListener("input",() => inp.classList.remove("erro"));
  });

  btnCadastrar.onclick = () =>{
    let ok = true;
    obrig.forEach(inp=>{
      if(!inp.value.trim()){ inp.classList.add("erro"); ok = false; }
    });

    if(!ok){
      msgObrig.classList.remove("hidden");
      return;
    }
    msgObrig.classList.add("hidden");
    alert("Cadastro (placeholder)");
    location.href = "login.html";
  };
});

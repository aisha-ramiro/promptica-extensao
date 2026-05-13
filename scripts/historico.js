document.addEventListener("DOMContentLoaded", () => {
  voltarHome.onclick = () => location.href = "home.html";
  userBtn.onclick     = () => location.href = "usuario.html"; // página de usuário

  /* selecionar todos */
  selectAll.onchange = () =>{
    document.querySelectorAll(".prompt-check")
      .forEach(cb => cb.checked = selectAll.checked);
  };

  /* deletar marcados (placeholder) */
  deleteSelected.onclick = () =>{
    const marcados = [...document.querySelectorAll(".prompt-check")]
                     .filter(cb => cb.checked);
    alert(`Excluir ${marcados.length} prompt(s) – placeholder`);
  };

  /* links visualizar / editar */
  document.querySelectorAll(".view").forEach(a =>{
    a.onclick = e => { e.preventDefault(); location.href = "visualizar.html"; };
  });
  document.querySelectorAll(".edit").forEach(a =>{
    a.onclick = e => { e.preventDefault(); location.href = "checklist.html"; };
  });
});

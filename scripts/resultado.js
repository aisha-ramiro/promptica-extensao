// scripts/resultado.js
document.addEventListener("DOMContentLoaded", () => {

  /* refs --------------------------- */
  const pre   = document.getElementById("output");
  const copy  = document.getElementById("btnCopiar");
  const edit  = document.getElementById("btnEditar");
  const back  = document.getElementById("btnVoltar");      // toolbar
  const back2 = document.getElementById("btnVoltarTopo");  // header
  const del   = document.getElementById("btnExcluir");
  const toast = document.getElementById("toast");

  /* util – toast ------------------- */
  const show = (msg, ms = 1500) => {
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), ms);
  };

  /* carrega texto ------------------ */
  pre.textContent = localStorage.getItem("promptGerado") || "(vazio)";

  /* copiar ------------------------- */
  copy.onclick = async () => {
    await navigator.clipboard.writeText(pre.textContent);
    show("Copiado!");
  };

  /* editar ------------------------- */
  let editando = false;
  edit.onclick = () => {
    if (!editando) {
      /* vira textarea */
      const ta = document.createElement("textarea");
      ta.id    = "editorTemp";
      ta.value = pre.textContent;
      ta.style.cssText = "width:100%;height:280px";
      pre.replaceWith(ta);
      editando = true;
      show("Modo edição");
    } else {
      /* salva e volta a <pre> */
      const ta = document.getElementById("editorTemp");
      pre.textContent = ta.value.trim();
      ta.replaceWith(pre);
      localStorage.setItem("promptGerado", pre.textContent);
      editando = false;
      show("Edição salva!");
    }
  };

  /* voltar (ambos botões) ---------- */
  const goChecklist = () => location.assign("checklist.html");
  back .onclick = goChecklist;
  back2.onclick = goChecklist;

  /* excluir ------------------------ */
  del.onclick = () => {
    if (confirm("Excluir este prompt?")) {
      localStorage.removeItem("promptGerado");
      localStorage.removeItem("draftPromptica");
      show("Prompt excluído!");
      setTimeout(() => location.assign("home.html"), 800);
    }
  };
});

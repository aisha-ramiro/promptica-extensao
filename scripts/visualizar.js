document.addEventListener("DOMContentLoaded", async () => {
  const btnVoltarTopo = document.getElementById("btnVoltarTopo");
  const userBtn = document.getElementById("userBtn");
  const copy = document.getElementById("btnCopiar");
  const edit = document.getElementById("btnEditar");
  const back = document.getElementById("btnVoltar");
  const back2 = document.getElementById("btnVoltarTopo");
  const del = document.getElementById("btnExcluir");
  const save = document.getElementById("btnSalvar");
  const pre = document.getElementById("output");
  const toast = document.getElementById("toast");

  const show = (msg, ms = 1500) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), ms);
  };

  const selectedId = getSelectedPromptId();
  let item = carregarHistorico().find(entry => entry.id === selectedId);
  if (!item && selectedId) {
    item = await buscarPromptPorIdBanco(selectedId);
  }
  const promptText = item?.text || localStorage.getItem("promptGerado") || "(vazio)";
  if (pre) pre.textContent = promptText;

  if (btnVoltarTopo) {
    btnVoltarTopo.addEventListener("click", () => location.href = "historico.html");
  }
  if (back) {
    back.addEventListener("click", () => location.href = "historico.html");
  }
  if (userBtn) {
    userBtn.addEventListener("click", () => location.href = "usuario.html");
  }

  if (copy) {
    copy.addEventListener("click", async () => {
      if (!pre) return;
      const editor = document.getElementById("editorTemp");
      const text = editor ? editor.value : pre.textContent;
      await copiarTexto(text);
      show("Copiado!");
    });
  }

  let editando = false;
  if (edit) {
    edit.addEventListener("click", () => {
      if (!pre) return;
      if (!editando) {
        const ta = document.createElement("textarea");
        ta.id = "editorTemp";
        ta.value = pre.textContent;
        ta.style.cssText = "width:100%;height:280px";
        pre.replaceWith(ta);
        editando = true;
        show("Modo edição");
      } else {
        const ta = document.getElementById("editorTemp");
        if (!ta) return;
        pre.textContent = ta.value.trim();
        ta.replaceWith(pre);
        localStorage.setItem("promptGerado", pre.textContent);
        editando = false;
        show("Edição salva!");
      }
    });
  }

  if (save) {
    save.addEventListener("click", () => {
      if (!pre) return;
      const editor = document.getElementById("editorTemp");
      const text = editor ? editor.value.trim() : pre.textContent.trim();
      if (!text) {
        show("Nada para salvar.");
        return;
      }
      if (editor) {
        pre.textContent = text;
        editor.replaceWith(pre);
        editando = false;
        localStorage.setItem("promptGerado", text);
      }
      addPromptToHistory(text);
      show("Prompt salvo no histórico.");
    });
  }

  if (del) {
    del.addEventListener("click", () => {
      if (!selectedId) {
        show("Nenhum prompt selecionado para excluir.");
        return;
      }
      if (confirm("Excluir este prompt?")) {
        removePromptFromHistory(selectedId);
        setSelectedPromptId(null);
        localStorage.removeItem("promptGerado");
        localStorage.removeItem("draftPromptica");
        show("Prompt excluído!");
        setTimeout(() => location.assign("historico.html"), 800);
      }
    });
  }
});

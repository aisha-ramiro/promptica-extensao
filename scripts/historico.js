document.addEventListener("DOMContentLoaded", () => {
  const voltarHome = document.getElementById("voltarHome");
  const userBtn = document.getElementById("userBtn");
  const selectAll = document.getElementById("selectAll");
  const deleteSelected = document.getElementById("deleteSelected");
  const listaPrompts = document.getElementById("listaPrompts");

  const renderHistorico = async () => {
    if (!listaPrompts) return;
    const historico = await carregarHistoricoUsuario();
    listaPrompts.innerHTML = "";
    if (selectAll) {
      selectAll.checked = false;
    }

    if (!historico.length) {
      listaPrompts.innerHTML = `
        <li class="prompt-item empty">
          <div class="prompt-box">Nenhum prompt salvo ainda.</div>
        </li>`;
      return;
    }

    historico.forEach(item => {
      const li = document.createElement("li");
      li.className = "prompt-item";

      const promptBox = document.createElement("div");
      promptBox.className = "prompt-box";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "prompt-check";
      checkbox.dataset.id = item.id;

      const preview = document.createElement("div");
      preview.className = "preview";
      const textValue = item.text.length > 80 ? item.text.slice(0, 80) + "..." : item.text;
      preview.textContent = textValue;

      promptBox.appendChild(checkbox);
      promptBox.appendChild(preview);

      const links = document.createElement("div");
      links.className = "links";

      const viewLink = document.createElement("a");
      viewLink.href = "#";
      viewLink.className = "view";
      viewLink.dataset.id = item.id;
      viewLink.textContent = "Visualizar";

      const deleteLink = document.createElement("a");
      deleteLink.href = "#";
      deleteLink.className = "delete";
      deleteLink.dataset.id = item.id;
      deleteLink.textContent = "Excluir";

      links.appendChild(viewLink);
      links.insertAdjacentText("beforeend", " | ");
      links.appendChild(deleteLink);

      li.appendChild(promptBox);
      li.appendChild(links);
      listaPrompts.appendChild(li);
    });
  };

  if (voltarHome) voltarHome.addEventListener("click", () => location.href = "home.html");
  if (userBtn) userBtn.addEventListener("click", () => location.href = "usuario.html");

  if (selectAll) {
    selectAll.addEventListener("change", () => {
      document.querySelectorAll(".prompt-check").forEach(cb => cb.checked = selectAll.checked);
    });
  }

  if (deleteSelected) {
    deleteSelected.addEventListener("click", () => {
      const marcados = [...document.querySelectorAll(".prompt-check")].filter(cb => cb.checked);
      if (!marcados.length) {
        alert("Selecione ao menos um prompt para excluir");
        return;
      }
      const ids = marcados.map(cb => cb.dataset.id).filter(Boolean);
      removePromptsFromHistory(ids);
      renderHistorico();
    });
  }

  document.body.addEventListener("click", event => {
    const target = event.target;
    if (target.matches(".view")) {
      event.preventDefault();
      const id = target.dataset.id;
      if (id) {
        setSelectedPromptId(id);
        location.href = "visualizar.html";
      }
    }

    if (target.matches(".delete")) {
      event.preventDefault();
      const id = target.dataset.id;
      if (id && confirm("Excluir este prompt do histórico?")) {
        removePromptFromHistory(id);
        renderHistorico();
      }
    }
  });

  renderHistorico();
});

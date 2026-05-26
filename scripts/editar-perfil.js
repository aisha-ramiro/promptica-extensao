document.addEventListener("DOMContentLoaded", async () => {
  const backConta = document.getElementById("backConta");
  const nomeInput = document.getElementById("nomeInput");
  const sobrenomeInput = document.getElementById("sobrenomeInput");
  const emailInput = document.getElementById("emailInput");
  const nascimentoInput = document.getElementById("nascimentoInput");
  const celularInput = document.getElementById("celularInput");
  const senhaInput = document.getElementById("senhaInput");
  const form = document.querySelector(".form-box");

  if (backConta) backConta.onclick = () => history.back();

  const session = getSupabaseSession();
  if (!session?.user?.id) {
    location.href = "login.html";
    return;
  }

  const profile = await buscarPerfilUsuario().catch(() => null);
  const metadata = session.user.user_metadata || {};

  if (nomeInput) nomeInput.value = profile?.nome || metadata.nome || "";
  if (sobrenomeInput) sobrenomeInput.value = profile?.sobrenome || metadata.sobrenome || "";
  if (emailInput) {
    emailInput.value = session.user.email || profile?.email || "";
    emailInput.readOnly = true;
  }
  if (nascimentoInput) nascimentoInput.value = profile?.data_nascimento || metadata.nascimento || "";
  if (celularInput) celularInput.value = profile?.numero_celular || metadata.telefone || "";
  if (senhaInput) senhaInput.value = "";

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const profileData = {
      nome: nomeInput?.value?.trim() || null,
      sobrenome: sobrenomeInput?.value?.trim() || null,
      data_nascimento: nascimentoInput?.value || null,
      numero_celular: celularInput?.value?.trim() || null
    };

    try {
      await atualizarPerfilUsuario(profileData);
      alert("Perfil atualizado com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Falha ao atualizar perfil: " + (error?.message || error));
    }
  });
});

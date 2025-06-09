// scripts/login.js  (ES module)

document.addEventListener("DOMContentLoaded", () => {
  const googleBtn = document.getElementById("googleLogin");
  const statusEl  = document.getElementById("loginStatus");

  const clientId = chrome.runtime.getManifest().oauth2.client_id;
  const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;

 const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

authUrl.searchParams.set("client_id",     clientId);
authUrl.searchParams.set("response_type", "token");
authUrl.searchParams.set("redirect_uri",  redirectUri);    // <-- aqui!
authUrl.searchParams.set("scope",         "openid email profile");
authUrl.searchParams.set("prompt",        "select_account");


  /* ---------- clique no botão ---------- */
  googleBtn.onclick = () => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl.toString(), interactive: true },
      redirectUrl => {
        if (chrome.runtime.lastError || !redirectUrl) {
          statusEl.textContent = "Falha no login 😢";
          console.error(chrome.runtime.lastError);
          return;
        }

        /* extrai access_token "#token=..." */
        const hash = new URL(redirectUrl).hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");

        if (!accessToken) {
          statusEl.textContent = "Token não recebido.";
          return;
        }

        /* busca informações do perfil */
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then(r => r.json())
          .then(info => {
            /* guarda no storage */
            chrome.storage.local.set({
              user: {
                name:  info.name,
                email: info.email,
                picture: info.picture,
                token: accessToken
              }
            }, () => {
              statusEl.textContent = `Olá, ${info.given_name}!`;
              /* redireciona p/ home ou usuário */
              setTimeout(() => location.href = "home.html", 800);
            });
          })
          .catch(err => {
            console.error(err);
            statusEl.textContent = "Erro ao obter perfil.";
          });
      }
    );
  };
});

export function onUserReady(callback) {
  chrome.storage.local.get("user", data => {
    callback(data.user || null);
  });

  /* se quiser reagir a login/logout em tempo real */
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.user) {
      callback(changes.user.newValue || null);
    }
  });
}
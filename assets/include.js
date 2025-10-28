// Inclut automatiquement tout élément portant l'attribut data-include="/chemin/vers/fichier.html"
document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll('[data-include]');
  targets.forEach(async el => {
    const url = el.getAttribute('data-include');
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(res.statusText);
      const html = await res.text();
      el.outerHTML = html; // remplace le placeholder par le contenu
    } catch (e) {
      console.error('Include failed for', url, e);
    }
  });
});

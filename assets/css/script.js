/* global CC_DATA */
(() => {
  // ------- Helpers globaux -------
  function normalize(str) {
    return (str || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function slugify(str) {
    return normalize(str)
      .replace(/&/g, "et")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  // Expose quelques utils côté data
  window.CC_DATA = window.CC_DATA || {};
  CC_DATA.utils = CC_DATA.utils || {};
  CC_DATA.utils.slugify = slugify;
  CC_DATA.utils.normalize = normalize;

  CC_DATA.utils.formatEUR = (n) => {
    if (n == null || isNaN(n)) return "—";
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
  };

  CC_DATA.utils.toTitle = (slug) =>
    slug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

  CC_DATA.utils.getCountryBySlug = (slug) =>
    (CC_DATA.countries || []).find(c => c.slug === slug);

  CC_DATA.utils.getProductBySlug = (slug) =>
    (CC_DATA.products || []).find(p => p.slug === slug);

  CC_DATA.utils.buildCountrySummary = (country) => {
    // Démo simple : compare 3 catégories si dispo
    const base = [];
    ["lait","restaurant","hotel"].forEach(cat => {
      const price = country.categories[cat];
      if (price != null) base.push(`${CC_DATA.utils.toTitle(cat)}: ${CC_DATA.utils.formatEUR(price)}`);
    });
    return base.length ? `Quelques repères – ${base.join(" • ")}` : `Aperçu des prix pour ${country.name}.`;
  };

  // ------- Moteur de recherche (index) -------
  window.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("search-form");
    if (!form) return;

    const inputCountry = document.getElementById("country-input");
    const inputProduct = document.getElementById("product-input");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const cVal = inputCountry.value.trim();
      const pVal = inputProduct.value.trim();

      const cSlug = cVal ? slugify(cVal) : "";
      const pSlug = pVal ? slugify(pVal) : "";

      // On essaie de mapper à une entrée existante (tolérant aux fautes)
      const country = cSlug ? (CC_DATA.countries.find(c => c.slug === cSlug) || null) : null;
      const product = pSlug ? (CC_DATA.products.find(p => p.slug === pSlug) || null) : null;

      // Redirections
      if (country && product) {
        location.assign(`./produit/${product.slug}.html?pays=${country.slug}`);
      } else if (country && !product) {
        location.assign(`./pays/${country.slug}.html`);
      } else if (!country && product) {
        location.assign(`./produit/${product.slug}.html`);
      } else {
        alert("Saisis un pays, une catégorie, ou les deux 😉");
      }
    });
  });
})();
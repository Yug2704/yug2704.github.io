// Données statiques (tout en EUR) — complète au fur et à mesure
window.DATA = {
  countries: [
    {
      slug: "france", name: "France",
      summary: "Coût de la vie en France (moyennes nationales, en euros).",
      values: { restaurant: 15, logement: 1140, transport: 1.8, tabac: 11.5 },
      cities: [{ slug:"paris", name:"Paris" }, { slug:"lyon", name:"Lyon" }]
    },
    {
      slug: "espagne", name: "Espagne",
      summary: "Coût de la vie en Espagne (moyennes nationales, en euros).",
      values: { restaurant: 12, logement: 900, transport: 1.5, tabac: 6 },
      cities: [{ slug:"madrid", name:"Madrid" }]
    },
    {
      slug: "japon", name: "Japon",
      summary: "Coût de la vie au Japon (moyennes converties en euros).",
      values: { restaurant: 8, logement: 750, transport: 1.3, tabac: 5.5 },
      cities: [{ slug:"tokyo", name:"Tokyo" }]
    }
  ],
  cities: [
    { slug:"paris",  name:"Paris",  country:"france",  values:{ restaurant:18, logement:1300, transport:2.15, tabac:12 },  url:"/cities/paris.html" },
    { slug:"lyon",   name:"Lyon",   country:"france",  values:{ restaurant:15, logement:950,  transport:1.90, tabac:11.8 }, url:"/cities/lyon.html"  },
    { slug:"madrid", name:"Madrid", country:"espagne", values:{ restaurant:12, logement:900,  transport:1.50, tabac:6 },    url:"/cities/madrid.html"},
    { slug:"tokyo",  name:"Tokyo",  country:"japon",   values:{ restaurant:8,  logement:750,  transport:1.30, tabac:5.5 },  url:"/cities/tokyo.html" }
  ]
};

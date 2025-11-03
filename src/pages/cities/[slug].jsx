import fs from "fs";
import path from "path";
import BaseLayout from "../../layouts/BaseLayout";
import PriceTable from "../../components/PriceTable";
import ComparisonBlock from "../../components/ComparisonBlock";

export async function getStaticPaths() {
  const citiesDir = path.join(process.cwd(), "src", "data", "cities");
  const files = fs.readdirSync(citiesDir).filter(f => f.endsWith(".json"));

  const paths = files.map((file) => {
    const slug = file.replace(/\.json$/, "");
    return { params: { slug } };
  });

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const filePath = path.join(process.cwd(), "src", "data", "cities", `${params.slug}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  return { props: { data } };
}

export default function CityPage({ data }) {
  return (
    <BaseLayout
      title={`Coût de la vie à ${data.name} (${data.country})`}
      description={`Prix à ${data.name} : repas, logement, transport, etc. Comparaison avec la France.`}
      banner={data.banner}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Prix de la vie à {data.name}</h1>
        {data.summary && <p className="text-gray-700 mb-6">{data.summary}</p>}
        <PriceTable prices={data.prices} currency={data.currency} />
        <ComparisonBlock base={data.comparison_base} target={data.name} />
      </div>
    </BaseLayout>
  );
}

import BaseLayout from "../../layouts/BaseLayout";
import PriceTable from "../../components/PriceTable";
import ComparisonBlock from "../../components/ComparisonBlock";
import data from "../../data/cities/tokyo.json";

export default function TokyoPage() {
  return (
    <BaseLayout
      title={`Coût de la vie à ${data.name} (${data.country})`}
      description={`Découvrez le coût de la vie à ${data.name} : repas, logement, transport, loisirs et plus. Comparez avec la France.`}
      banner={data.banner}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Prix de la vie à {data.name}</h1>
        <p className="text-gray-700 mb-6">{data.summary}</p>
        <PriceTable prices={data.prices} currency={data.currency} />
        <ComparisonBlock base={data.comparison_base} target={data.name} />
      </div>
    </BaseLayout>
  );
}

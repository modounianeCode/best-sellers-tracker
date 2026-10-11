import "dotenv/config";
import { fetchAllBestSellers, saveResult } from "../src/lib/store";

async function main() {
  const result = await fetchAllBestSellers();
  await saveResult(result);
  console.log(
    `✅ ${result.products.length} produits sauvegardés à ${result.updatedAt}`,
  );
}

void main();

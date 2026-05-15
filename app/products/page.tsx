import { isBuildMode } from "../../lib/buildMode";
import ProductsPageClient from "../_client/ProductsPage";
import {
  fetchProductCategories,
  fetchProducts,
} from "../../graphql/products/server";
import { fetchWebPage } from "../../lib/fetchWebPage";
import { Section } from "../../types/sections";

export default async function ProductsPage() {
  if (isBuildMode()) {
    return (
      <ProductsPageClient
        initialCategories={[]}
        initialProducts={[]}
      />
    );
  }

  const webId = process.env.ERXES_WEB_ID || "";
  const [categoriesResult, productsResult, page] = await Promise.all([
    fetchProductCategories({ variables: { perPage: 100, excludeEmpty: false }, fetchPolicy: "no-cache" }),
    fetchProducts({ variables: { perPage: 100, page: 1 }, fetchPolicy: "no-cache" }),
    fetchWebPage(webId, "products"),
  ]);

  const initialSections: Section[] = page?.pageItems ?? [];

  return (
    <ProductsPageClient
      initialCategories={categoriesResult.data?.cpPoscProductCategories ?? []}
      initialProducts={productsResult.data?.cpPoscProducts ?? []}
      initialSections={initialSections}
    />
  );
}

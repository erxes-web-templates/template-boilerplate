import { isBuildMode } from "../../lib/buildMode";
import ProductsPageClient from "../_client/ProductsPage";
import {
  fetchProductCategories,
  fetchProducts,
} from "../../graphql/products/server";

export default async function ProductsPage() {
  const [categoriesResult, productsResult] = isBuildMode()
    ? [{ data: null }, { data: null }]
    : await Promise.all([
        fetchProductCategories({ variables: { perPage: 100, excludeEmpty: false }, fetchPolicy: "no-cache" }),
        fetchProducts({ variables: { perPage: 100, page: 1 }, fetchPolicy: "no-cache" }),
      ]);

  return (
    <ProductsPageClient
      initialCategories={categoriesResult.data?.cpPoscProductCategories ?? []}
      initialProducts={productsResult.data?.cpPoscProducts ?? []}
    />
  );
}

"use client";

import { Suspense } from "react";
import ClientLayout from "../../../_components/ClientLayout";
import PreviewEnvBridge from "../../../_components/PreviewEnvBridge";
// Relative, not "@/": the builder's tsconfig maps "@/" to its own src.
import PageLoader from "../../../../components/common/PageLoader";

/**
 * Self-hosted builder preview.
 *
 * The web builder used to import this template's ClientLayout and render it
 * inside its own React tree, which meant the preview was styled by the
 * builder's Tailwind config and never loaded this template's globals.css —
 * so custom tokens, fonts and component classes silently did nothing.
 *
 * Serving the preview from the template's own app instead means the builder
 * can point an iframe here and get exactly the CSS, fonts and env the built
 * site uses. `isBuildMode()` already keys off this "/dashboard/projects/"
 * path, and `templateUrl()` already generates links of this shape, so the
 * rest of the template needs no special casing.
 */
export default function BuilderPreviewPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PreviewEnvBridge />
      <ClientLayout />
    </Suspense>
  );
}

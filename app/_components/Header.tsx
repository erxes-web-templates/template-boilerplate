import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { CPDetail, MenuItem } from "../../types/cms";
import { useQuery } from "@apollo/client";
import { GET_CMS_MENU_LIST } from "../../graphql/queries";
import Image from "next/image";
import { getFileUrl, templateUrl } from "@/lib/utils";
import {
  ShoppingCart,
  Search,
  Menu,
  User,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "../../lib/CartContext";
import { useProductsQuery } from "../../graphql/products";

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) {
    return "₮0";
  }
  return `₮${Math.round(value).toLocaleString()}`;
};

export default function Header({ cpDetail }: { cpDetail: CPDetail }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("searchValue") ?? ""
  );
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm.trim());
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    },
    []
  );

  const { data } = useQuery(GET_CMS_MENU_LIST, {
    variables: {
      clientPortalId: params.id || process.env.ERXES_CP_ID,
      kind: "main",
    },
  });

  const menus = data?.cmsMenuList || [];

  const organizeMenus = (menus: MenuItem[]) => {
    const menuMap: Record<string, MenuItem & { children: MenuItem[] }> = {};

    menus.forEach((menu: any) => {
      menuMap[menu._id] = { ...menu, children: [] };
    });

    const nestedMenus: (MenuItem & { children: MenuItem[] })[] = [];

    menus.forEach((menu: any) => {
      if (menu.parentId) {
        menuMap[menu.parentId]?.children.push(menuMap[menu._id]);
      } else {
        nestedMenus.push(menuMap[menu._id]);
      }
    });

    return nestedMenus;
  };
  const nestedMenus = organizeMenus(menus);

  const renderMenu = (
    menu: MenuItem & { children: MenuItem[] },
    isChild = false
  ) => (
    <div key={menu._id} className="relative group z-10">
      <Link
        href={templateUrl(menu.url || "")}
        className={
          isChild
            ? "block rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-slate-100 hover:text-[color:var(--accent)]"
            : "text-sm font-semibold uppercase tracking-[0.2em] transition-colors hover:text-[color:var(--accent)]"
        }
        style={{ color: "var(--primary)" }}
      >
        {menu.label}
      </Link>
      {menu.children.length > 0 && (
        <div className="absolute hidden min-w-[180px] translate-y-2 rounded-xl border border-slate-200/70 bg-white shadow-xl group-hover:block">
          <div className="space-y-2 p-3">
            {menu.children.map((child: any) => renderMenu(child, true))}
          </div>
        </div>
      )}
    </div>
  );

  const {
    items,
    totalItems,
    totalPrice,
    clearCart,
    updateQuantity,
    removeFromCart,
    isSyncing,
  } = useCart();
  const hasItems = totalItems > 0;
  const shouldQueryProducts = debouncedTerm.length >= 2;
  const { data: searchData, loading: searchLoading } = useProductsQuery({
    variables: {
      searchValue: debouncedTerm,
      perPage: 6,
      page: 1,
    },
    skip: !shouldQueryProducts,
    fetchPolicy: "cache-first",
  });

  useEffect(() => {
    const currentSearchValue = searchParams.get("searchValue") ?? "";
    setSearchTerm(currentSearchValue);
    setDebouncedTerm(currentSearchValue.trim());
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleCartOpen = () => setIsCartSheetOpen(true);
    window.addEventListener("cart:open", handleCartOpen);
    return () => {
      window.removeEventListener("cart:open", handleCartOpen);
    };
  }, []);

  const searchResults = useMemo(
    () => searchData?.poscProducts ?? [],
    [searchData]
  );

  const handleNavigate = useCallback(
    (path: string) => {
      const destination = templateUrl(path);
      router.push(destination);
    },
    [router]
  );

  const handleSearchSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const term = searchTerm.trim();
      if (!term) {
        handleNavigate("/products");
        setShowSearchResults(false);
        return;
      }
      const base = templateUrl("/products");
      const separator = base.includes("?") ? "&" : "?";
      const url = `${base}${separator}searchValue=${encodeURIComponent(term)}`;
      router.push(url);
      setShowSearchResults(false);
    },
    [handleNavigate, router, searchTerm]
  );

  const handleProductSelect = useCallback(
    (productId: string) => {
      handleNavigate(`/products/${productId}`);
      setShowSearchResults(false);
    },
    [handleNavigate]
  );

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    if (searchTerm.trim()) {
      setShowSearchResults(true);
    }
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setShowSearchResults(false);
    }, 150);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    if (event.target.value.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  console.log(searchResults, "sr");

  return (
    <header
      className="sticky top-0 z-50 w-full border-b shadow-lg"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--primary)",
        borderColor: "var(--accent)",
      }}
    >
      <div
        className="container mx-auto flex h-16 items-center justify-between px-4 py-3"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <div className="flex items-center gap-8">
          <Link
            href={templateUrl("/")}
            className="text-xl font-semibold tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {cpDetail.logo ? (
              <Image
                src={getFileUrl(cpDetail.logo)}
                alt={cpDetail.name}
                width={50}
                height={50}
              />
            ) : (
              cpDetail.name
            )}
          </Link>
          <nav className="hidden items-center gap-6 text-sm uppercase tracking-[0.2em] md:flex">
            {nestedMenus.map(renderMenu)}
          </nav>
        </div>

        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <form onSubmit={handleSearchSubmit} className="w-full max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-current opacity-60" />
              <Input
                type="search"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Search..."
                className="w-full rounded-full border bg-transparent pl-11 placeholder:text-current placeholder:opacity-50"
                style={{ color: "var(--primary)", borderColor: "var(--accent)" }}
              />
              {showSearchResults && (
                <div className="absolute left-0 right-0 top-full z-20 mt-3 rounded-2xl border bg-white shadow-2xl">
                  {shouldQueryProducts ? (
                    searchLoading ? (
                      <div className="p-4 text-sm text-slate-500">
                        Searching products...
                      </div>
                    ) : searchResults.length ? (
                      <ul className="divide-y divide-slate-100">
                        {searchResults.map((item: any) => (
                          <li key={item._id}>
                            <button
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => handleProductSelect(item._id)}
                              className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-slate-50"
                            >
                              <div className="flex justify-start">
                                <Image
                                  src={
                                    item.attachment.url || "/placeholder.png"
                                  }
                                  alt={item.name || "Product image"}
                                  width={40}
                                  height={40}
                                  className="rounded-xl mr-3"
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-slate-900">
                                    {item.name || "Untitled product"}
                                  </span>
                                  {item.category?.name && (
                                    <span className="text-xs text-slate-500">
                                      {item.category.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {Number.isFinite(item.unitPrice) && (
                                <span className="text-sm font-semibold text-slate-900">
                                  {formatCurrency(item.unitPrice || 0)}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                        <li>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleSearchSubmit()}
                            className="flex w-full items-center justify-between p-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                          >
                            View all results
                          </button>
                        </li>
                      </ul>
                    ) : (
                      <div className="p-4 text-sm text-slate-500">
                        No products found.
                      </div>
                    )
                  ) : (
                    <div className="p-4 text-sm text-slate-500">
                      Type at least 2 characters to search.
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="flex items-center gap-4">
          <Link href={templateUrl("/profile")}>
            <Button
              variant="ghost"
              size="icon"
              className="hidden text-current hover:bg-black/10 md:flex"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>

          <Sheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-current hover:bg-black/10"
              >
                <ShoppingCart className="h-5 w-5" />
                {hasItems && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-full max-w-sm flex-col gap-4 p-6 sm:max-w-md"
              style={{
                backgroundColor: "var(--background)",
                color: "var(--primary)",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-wide">
                    Your cart
                  </h2>
                  <p className="text-sm text-current opacity-70">
                    {hasItems
                      ? `${totalItems} item${
                          totalItems === 1 ? "" : "s"
                        } ready to checkout.`
                      : "You have no items in your cart yet."}
                  </p>
                </div>
                {hasItems && (
                  <Badge className="border text-current/80">
                    {totalItems} items
                  </Badge>
                )}
              </div>
              {hasItems ? (
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-3">
                    {items.map((item) => {
                      const lineTotal = item.unitPrice * item.quantity;
                      return (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-xl border p-3"
                          style={{
                            borderColor: "var(--accent)",
                            backgroundColor: "var(--background)",
                          }}
                        >
                          <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-current opacity-60">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium leading-tight">
                                {item.name}
                              </p>
                              <span className="text-sm font-semibold">
                                {formatCurrency(lineTotal)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-current opacity-60">
                              Qty: {item.quantity} ·{" "}
                              {formatCurrency(item.unitPrice)} each
                            </p>
                            {item.categoryName && (
                              <p className="mt-1 text-xs text-current opacity-60">
                                Category: {item.categoryName}
                              </p>
                            )}
                            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    void updateQuantity(
                                      item.id,
                                      item.quantity - 1
                                    );
                                  }}
                                  disabled={item.quantity <= 1 || isSyncing}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    void updateQuantity(
                                      item.id,
                                      item.quantity + 1
                                    );
                                  }}
                                  disabled={isSyncing}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  disabled={isSyncing}
                                >
                                  <Link
                                    href={templateUrl(`/products/${item.id}`)}
                                  >
                                    View
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-rose-400"
                                  onClick={() => {
                                    void removeFromCart(item.id);
                                  }}
                                  disabled={isSyncing}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm text-current opacity-60">
                  Add products to your cart to see them here.
                </div>
              )}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-current opacity-60">Subtotal</span>
                  <span className="text-base font-semibold">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 text-white"
                    style={{ backgroundColor: "var(--accent)" }}
                    disabled={!hasItems || isSyncing}
                    asChild
                  >
                    <Link href={templateUrl("/checkout")}>Checkout</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    disabled={!hasItems || isSyncing}
                    onClick={() => {
                      void clearCart();
                    }}
                  >
                    Clear cart
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-current hover:bg-black/10 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="text-current"
              style={{
                backgroundColor: "var(--background)",
                color: "var(--primary)",
              }}
            >
              <nav className="mt-8 flex flex-col gap-4">
                {nestedMenus.map((menu) => (
                  <div key={menu._id} className="flex flex-col">
                    <Link
                      href={templateUrl(menu.url || "")}
                      className="text-sm font-semibold uppercase tracking-[0.2em] transition-colors"
                      style={{ color: "var(--primary)" }}
                    >
                      {menu.label}
                    </Link>
                    {menu.children.length > 0 && (
                      <div className="mt-3 ml-3 flex flex-col gap-2 border-l pl-3"
                        style={{ borderColor: "var(--accent)" }}
                      >
                        {menu.children.map((child) => (
                          <Link
                            key={child._id}
                            href={templateUrl(child.url || "")}
                            className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
                            style={{ color: "var(--primary)" }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

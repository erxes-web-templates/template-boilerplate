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
import { createPortal } from "react-dom";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { CPDetail, MenuItem } from "../../types/cms";
import { useQuery } from "@apollo/client";
import { GET_CMS_MENU_LIST } from "../../graphql/queries";
import Image from "next/image";
import { getFileUrl, templateUrl } from "@/lib/utils";
import { isBuildMode } from "../../lib/buildMode";
import {
  ShoppingCart,
  Search,
  Menu,
  User,
  Minus,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "../../lib/CartContext";
import { useProductsQuery } from "../../graphql/products";

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return "₮0";
  return `₮${Math.round(value).toLocaleString()}`;
};

export default function Header({ cpDetail }: { cpDetail: CPDetail }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("searchValue") ?? "",
  );
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm.trim());
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(
    () => () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    if (showSearchResults && searchContainerRef.current) {
      const rect = searchContainerRef.current.getBoundingClientRect();
      setDropdownRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, [showSearchResults]);

  const { data } = useQuery(GET_CMS_MENU_LIST, {
    variables: { kind: "main" },
  });

  const menus = data?.cpMenus || [];

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
    nestedMenus.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    nestedMenus.forEach((menu) => {
      (menu.children as any[]).sort(
        (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
      );
    });
    return nestedMenus;
  };

  const nestedMenus = organizeMenus(menus);

  const MenuLink = ({
    href,
    openInNewTab,
    className,
    children,
  }: {
    href: string;
    openInNewTab?: boolean;
    className?: string;
    children: React.ReactNode;
  }) =>
    openInNewTab ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    ) : (
      <Link href={href} className={className}>
        {children}
      </Link>
    );

  const renderMenu = (menu: MenuItem & { children: MenuItem[] }) => (
    <div key={menu._id} className="relative group">
      <MenuLink
        href={templateUrl(menu.url || "")}
        openInNewTab={menu.openInNewTab}
        className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200"
      >
        {menu.label}
      </MenuLink>
      {menu.children.length > 0 && (
        <div className="absolute top-full left-0 pt-2 hidden group-hover:block z-50 min-w-[180px]">
          <div className="bg-background border border-border rounded-lg shadow-lg overflow-hidden">
            {menu.children.map((child: any) => (
              <MenuLink
                key={child._id}
                href={templateUrl(child.url || "")}
                openInNewTab={child.openInNewTab}
                className="block px-4 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors duration-150"
              >
                {child.label}
              </MenuLink>
            ))}
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
    variables: { searchValue: debouncedTerm, perPage: 6, page: 1 },
    skip: !shouldQueryProducts,
    fetchPolicy: "cache-first",
  });

  useEffect(() => {
    const currentSearchValue = searchParams.get("searchValue") ?? "";
    setSearchTerm(currentSearchValue);
    setDebouncedTerm(currentSearchValue.trim());
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleCartOpen = () => setIsCartSheetOpen(true);
    window.addEventListener("cart:open", handleCartOpen);
    return () => window.removeEventListener("cart:open", handleCartOpen);
  }, []);

  const searchResults = useMemo(
    () => searchData?.cpPoscProducts ?? [],
    [searchData],
  );

  const handleNavigate = useCallback(
    (path: string) => router.push(templateUrl(path)),
    [router],
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
      const [pathname, existingQuery = ""] = base.split("?");
      const nextSearchParams = new URLSearchParams(existingQuery);

      nextSearchParams.set("searchValue", term);

      const nextQuery = nextSearchParams.toString();

      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
      setShowSearchResults(false);
    },
    [handleNavigate, router, searchTerm],
  );

  const isBuilder = isBuildMode();

  const handleProductSelect = useCallback(
    (productId: string) => {
      const url = isBuilder
        ? templateUrl(`/product&productId=${productId}`)
        : `/products/${productId}`;
      router.push(url);
      setShowSearchResults(false);
    },
    [router, isBuilder],
  );

  const handleFocus = () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    if (searchTerm.trim()) setShowSearchResults(true);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => setShowSearchResults(false), 150);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setShowSearchResults(!!event.target.value.trim());
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between gap-6 px-4">
        {/* Logo */}
        <Link href={templateUrl("/")} className="shrink-0">
          {cpDetail?.logo ? (
            <Image
              src={getFileUrl(
                typeof cpDetail.logo === "string"
                  ? cpDetail.logo
                  : cpDetail.logo.url,
              )}
              alt={cpDetail.name}
              width={40}
              height={40}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="text-base font-semibold text-foreground">
              {cpDetail?.name}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {nestedMenus.map(renderMenu)}
        </nav>

        {/* Search */}
        <div className="hidden flex-1 items-center justify-center md:flex max-w-xs">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative" ref={searchContainerRef}>
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="h-8 pl-9 pr-3 text-sm bg-muted/40 border-transparent focus:border-border focus:bg-background"
              />
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link href={templateUrl("/profile")}>
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-8 w-8 md:flex"
            >
              <User className="h-4 w-4" />
            </Button>
          </Link>

          {/* Cart */}
          <Sheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <ShoppingCart className="h-4 w-4" />
                {hasItems && (
                  <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-full max-w-sm flex-col gap-4 p-6 sm:max-w-md"
            >
              <SheetHeader className="text-left">
                <SheetTitle className="text-base font-semibold">
                  Cart
                  {hasItems && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({totalItems})
                    </span>
                  )}
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  {!hasItems && "Your cart is empty."}
                </SheetDescription>
              </SheetHeader>

              {hasItems ? (
                <ScrollArea className="flex-1 -mx-1 px-1">
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 rounded-lg border border-border p-3"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-snug line-clamp-2">
                              {item.name}
                            </p>
                            <span className="shrink-0 text-sm font-semibold text-primary">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  void updateQuantity(
                                    item.id,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={item.quantity <= 1 || isSyncing}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-5 text-center text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  void updateQuantity(
                                    item.id,
                                    item.quantity + 1,
                                  )
                                }
                                disabled={isSyncing}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => void removeFromCart(item.id)}
                              disabled={isSyncing}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                  Add products to get started.
                </div>
              )}

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={!hasItems || isSyncing}
                    asChild
                  >
                    <Link
                      href={templateUrl("/checkout")}
                      onClick={() => setIsCartSheetOpen(false)}
                    >
                      Checkout
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!hasItems || isSyncing}
                    onClick={() => void clearCart()}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-base font-semibold">
                  {cpDetail?.name}
                </SheetTitle>
                <SheetDescription />
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {nestedMenus.map((menu) => (
                  <div key={menu._id}>
                    <MenuLink
                      href={templateUrl(menu.url || "")}
                      openInNewTab={menu.openInNewTab}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {menu.label}
                    </MenuLink>
                    {menu.children.length > 0 && (
                      <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-border pl-3">
                        {menu.children.map((child) => (
                          <MenuLink
                            key={child._id}
                            href={templateUrl(child.url || "")}
                            openInNewTab={(child as any).openInNewTab}
                            className="block rounded-md px-3 py-1.5 text-sm text-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
                          >
                            {child.label}
                          </MenuLink>
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
    {showSearchResults && dropdownRect && typeof document !== "undefined" &&
      createPortal(
        <div
          style={{
            position: "fixed",
            top: dropdownRect.top,
            left: dropdownRect.left,
            width: dropdownRect.width,
            zIndex: 9999,
          }}
          className="rounded-lg border border-border bg-background shadow-lg"
        >
          {shouldQueryProducts ? (
            searchLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching…
              </div>
            ) : searchResults.length ? (
              <ul>
                {searchResults.map((item: any) => (
                  <li key={item._id} className="border-b border-border last:border-0">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleProductSelect(item._id)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.attachment?.url && (
                          <Image
                            src={item.attachment?.url || ""}
                            alt={item.name || ""}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        {item.category?.name && (
                          <p className="truncate text-xs text-muted-foreground">
                            {item.category.name}
                          </p>
                        )}
                      </div>
                      {Number.isFinite(item.unitPrice) && (
                        <span className="shrink-0 text-sm font-semibold text-primary">
                          {formatCurrency(item.unitPrice)}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSearchSubmit()}
                    className="flex w-full items-center justify-center py-2.5 text-sm font-medium text-primary hover:bg-muted transition-colors"
                  >
                    View all results →
                  </button>
                </li>
              </ul>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            )
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search.
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}

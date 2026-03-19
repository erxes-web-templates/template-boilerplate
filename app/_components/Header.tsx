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
      kind: "main",
    },
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

    return nestedMenus;
  };
  const nestedMenus = organizeMenus(menus);

  const renderMenu = (menu: MenuItem & { children: MenuItem[] }) => (
    <div key={menu._id} className="relative group z-10">
      <Link
        href={templateUrl(menu.url || "")}
        className="relative text-sm font-medium text-foreground/80 transition-all duration-300 hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-primary/60 after:transition-all after:duration-300 hover:after:w-full"
      >
        {menu.label}
      </Link>
      {menu.children.length > 0 && (
        <div className="absolute hidden group-hover:block bg-white/95 backdrop-blur-md shadow-lg rounded-lg border border-border/50 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1 p-3 min-w-[180px]">
            {menu.children.map((child: any) => (
              <Link
                key={child._id}
                href={templateUrl(child.url || "")}
                className="block px-3 py-2 text-sm font-medium text-foreground/70 rounded-md transition-all duration-200 hover:text-primary hover:bg-primary/5"
              >
                {child.label}
              </Link>
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
    () => searchData?.cpPoscProducts ?? [],
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link
            href={templateUrl("/")}
            className="text-xl font-bold transition-transform duration-300 hover:scale-105"
          >
            {cpDetail.logo ? (
              <div className="relative">
                <Image
                  src={getFileUrl(cpDetail.logo)}
                  alt={cpDetail.name}
                  width={50}
                  height={50}
                  className="transition-all duration-300 hover:brightness-110"
                />
              </div>
            ) : (
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {cpDetail.name}
              </span>
            )}
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {nestedMenus.map(renderMenu)}
          </nav>
        </div>

        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <form onSubmit={handleSearchSubmit} className="w-full max-w-md">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
              <Input
                type="search"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Search products..."
                className="w-full pl-10 bg-muted/30 border-border/50 transition-all duration-300 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
              {showSearchResults && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-border/50 bg-gradient-to-b from-white to-white/95 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  {shouldQueryProducts ? (
                    searchLoading ? (
                      <div className="p-6 text-sm text-muted-foreground text-center">
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                        Searching products...
                      </div>
                    ) : searchResults.length ? (
                      <ul className="divide-y divide-border/30">
                        {searchResults.map((item: any) => (
                          <li key={item._id} className="group/item">
                            <button
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => handleProductSelect(item._id)}
                              className="flex w-full items-center justify-between gap-3 p-4 text-left transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10"
                            >
                              <div className="flex justify-start items-center">
                                <div className="relative overflow-hidden rounded-lg mr-3 transition-transform duration-300 group-hover/item:scale-105">
                                  <Image
                                    src={
                                      item.attachment.url || "/placeholder.png"
                                    }
                                    alt={item.name || "Product image"}
                                    width={50}
                                    height={50}
                                    className="rounded"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-foreground transition-colors duration-200 group-hover/item:text-primary">
                                    {item.name || "Untitled product"}
                                  </span>
                                  {item.category?.name && (
                                    <span className="text-xs text-muted-foreground mt-0.5">
                                      {item.category.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {Number.isFinite(item.unitPrice) && (
                                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
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
                            className="flex w-full items-center justify-center p-4 text-sm font-medium text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-200"
                          >
                            View all results →
                          </button>
                        </li>
                      </ul>
                    ) : (
                      <div className="p-6 text-sm text-muted-foreground text-center">
                        No products found.
                      </div>
                    )
                  ) : (
                    <div className="p-6 text-sm text-muted-foreground text-center">
                      Type at least 2 characters to search.
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Link href={templateUrl("/profile")}>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex transition-all duration-300 hover:bg-primary/10 hover:scale-105"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>

          <Sheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative transition-all duration-300 hover:bg-primary/10 hover:scale-105"
              >
                <ShoppingCart className="h-5 w-5" />
                {hasItems && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs bg-gradient-to-r from-primary to-primary/70 border-0 animate-in zoom-in duration-300">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-full max-w-sm flex-col gap-4 p-6 sm:max-w-md bg-gradient-to-b from-background to-background/95"
            >
              <div className="flex items-start justify-between">
                <SheetHeader className="space-y-1 text-left">
                  <SheetTitle className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Your cart
                  </SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground">
                    {hasItems
                      ? `${totalItems} item${
                          totalItems === 1 ? "" : "s"
                        } ready to checkout.`
                      : "You have no items in your cart yet."}
                  </SheetDescription>
                </SheetHeader>
                {hasItems && (
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/5"
                  >
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
                          className="flex gap-3 rounded-xl border border-border/50 bg-gradient-to-br from-card/50 to-card/30 p-3 transition-all duration-300 hover:shadow-md hover:border-primary/30"
                        >
                          <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted transition-transform duration-300 hover:scale-105">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium leading-tight">
                                {item.name}
                              </p>
                              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                {formatCurrency(lineTotal)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Qty: {item.quantity} ·{" "}
                              {formatCurrency(item.unitPrice)} each
                            </p>
                            {item.categoryName && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Category: {item.categoryName}
                              </p>
                            )}
                            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 transition-all duration-200 hover:bg-primary/10 hover:border-primary/50"
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
                                <span className="text-sm font-medium min-w-[20px] text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 transition-all duration-200 hover:bg-primary/10 hover:border-primary/50"
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
                                  className="transition-all duration-200 hover:bg-primary/10"
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
                                  className="h-8 w-8 text-destructive transition-all duration-200 hover:bg-destructive/10"
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
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 p-6 text-center text-sm text-muted-foreground">
                  Add products to your cart to see them here.
                </div>
              )}
              <div className="space-y-4 border-t border-border/50 pt-4 bg-gradient-to-b from-transparent to-muted/20 -mx-6 px-6 pb-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-base font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90 transition-all duration-300 hover:shadow-lg hover:scale-105"
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
                    className="flex-1 transition-all duration-300 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
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
                className="md:hidden transition-all duration-300 hover:bg-primary/10 hover:scale-105"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-gradient-to-b from-background to-background/95"
            >
              <nav className="flex flex-col gap-4 mt-8">
                {nestedMenus.map((menu) => (
                  <div key={menu._id} className="flex flex-col">
                    <Link
                      href={templateUrl(menu.url || "")}
                      className="text-sm font-medium text-foreground/80 transition-all duration-300 hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/5"
                    >
                      {menu.label}
                    </Link>
                    {menu.children.length > 0 && (
                      <div className="mt-2 ml-4 flex flex-col gap-1 pl-3 border-l-2 border-border/30">
                        {menu.children.map((child) => (
                          <Link
                            key={child._id}
                            href={templateUrl(child.url || "")}
                            className="text-sm font-medium text-foreground/70 transition-all duration-300 hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/5"
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
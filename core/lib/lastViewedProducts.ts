const LAST_VIEWED_STORAGE_KEY = "wb:lastViewedProducts";
const MAX_LOCAL_LAST_VIEWED = 20;

export const getLocalLastViewedProducts = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LAST_VIEWED_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );
  } catch (error) {
    console.warn("Failed to read last viewed products from storage", error);
    return [];
  }
};

export const saveLocalLastViewedProducts = (items: string[]) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!items.length) {
    window.localStorage.removeItem(LAST_VIEWED_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(LAST_VIEWED_STORAGE_KEY, JSON.stringify(items));
};

export const rememberLastViewedProduct = (productId: string) => {
  if (!productId) {
    return;
  }

  const current = getLocalLastViewedProducts().filter((id) => id !== productId);
  current.push(productId);

  saveLocalLastViewedProducts(current.slice(-MAX_LOCAL_LAST_VIEWED));
};

export const clearLocalLastViewedProducts = () => {
  saveLocalLastViewedProducts([]);
};

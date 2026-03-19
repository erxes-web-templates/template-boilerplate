"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useMutation, useQuery } from "@apollo/client";
import authQueries from "../graphql/auth/queries";
import orderQueries from "../graphql/order/queries";
import orderMutations from "../graphql/order/mutations";

export interface CartProduct {
  id: string;
  name: string;
  unitPrice: number;
  description?: string | null;
  imageUrl?: string | null;
  categoryName?: string | null;
}

export interface CartItem extends CartProduct {
  quantity: number;
  orderItemId?: string;
}

export interface CartContextType {
  orderId: string | null;
  items: CartItem[];
  addToCart: (product: CartProduct, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isSyncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const ORDER_SALE_STATUS = "cart";
const ORDER_TYPE = "delivery";
const ORDER_ORIGIN = "kiosk";

const sanitizeQuantity = (value?: number) => {
  if (!value || Number.isNaN(value) || value < 1) {
    return 1;
  }
  return Math.floor(value);
};

const LOCAL_CART_STORAGE_KEY = "ecommerce-cart-items";

const readLocalCart = (): CartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(LOCAL_CART_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry: any): CartItem | null => {
        if (!entry || typeof entry !== "object") {
          return null;
        }
        if (typeof entry.id !== "string" || entry.id.length === 0) {
          return null;
        }

        const quantity = sanitizeQuantity(entry.quantity);
        const unitPrice =
          typeof entry.unitPrice === "number"
            ? entry.unitPrice
            : Number(entry.unitPrice) || 0;

        const description =
          typeof entry.description === "string"
            ? entry.description
            : entry.description == null
            ? null
            : undefined;

        const categoryName =
          typeof entry.categoryName === "string"
            ? entry.categoryName
            : entry.categoryName == null
            ? null
            : undefined;

        return {
          id: entry.id,
          name:
            typeof entry.name === "string" && entry.name.length > 0
              ? entry.name
              : "Untitled product",
          unitPrice,
          description,
          imageUrl:
            typeof entry.imageUrl === "string" ? entry.imageUrl : null,
          categoryName,
          quantity,
          orderItemId:
            typeof entry.orderItemId === "string"
              ? entry.orderItemId
              : undefined,
        };
      })
      .filter((item): item is CartItem => Boolean(item));
  } catch (error) {
    console.warn("Failed to read local cart", error);
    return [];
  }
};

const writeLocalCart = (cart: CartItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!cart.length) {
      window.localStorage.removeItem(LOCAL_CART_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      LOCAL_CART_STORAGE_KEY,
      JSON.stringify(cart)
    );
  } catch (error) {
    console.warn("Failed to save local cart", error);
  }
};

const clearLocalCart = () => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(LOCAL_CART_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear local cart", error);
  }
};

const mergeCartItems = (primary: CartItem[], secondary: CartItem[]) => {
  const map = new Map<string, CartItem>();

  primary.forEach((item) => {
    map.set(item.id, item);
  });

  secondary.forEach((item) => {
    const existing = map.get(item.id);
    if (existing) {
      map.set(item.id, {
        ...existing,
        quantity: sanitizeQuantity(existing.quantity + item.quantity),
        description: existing.description ?? item.description ?? null,
        imageUrl: existing.imageUrl ?? item.imageUrl ?? null,
        categoryName: existing.categoryName ?? item.categoryName ?? null,
      });
    } else {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const itemsRef = useRef<CartItem[]>([]);

  const ensureOrderItemIds = useCallback((cartItems: CartItem[]) => {
    return cartItems.map((item) => {
      if (item.orderItemId) {
        return item;
      }
      const generatedId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      return { ...item, orderItemId: generatedId };
    });
  }, []);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const { data: userData } = useQuery(authQueries.currentUser, {
    fetchPolicy: "cache-first",
  });
  const { data: configData } = useQuery(authQueries.currentConfig, {
    fetchPolicy: "cache-first",
  });

  const customerId =
    userData?.clientPortalCurrentUser?.erxesCustomerId ?? undefined;
  const branchId = configData?.currentConfig?.branchId ?? undefined;

  const { data: orderData, refetch: refetchOrder } = useQuery(
    orderQueries.currentOrder,
    {
      variables: {
        customerId,
        saleStatus: ORDER_SALE_STATUS,
        perPage: 1,
        sortField: "createdAt",
        sortDirection: -1,
        statuses: [],
      },
      skip: !customerId,
      fetchPolicy: "cache-and-network",
    }
  );

  const [createOrder] = useMutation(orderMutations.ordersAdd);
  const [editOrder] = useMutation(orderMutations.ordersEdit);
  const [cancelOrder] = useMutation(orderMutations.ordersCancel);

  const persistOrder = useCallback(
    async (cartItems: CartItem[]): Promise<boolean> => {
      if (!customerId) {
        return false;
      }

      const orderItems = cartItems
        .filter((item) => Boolean(item.orderItemId))
        .map((item) => ({
          _id: item.orderItemId as string,
          productId: item.id,
          count: item.quantity,
          unitPrice: item.unitPrice,
        }));

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.unitPrice * item.count,
        0
      );

      const baseVariables: Record<string, any> = {
        items: orderItems,
        totalAmount,
        type: ORDER_TYPE,
        origin: ORDER_ORIGIN,
        saleStatus: ORDER_SALE_STATUS,
      };

      baseVariables.customerId = customerId;

      if (branchId) {
        baseVariables.branchId = branchId;
      }

      if (!orderId && orderItems.length === 0) {
        return true;
      }

      setIsSyncing(true);

      let success = true;

      try {
        if (!orderId && orderItems.length > 0) {
          const response = await createOrder({
            variables: baseVariables,
          });
          const newOrderId = response.data?.cpOrdersAdd?._id ?? null;
          if (newOrderId) {
            setOrderId(newOrderId);
          }
          await refetchOrder();
        } else if (orderId && orderItems.length > 0) {
          await editOrder({
            variables: {
              _id: orderId,
              ...baseVariables,
            },
          });
          await refetchOrder();
        } else if (orderId && orderItems.length === 0) {
          await cancelOrder({
            variables: { _id: orderId },
          });
          setOrderId(null);
          await refetchOrder();
        }
      } catch (error) {
        console.error("Failed to sync cart with server", error);
        success = false;
      } finally {
        setIsSyncing(false);
      }

      return success;
    },
    [
      branchId,
      cancelOrder,
      createOrder,
      customerId,
      editOrder,
      orderId,
      refetchOrder,
    ]
  );

  useEffect(() => {
    let cancelled = false;

    const setLocalCartAsState = () => {
      const localCart = ensureOrderItemIds(readLocalCart());
      itemsRef.current = localCart;
      setItems(localCart);
      writeLocalCart(localCart);
    };

    if (!customerId) {
      setOrderId(null);
      setLocalCartAsState();
      return () => {
        cancelled = true;
      };
    }

    if (!orderData) {
      return () => {
        cancelled = true;
      };
    }

    const syncOrder = async () => {
      const orders = Array.isArray(orderData.cpCurrentOrder)
        ? orderData.cpCurrentOrder
        : [];
      const current = orders[0] ?? null;
      const localCartRaw = ensureOrderItemIds(readLocalCart());

      if (!current) {
        setOrderId(null);
        if (!cancelled) {
          itemsRef.current = localCartRaw;
          setItems(localCartRaw);
        }

        if (localCartRaw.length > 0) {
          const synced = await persistOrder(localCartRaw);
          if (synced) {
            clearLocalCart();
          }
        }
        return;
      }

      setOrderId(current._id ?? null);

      const serverItems: CartItem[] = ensureOrderItemIds(
        (current.items ?? [])
          .map((item: any) => {
            if (!item?.productId) {
              return null;
            }
            return {
              id: item.productId,
              name: item.productName ?? "Untitled product",
              unitPrice:
                typeof item.unitPrice === "number" ? item.unitPrice : 0,
              description: item.description ?? null,
              imageUrl: item.productImgUrl ?? null,
              categoryName: null,
              quantity: sanitizeQuantity(item.count),
              orderItemId: item._id ?? undefined,
            };
          })
          .filter((entry: CartItem | null): entry is CartItem => Boolean(entry))
      );

      if (localCartRaw.length > 0) {
        const merged = ensureOrderItemIds(
          mergeCartItems(serverItems, localCartRaw)
        );
        if (!cancelled) {
          itemsRef.current = merged;
          setItems(merged);
        }
        const synced = await persistOrder(merged);
        if (synced) {
          clearLocalCart();
        }
      } else if (!cancelled) {
        itemsRef.current = serverItems;
        setItems(serverItems);
      }
    };

    void syncOrder();

    return () => {
      cancelled = true;
    };
  }, [customerId, orderData, ensureOrderItemIds, persistOrder]);

  const applyUpdate = useCallback(
    async (updater: (prev: CartItem[]) => CartItem[]) => {
      const nextItems = ensureOrderItemIds(updater(itemsRef.current));
      itemsRef.current = nextItems;
      setItems(nextItems);

      if (customerId) {
        const synced = await persistOrder(nextItems);
        if (!synced) {
          writeLocalCart(nextItems);
        } else {
          clearLocalCart();
        }
      } else {
        writeLocalCart(nextItems);
      }
    },
    [customerId, ensureOrderItemIds, persistOrder]
  );

  const addToCart = useCallback(
    async (product: CartProduct, quantity: number = 1) => {
      const productId = product.id;
      if (!productId) {
        return;
      }

      const normalizedQuantity = sanitizeQuantity(quantity);
      const normalizedPrice = Number.isFinite(product.unitPrice)
        ? Number(product.unitPrice)
        : 0;

      await applyUpdate((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === productId);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  ...product,
                  unitPrice: normalizedPrice,
                  quantity: item.quantity + normalizedQuantity,
                }
              : item
          );
        }

        return [
          ...prevItems,
          {
            ...product,
            unitPrice: normalizedPrice,
            quantity: normalizedQuantity,
          },
        ];
      });
    },
    [applyUpdate]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      await applyUpdate((prevItems) =>
        prevItems.filter((item) => item.id !== productId)
      );
    },
    [applyUpdate]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const nextQuantity = sanitizeQuantity(quantity);
      await applyUpdate((prevItems) => {
        if (nextQuantity <= 0) {
          return prevItems.filter((item) => item.id !== productId);
        }
        return prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: nextQuantity } : item
        );
      });
    },
    [applyUpdate]
  );

  const clearCart = useCallback(async () => {
    await applyUpdate(() => []);
  }, [applyUpdate]);

  const refetchCart = useCallback(async () => {
    if (!customerId) {
      return;
    }

    await refetchOrder();
  }, [customerId, refetchOrder]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        orderId,
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refetchCart,
        totalItems,
        totalPrice,
        isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Dish } from "@/lib/menu-campaigns";

export const CART_STORAGE_KEY = "bindays-diner-cart";

export type CartItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  tag?: string;
  quantity: number;
  source: string;
};

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  addItem: (dish: Dish, source: string, quantity?: number) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getSummary: () => string;
};

const CartContext = createContext<CartContextValue | null>(null);

function createCartItemId(dish: Dish, source: string) {
  return `${source}:${dish.name}:${dish.price}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parsePesoPrice(price: string) {
  const value = Number.parseFloat(price.replace(/[^0-9.]/g, ""));

  return Number.isFinite(value) ? value : 0;
}

function readStoredCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) {
      return [];
    }

    const parsed = JSON.parse(storedCart);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === CART_STORAGE_KEY) {
        setItems(readStoredCart());
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addItem = useCallback((dish: Dish, source: string, quantity = 1) => {
    const id = createCartItemId(dish, source);
    const safeQuantity = Math.max(1, quantity);

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          image: dish.image,
          tag: dish.tag,
          quantity: safeQuantity,
          source,
        },
      ];
    });
  }, []);

  const incrementItem = useCallback((id: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  const decrementItem = useCallback((id: string) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalQuantity = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + parsePesoPrice(item.price) * item.quantity,
        0,
      ),
    [items],
  );

  const getSummary = useCallback(() => {
    if (items.length === 0) {
      return "";
    }

    const lines = items.map(
      (item) => `${item.quantity}x ${item.name} (${item.price})`,
    );

    return `Selected meals:\n${lines.join("\n")}\nOrder subtotal: P${subtotal.toLocaleString("en-PH")}`;
  }, [items, subtotal]);

  const value = useMemo(
    () => ({
      items,
      totalQuantity,
      subtotal,
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
      getSummary,
    }),
    [
      addItem,
      clearCart,
      decrementItem,
      getSummary,
      incrementItem,
      items,
      removeItem,
      subtotal,
      totalQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}

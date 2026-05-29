'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem } from '@/lib/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (productId: string, quantity?: number, color?: string) => void;
  removeItem: (productId: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = 'banwell_cart';

// A cart line is identified by product + color, so two colors of the same
// mask are distinct lines. Non-mask items carry no color.
const sameLine = (i: CartItem, productId: string, color?: string) =>
  i.productId === productId && (i.color ?? '') === (color ?? '');

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((productId: string, quantity: number = 1, color?: string) => {
    setItems(prev => {
      const existing = prev.find(i => sameLine(i, productId, color));
      if (existing) {
        return prev.map(i =>
          sameLine(i, productId, color)
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      const item: CartItem = { productId, quantity };
      if (color) item.color = color;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string, color?: string) => {
    setItems(prev => prev.filter(i => !sameLine(i, productId, color)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeItem(productId, color);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        sameLine(i, productId, color) ? { ...i, quantity } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}

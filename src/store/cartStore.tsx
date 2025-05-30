import { createContext, useContext, createSignal, ParentProps } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Dress } from '../data/dresses';

export interface CartItem {
  id: number;
  dress: Dress;
  color: string;
  size: string;
  startDate: Date;
  endDate: Date;
  days: number;
  totalPrice: number;
}

interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextValue>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  getCartTotal: () => 0
});

export function CartProvider(props: ParentProps) {
  const [cartItems, setCartItems] = createStore<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems([...cartItems, { ...item, id: Date.now() }]);
  };

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getCartTotal }}>
      {props.children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
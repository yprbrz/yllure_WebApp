import { createSignal, Show, For } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { useCart } from '../store/cartStore';
import CartItem from '../components/ui/CartItem';

export default function Cart() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = createSignal(false);
  const [checkoutSuccess, setCheckoutSuccess] = createSignal(false);
  
  const handleCheckout = () => {
    setIsCheckingOut(true);
    
    // Simulate checkout process
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutSuccess(true);
      clearCart();
    }, 1500);
  };
  
  return (
    <div class="bg-ivory py-12 min-h-screen">
      <div class="container mx-auto px-4">
        <Show
          when={!checkoutSuccess()}
          fallback={
            <div class="max-w-2xl mx-auto text-center py-12">
              <div class="bg-champagne-gold text-taupe w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 class="font-cormorant text-3xl font-semibold text-charcoal mb-4">
                Thank You for Your Order!
              </h1>
              <p class="text-gray-600 mb-8">
                Your rental order has been placed successfully. You will receive an email confirmation shortly.
              </p>
              <A href="/" class="btn-primary">
                Continue Shopping
              </A>
            </div>
          }
        >
          <h1 class="font-cormorant text-3xl font-semibold text-charcoal text-center mb-4">
            Your Cart
          </h1>
          
          <Show
            when={cartItems.length > 0}
            fallback={
              <div class="text-center py-12">
                <div class="bg-greige text-charcoal w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <h2 class="text-xl text-charcoal mb-4">Your cart is empty</h2>
                <p class="text-gray-600 mb-8">
                  Browse our collection to find the perfect dress for your occasion.
                </p>
                <A href="/catalog" class="btn-primary">
                  Browse Collection
                </A>
              </div>
            }
          >
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div class="lg:col-span-2">
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <For each={cartItems}>
                    {(item) => <CartItem item={item} />}
                  </For>
                </div>
              </div>
              
              <div class="lg:col-span-1">
                <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h3 class="font-cormorant text-xl font-semibold text-charcoal mb-4">
                    Order Summary
                  </h3>
                  
                  <div class="space-y-3 mb-6">
                    <div class="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div class="flex justify-between text-gray-600">
                      <span>Insurance</span>
                      <span>Included</span>
                    </div>
                    <div class="border-t border-greige my-3 pt-3 flex justify-between font-semibold text-charcoal">
                      <span>Total</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut()}
                    class="w-full btn-primary py-3 flex justify-center items-center"
                  >
                    <Show
                      when={!isCheckingOut()}
                      fallback={
                        <>
                          <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      }
                    >
                      Proceed to Checkout
                    </Show>
                  </button>
                  
                  <p class="text-center text-sm text-gray-500 mt-4">
                    Secure checkout powered by Stripe
                  </p>
                  
                  <div class="mt-6 bg-champagne-gold bg-opacity-10 p-4 rounded text-sm text-gray-600">
                    <p class="mb-2">
                      <span class="font-medium">Need It by a Specific Date?</span> We'll make sure your dress arrives at least 2 days before your event.
                    </p>
                    <p>
                      <span class="font-medium">Free Return Shipping</span> included with prepaid label. No cleaning needed!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
}
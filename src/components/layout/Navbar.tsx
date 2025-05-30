import { createSignal, Show } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { useCart } from '../../store/cartStore';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const location = useLocation();
  const { cartItems } = useCart();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen());
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header class="bg-ivory sticky top-0 z-50 shadow-sm transition-all duration-300">
      <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
        <A href="/" class="flex items-center">
          <span class="text-2xl md:text-3xl font-cormorant font-bold text-taupe">Yllure</span>
        </A>

        {/* Mobile menu button */}
        <button 
          class="md:hidden text-taupe"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d={isMenuOpen() ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"} />
          </svg>
        </button>

        {/* Desktop navigation */}
        <div class="hidden md:flex items-center space-x-8">
          <A 
            href="/" 
            class={`text-charcoal hover:text-taupe transition-colors ${location.pathname === '/' ? 'font-medium border-b-2 border-taupe' : ''}`}
          >
            Home
          </A>
          <A 
            href="/catalog" 
            class={`text-charcoal hover:text-taupe transition-colors ${location.pathname === '/catalog' ? 'font-medium border-b-2 border-taupe' : ''}`}
          >
            Collection
          </A>
          <A 
            href="/notify" 
            class={`text-charcoal hover:text-taupe transition-colors ${location.pathname === '/notify' ? 'font-medium border-b-2 border-taupe' : ''}`}
          >
            Notify Me
          </A>
          <A 
            href="/cart" 
            class="relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-charcoal hover:text-taupe transition-colors">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <Show when={cartItems.length > 0}>
              <span class="absolute -top-2 -right-2 bg-taupe text-ivory text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartItems.length}
              </span>
            </Show>
          </A>
        </div>

        {/* Mobile menu */}
        <div 
          class={`fixed inset-0 bg-ivory bg-opacity-95 z-50 transition-transform duration-300 transform ${isMenuOpen() ? 'translate-x-0' : 'translate-x-full'} md:hidden`}
        >
          <div class="flex justify-end p-4">
            <button onClick={closeMenu} class="text-taupe">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex flex-col items-center space-y-8 pt-8">
            <A 
              href="/" 
              class={`text-xl text-charcoal hover:text-taupe ${location.pathname === '/' ? 'font-medium' : ''}`}
              onClick={closeMenu}
            >
              Home
            </A>
            <A 
              href="/catalog" 
              class={`text-xl text-charcoal hover:text-taupe ${location.pathname === '/catalog' ? 'font-medium' : ''}`}
              onClick={closeMenu}
            >
              Collection
            </A>
            <A 
              href="/notify" 
              class={`text-xl text-charcoal hover:text-taupe ${location.pathname === '/notify' ? 'font-medium' : ''}`}
              onClick={closeMenu}
            >
              Notify Me
            </A>
            <A 
              href="/cart" 
              class="text-xl text-charcoal hover:text-taupe flex items-center"
              onClick={closeMenu}
            >
              Cart
              <Show when={cartItems.length > 0}>
                <span class="ml-2 bg-taupe text-ivory text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              </Show>
            </A>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
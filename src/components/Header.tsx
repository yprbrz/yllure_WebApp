import { createSignal, createEffect, Show, onMount } from 'solid-js';
import { A, useLocation, createAsync } from '@solidjs/router';
import { getUser, logout } from '~/lib/auth/user';

const Header = () => {
  const [isScrolled, setIsScrolled] = createSignal(false);
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);
  const location = useLocation();
  const user = createAsync(() => getUser());

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen());

  onMount(() => {
    setMounted(true);
  });

  createEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  return (
    <header class={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled() ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div class="max-w-7xl mx-auto px-4 flex items-center">
        <A href="/" class="text-2xl font-bold text-gray-800">
          DressRental
        </A>

        <div class="flex-1 flex justify-end">
          <nav class="hidden md:block">
            <ul class="flex space-x-6">
              <li>
                <A href="/" class={`font-medium ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Home
                </A>
              </li>
              <li>
                <A href="/catalog" class={`font-medium ${location.pathname === '/catalog' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Collection
                </A>
              </li>
              {/* Only show wishlist when mounted and user is authenticated */}
              <Show when={mounted() && user()}>
                <li>
                  <A href="/wishlist" class={`font-medium ${location.pathname === '/wishlist' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'} transition-colors relative`}>
                    Wishlist
                  </A>
                </li>
              </Show>
            </ul>
          </nav>
          
          {/* Only show auth controls after mounting */}
          <Show when={mounted()}>
            <div class="hidden md:flex items-center ml-6">
              <Show 
                when={user()}
                fallback={
                  <div class="space-x-4">
                    <A href="/login" class="text-gray-600 hover:text-blue-600 transition-colors">
                      Sign In
                    </A>
                    <A href="/register" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      Sign Up
                    </A>
                  </div>
                }
              >
                <div class="flex items-center space-x-4">
                  <span class="text-gray-600">
                    Hello, {user()?.firstName || user()?.email}
                  </span>
                  <form method="post" action={logout}>
                    <button 
                      type="submit"
                      class="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </Show>
            </div>
          </Show>
        </div>

        {/* Mobile menu button */}
        <button 
          class="md:hidden text-gray-600 ml-4" 
          onClick={toggleMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={isMenuOpen() ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu - only show after mounting */}
      <Show when={mounted()}>
        <div class={`md:hidden fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out ${isMenuOpen() ? 'translate-x-0' : 'translate-x-full'}`}>
          <div class="px-4 py-4">
            <div class="flex justify-between items-center mb-8">
              <A href="/" class="text-2xl font-bold text-gray-800">
                DressRental
              </A>
              <button onClick={toggleMenu} class="text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul class="space-y-4">
              <li>
                <A href="/" class="block text-lg py-2 border-b border-gray-200" onClick={toggleMenu}>
                  Home
                </A>
              </li>
              <li>
                <A href="/catalog" class="block text-lg py-2 border-b border-gray-200" onClick={toggleMenu}>
                  Collection
                </A>
              </li>
              <Show when={user()}>
                <li>
                  <A href="/wishlist" class="block text-lg py-2 border-b border-gray-200" onClick={toggleMenu}>
                    Wishlist
                  </A>
                </li>
              </Show>
              <Show 
                when={user()}
                fallback={
                  <>
                    <li>
                      <A href="/login" class="block text-lg py-2 border-b border-gray-200" onClick={toggleMenu}>
                        Sign In
                      </A>
                    </li>
                    <li>
                      <A href="/register" class="block text-lg py-2 border-b border-gray-200" onClick={toggleMenu}>
                        Sign Up
                      </A>
                    </li>
                  </>
                }
              >
                <li>
                  <form method="post" action={logout}>
                    <button 
                      type="submit"
                      class="block text-lg py-2 border-b border-gray-200 w-full text-left"
                      onClick={toggleMenu}
                    >
                      Sign Out
                    </button>
                  </form>
                </li>
              </Show>
            </ul>
          </div>
        </div>
      </Show>
    </header>
  );
};

export default Header;
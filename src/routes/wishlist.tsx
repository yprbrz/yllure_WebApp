import { Show, For, onMount, createSignal } from 'solid-js';
import { A, createAsync, action, revalidate, redirect } from '@solidjs/router';
import DressCard from '~/components/DressCard';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { getUser } from '~/lib/auth/user';
import { getSession } from '~/lib/auth/session';
import { db } from '~/lib/db';

// Server function to get user's wishlist with dress details
async function getUserWishlist() {
  "use server";
  
  const session = await getSession();
  if (!session.data.email) {
    throw redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { email: session.data.email },
    include: {
      wishlist: {
        include: {
          items: {
            include: {
              dress: true
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  if (!user?.wishlist) {
    return {
      id: null,
      name: 'My Wishlist',
      items: []
    };
  }

  return {
    id: user.wishlist.id,
    name: user.wishlist.name,
    items: user.wishlist.items.map(item => item.dress)
  };
}

// Server action to remove item from wishlist
const removeFromWishlistAction = action(async (formData: FormData) => {
  "use server";
  
  const dressId = formData.get('dressId') as string;
  
  const session = await getSession();
  if (!session.data.email) {
    throw new Error('Authentication required');
  }

  const user = await db.user.findUnique({
    where: { email: session.data.email },
    include: { wishlist: true }
  });

  if (user?.wishlist) {
    await db.wishlistItem.deleteMany({
      where: {
        wishlistId: user.wishlist.id,
        dressId: dressId
      }
    });
  }

  revalidate();
  return { success: true, message: 'Removed from wishlist' };
}, 'removeFromWishlist');

// Server action to clear entire wishlist
const clearWishlistAction = action(async () => {
  "use server";
  
  const session = await getSession();
  if (!session.data.email) {
    throw new Error('Authentication required');
  }

  const user = await db.user.findUnique({
    where: { email: session.data.email },
    include: { wishlist: true }
  });

  if (user?.wishlist) {
    await db.wishlistItem.deleteMany({
      where: {
        wishlistId: user.wishlist.id
      }
    });
  }

  revalidate();
  return { success: true, message: 'Wishlist cleared' };
}, 'clearWishlist');

// Server action to add to wishlist (for consistency)
const addToWishlistAction = action(async (formData: FormData) => {
  "use server";
  
  const dressId = formData.get('dressId') as string;
  
  const session = await getSession();
  if (!session.data.email) {
    throw new Error('Authentication required');
  }

  const user = await db.user.findUnique({
    where: { email: session.data.email },
    include: { wishlist: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Create wishlist if doesn't exist
  let wishlistId = user.wishlist?.id;
  if (!wishlistId) {
    const newWishlist = await db.wishlist.create({
      data: {
        userId: user.id,
        name: 'My Wishlist'
      }
    });
    wishlistId = newWishlist.id;
  }

  // Check if item already exists
  const existingItem = await db.wishlistItem.findFirst({
    where: {
      wishlistId: wishlistId,
      dressId: dressId
    }
  });

  if (!existingItem) {
    await db.wishlistItem.create({
      data: {
        wishlistId: wishlistId,
        dressId: dressId
      }
    });
  }

  revalidate();
  return { success: true, message: 'Added to wishlist' };
}, 'addToWishlist');

const WishlistPage = () => {
  const [mounted, setMounted] = createSignal(false);
  
  // SSR-compatible data fetching
  const user = createAsync(() => getUser());
  const wishlist = createAsync(() => getUserWishlist());
  
  onMount(() => {
    setMounted(true);
  });

  const removeFromWishlist = async (dressId: string) => {
    const formData = new FormData();
    formData.append('dressId', dressId);
    
    try {
      await removeFromWishlistAction(formData);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item from wishlist. Please try again.');
    }
  };

  const clearWishlist = async () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await clearWishlistAction();
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        alert('Failed to clear wishlist. Please try again.');
      }
    }
  };

  const addToWishlist = async (dressId: string) => {
    const formData = new FormData();
    formData.append('dressId', dressId);
    
    try {
      await addToWishlistAction(formData);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add item to wishlist. Please try again.');
    }
  };

  const wishlistItems = () => wishlist()?.items || [];
  const wishlistCount = () => wishlistItems().length;
  const currentWishlistItems = () => wishlistItems().map(item => item.id);

  return (
    <div class="min-h-screen bg-gray-50">
      <Header />
      
      <main class="pt-20 pb-16">
        <div class="max-w-7xl mx-auto px-4">
          <h1 class="text-4xl font-bold text-center mb-4">
            My Wishlist
          </h1>
          <p class="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Keep track of your favorite dresses for future reference.
          </p>
          
          <Show
            when={wishlist() && wishlistCount() > 0}
            fallback={
              <Show 
                when={wishlist()}
                fallback={
                  <div class="flex justify-center py-16">
                    <div class="text-center">
                      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p class="text-gray-500 italic">Loading your wishlist...</p>
                    </div>
                  </div>
                }
              >
                <div class="text-center py-16 bg-white rounded-lg shadow-sm">
                  <div class="mb-6">
                    <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                  <p class="text-gray-600 mb-6">Start browsing our collection to add dresses you love!</p>
                  <A
                    href="/catalog"
                    class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Browse Collection
                  </A>
                </div>
              </Show>
            }
          >
            {/* Wishlist Header with Count and Clear Button */}
            <div class="flex justify-between items-center mb-8">
              <div>
                <p class="text-gray-600">
                  {wishlistCount()} {wishlistCount() === 1 ? 'dress' : 'dresses'} in your wishlist
                </p>
              </div>
              <div class="flex gap-4">
                {/* JavaScript-enhanced clear button */}
                <button
                  onClick={clearWishlist}
                  class="text-red-600 hover:text-red-700 transition-colors font-medium"
                >
                  Clear Wishlist
                </button>
                
                {/* No-JS fallback form */}
                <form method="post" action={clearWishlistAction} class="noscript-fallback">
                  <button
                    type="submit"
                    class="text-red-600 hover:text-red-700 transition-colors font-medium"
                    onClick={(e) => {
                      if (!confirm('Are you sure you want to clear your entire wishlist?')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Clear Wishlist
                  </button>
                </form>
              </div>
            </div>
            
            {/* Wishlist Grid */}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <For each={wishlistItems()}>
                {(dress) => (
                  <DressCard 
                    dress={dress}
                    onAddToWishlist={addToWishlist}
                    onRemoveFromWishlist={removeFromWishlist}
                    isInWishlist={true}
                    user={user()}
                    addAction={addToWishlistAction}
                    removeAction={removeFromWishlistAction}
                  />
                )}
              </For>
            </div>

            {/* Call to Action */}
            <div class="text-center mt-12 pt-8 border-t border-gray-200">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">
                Ready to rent?
              </h3>
              <p class="text-gray-600 mb-6">
                Contact us to check availability and schedule your rental.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:contact@dressrental.com" 
                  class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Contact Us
                </a>
                <A 
                  href="/catalog" 
                  class="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  Continue Browsing
                </A>
              </div>
            </div>
          </Show>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WishlistPage;
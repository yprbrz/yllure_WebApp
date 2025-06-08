import { createSignal, createEffect, For, Show, onMount } from 'solid-js';
import { action, useSubmissions } from "@solidjs/router";
import { A, redirect } from '@solidjs/router';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { getUser } from '~/lib/auth/user';
import { getSession } from '~/lib/auth/session';
import { db } from '~/lib/db';

// Server function to get user's wishlist with dress details
async function getUserWishlist() {
  "use server";
  
  const session = await getSession();
  if (!session?.data?.email) {
    throw redirect('/login');
  }

  console.log('🔍 SERVER: Getting wishlist for user:', session.data.email);

  const user = await db.user.findUnique({
    where: { email: session.data.email },
    include: {
      wishlist: {
        include: {
          items: {
            include: { dress: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  if (!user?.wishlist) {
    console.log('📝 SERVER: No wishlist found');
    return { id: null, name: 'My Wishlist', items: [] };
  }

  const result = {
    id: user.wishlist.id,
    name: user.wishlist.name,
    items: user.wishlist.items.map(item => item.dress)
  };

  console.log('📤 SERVER: Returning wishlist with', result.items.length, 'items');
  return result;
}

// Server functions for wishlist operations
async function removeFromWishlist(formData: FormData) {
  "use server";
  
  const dressId = formData.get('dressId');
  if (!dressId || typeof dressId !== 'string') {
    throw new Error('Dress ID required');
  }

  const session = await getSession();
  if (!session?.data?.email) throw new Error('Authentication required');

  try {
    const user = await db.user.findUnique({
      where: { email: session.data.email },
      include: { wishlist: true }
    });

    if (!user?.wishlist) throw new Error('Wishlist not found');

    // Find and delete the wishlist item
    const wishlistItem = await db.wishlistItem.findFirst({
      where: {
        wishlistId: user.wishlist.id,
        dressId: dressId
      }
    });

    if (!wishlistItem) throw new Error('Item not found in wishlist');

    await db.wishlistItem.delete({
      where: { id: wishlistItem.id }
    });

    console.log('✅ Wishlist: Successfully removed from wishlist:', dressId);
    return { success: true, message: 'Removed from wishlist' };
    
  } catch (error) {
    console.error('❌ Wishlist: Error removing from wishlist:', error);
    throw error;
  }
}

async function clearWishlist(formData: FormData) {
  "use server";
  
  const session = await getSession();
  if (!session?.data?.email) throw new Error('Authentication required');

  try {
    const user = await db.user.findUnique({
      where: { email: session.data.email },
      include: {
        wishlist: {
          include: { items: true }
        }
      }
    });

    if (!user?.wishlist) throw new Error('Wishlist not found');

    // Delete all wishlist items
    await db.wishlistItem.deleteMany({
      where: {
        wishlistId: user.wishlist.id
      }
    });

    console.log('✅ Wishlist: Successfully cleared wishlist');
    return { success: true, message: 'Wishlist cleared' };
    
  } catch (error) {
    console.error('❌ Wishlist: Error clearing wishlist:', error);
    throw error;
  }
}

// Create actions from server functions
const removeFromWishlistAction = action(removeFromWishlist);
const clearWishlistAction = action(clearWishlist);

const WishlistPage = () => {
  // Manual signals for all data
  const [user, setUser] = createSignal<any>(null);
  const [wishlist, setWishlist] = createSignal<any>({ id: null, name: 'My Wishlist', items: [] });
  const [isLoading, setIsLoading] = createSignal(true);
  
  // Submissions for optimistic updates
  const removingFromWishlist = useSubmissions(removeFromWishlistAction);
  const clearingWishlist = useSubmissions(clearWishlistAction);

  // Load initial data
  onMount(async () => {
    try {
      const [userData, wishlistData] = await Promise.all([
        getUser(),
        getUserWishlist()
      ]);
      
      setUser(userData);
      setWishlist(wishlistData);
      setIsLoading(false);
      
      console.log('🚀 Wishlist: Initial data loaded:', {
        user: userData?.email,
        wishlistItems: wishlistData.items.length
      });
    } catch (error) {
      console.error('❌ Wishlist: Error loading data:', error);
      setIsLoading(false);
    }
  });

  // Reload wishlist data after successful submissions
  createEffect(() => {
    const completedRemovals = removingFromWishlist.filter(sub => sub.result && !sub.pending);
    const completedClears = clearingWishlist.filter(sub => sub.result && !sub.pending);
    
    if (completedRemovals.length > 0 || completedClears.length > 0) {
      console.log('🔄 Wishlist: Detected completed submissions, refreshing...');
      
      // Refresh wishlist data
      getUserWishlist().then(data => {
        setWishlist(data);
        console.log('✅ Wishlist: Data refreshed:', data.items.length, 'items');
      }).catch(console.error);
    }
  });

  // Filtered wishlist with optimistic updates
  const currentWishlistItems = () => {
    const serverItems = wishlist().items || [];
    
    // Remove optimistically removed items
    const optimisticallyRemoved = removingFromWishlist
      .filter(sub => sub.pending)
      .map(sub => {
        const dressId = sub.input[0].get('dressId');
        return typeof dressId === 'string' ? dressId : '';
      })
      .filter(id => id !== '');
    
    // If clearing, show empty list
    const isClearing = clearingWishlist.some(sub => sub.pending);
    if (isClearing) return [];
    
    // Filter out removed items
    const result = serverItems.filter((item: any) => !optimisticallyRemoved.includes(item.id));
    
    console.log('🔄 Wishlist calculation:', {
      server: serverItems.length,
      removing: optimisticallyRemoved,
      clearing: isClearing,
      final: result.length
    });
    
    return result;
  };

  const wishlistCount = () => currentWishlistItems().length;

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
          
          {/* Debug Panel */}
          <Show when={false}>
            <div class="mb-4 p-4 bg-green-50 rounded text-sm">
              <h3 class="font-bold mb-2">🔧 Fixed Wishlist Debug</h3>
              <p>User: {user()?.email || 'Not logged in'}</p>
              <p>Server Wishlist ID: {wishlist().id || 'None'}</p>
              <p>Server Items: {wishlist().items?.length || 0}</p>
              <p>Current Items: {wishlistCount()}</p>
              <p>Removing Submissions: {removingFromWishlist.length} (pending: {removingFromWishlist.filter(s => s.pending).length})</p>
              <p>Clearing Submissions: {clearingWishlist.length} (pending: {clearingWishlist.filter(s => s.pending).length})</p>
              <p>Loading: {isLoading() ? 'YES' : 'NO'}</p>
              <p>Item Names: {currentWishlistItems().map((item: any) => item.name).join(', ')}</p>
            </div>
          </Show>
          
          <div class="wishlist-container">
            {/* Loading State */}
            <Show when={isLoading()}>
              <div class="flex justify-center py-16">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p class="text-gray-500 italic">Loading your wishlist...</p>
                </div>
              </div>
            </Show>

            {/* Empty State */}
            <Show when={!isLoading() && wishlistCount() === 0}>
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

            {/* Wishlist with Items */}
            <Show when={!isLoading() && wishlistCount() > 0}>
              {/* Wishlist Header */}
              <div class="flex justify-between items-center mb-8">
                <div>
                  <p class="text-gray-600">
                    {wishlistCount()} {wishlistCount() === 1 ? 'dress' : 'dresses'} in your wishlist
                  </p>
                </div>
                <div class="flex gap-4">
                  <form method="post" style="display: inline;">
                    <button 
                      formAction={clearWishlistAction}
                      disabled={clearingWishlist.some(sub => sub.pending)}
                      class="text-red-600 hover:text-red-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {clearingWishlist.some(sub => sub.pending) ? 'Clearing...' : 'Clear Wishlist'}
                    </button>
                  </form>
                </div>
              </div>
              
              {/* Wishlist Grid */}
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <For each={currentWishlistItems()}>
                  {(dress: any) => (
                    <div class="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div class="relative overflow-hidden rounded-t-lg bg-gray-100 aspect-[2/3]">
                        <img
                          src={dress.frontImage}
                          alt={dress.name}
                          class="w-full h-full object-cover object-center"
                          loading="lazy"
                        />
                        
                        {/* Remove button */}
                        <div class="absolute top-4 right-4">
                          <form method="post" style="display: inline;">
                            <input type="hidden" name="dressId" value={dress.id} />
                            <button 
                              formAction={removeFromWishlistAction}
                              class="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                              title="Remove from wishlist"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500 fill-red-500" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                          </form>
                        </div>
                        
                        {/* Unavailable overlay */}
                        <Show when={!dress.available}>
                          <div class="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div class="bg-black/80 text-white py-2 px-4 rotate-[-35deg] text-sm font-medium">
                              Unavailable
                            </div>
                          </div>
                        </Show>
                      </div>
                      
                      <div class="p-4">
                        <h3 class="font-medium text-gray-900 text-lg leading-tight mb-2">{dress.name}</h3>
                        <div class="flex justify-between items-center">
                          <div>
                            <p class="text-gray-900 font-semibold">${dress.price}</p>
                            <p class="text-gray-500 text-sm">Size: {dress.size}</p>
                          </div>
                          <Show when={dress.available}>
                            <A
                              href={`/dresses/${dress.id}`}
                              class="bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                            >
                              View Details
                            </A>
                          </Show>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>

              {/* Show pending removals */}
              <Show when={removingFromWishlist.some(sub => sub.pending)}>
                <div class="mt-4 p-4 bg-red-50 rounded">
                  <h4 class="font-bold text-red-800">Removing items...</h4>
                  <For each={removingFromWishlist.filter(sub => sub.pending)}>
                    {(sub) => (
                      <p class="text-red-700">
                        Dress {(() => {
                          const dressId = sub.input[0].get('dressId');
                          return typeof dressId === 'string' ? dressId : 'Unknown';
                        })()} (pending...)
                      </p>
                    )}
                  </For>
                </div>
              </Show>

              {/* Show clearing status */}
              <Show when={clearingWishlist.some(sub => sub.pending)}>
                <div class="mt-4 p-4 bg-yellow-50 rounded">
                  <h4 class="font-bold text-yellow-800">Clearing entire wishlist...</h4>
                  <p class="text-yellow-700">Please wait while we remove all items.</p>
                </div>
              </Show>

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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WishlistPage;
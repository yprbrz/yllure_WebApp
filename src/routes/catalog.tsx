import { createSignal, createEffect, For, Show, onMount } from 'solid-js';
import { action, useSubmissions } from "@solidjs/router";
import DressCard from '~/components/DressCard';
import FilterBar from '~/components/FilterBar';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { db } from '~/lib/db';
import { getUser } from '~/lib/auth/user';
import { getSession } from '~/lib/auth/session';

interface DressFilters {
  size?: string;
  available?: boolean;
}

// Server functions
async function getDresses(filters: DressFilters = {}) {
  "use server";
  
  const where: any = {};
  if (filters.size) where.size = filters.size;
  if (filters.available !== undefined) where.available = filters.available;

  return await db.dress.findMany({
    where,
    orderBy: [
      { available: 'desc' },
      { createdAt: 'desc' }
    ]
  });
}

async function getUserWishlistItems() {
  "use server";
  
  const session = await getSession();
  if (!session?.data?.email) return [];

  const user = await db.user.findUnique({
    where: { email: session.data.email },
    include: {
      wishlist: {
        include: { items: true }
      }
    }
  });

  return user?.wishlist?.items.map(item => item.dressId) || [];
}

// Server functions for wishlist operations
async function addToWishlist(formData: FormData) {
  "use server";
  
  const dressId = formData.get('dressId');
  if (!dressId || typeof dressId !== 'string') {
    throw new Error('Dress ID required');
  }

  const session = await getSession();
  if (!session?.data?.email) throw new Error('Authentication required');

  try {
    // Get or create wishlist
    const user = await db.user.findUnique({
      where: { email: session.data.email },
      include: { wishlist: true }
    });

    if (!user) throw new Error('User not found');

    let wishlist = user.wishlist;
    if (!wishlist) {
      wishlist = await db.wishlist.create({
        data: {
          name: 'My Wishlist',
          userId: user.id
        }
      });
    }

    // Check if item already exists
    const existingItem = await db.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        dressId: dressId
      }
    });

    if (existingItem) {
      console.log('Item already in wishlist');
      return { success: true, message: 'Item already in wishlist' };
    }

    // Add item to wishlist
    await db.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        dressId: dressId
      }
    });

    console.log('✅ Successfully added to wishlist:', dressId);
    return { success: true, message: 'Added to wishlist' };
    
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    throw error;
  }
}

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

    console.log('✅ Successfully removed from wishlist:', dressId);
    return { success: true, message: 'Removed from wishlist' };
    
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    throw error;
  }
}

// Create actions from server functions
const addToWishlistAction = action(addToWishlist);
const removeFromWishlistAction = action(removeFromWishlist);

const CatalogPage = () => {
  // Manual signals for all data
  const [filters, setFilters] = createSignal<DressFilters>({});
  const [user, setUser] = createSignal<any>(null);
  const [dresses, setDresses] = createSignal<any[]>([]);
  const [wishlistItems, setWishlistItems] = createSignal<string[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  
  // Submissions for optimistic updates
  const addingToWishlist = useSubmissions(addToWishlistAction);
  const removingFromWishlist = useSubmissions(removeFromWishlistAction);

  // Load initial data
  onMount(async () => {
    try {
      const [userData, dressData, wishlistData] = await Promise.all([
        getUser(),
        getDresses(filters()),
        getUserWishlistItems()
      ]);
      
      setUser(userData);
      setDresses(dressData);
      setWishlistItems(wishlistData);
      setIsLoading(false);
      
      console.log('🚀 Initial data loaded:', {
        user: userData?.email,
        dresses: dressData.length,
        wishlist: wishlistData
      });
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setIsLoading(false);
    }
  });

  // Reload wishlist data after successful submissions
  createEffect(() => {
    const completedAdditions = addingToWishlist.filter(sub => sub.result && !sub.pending);
    const completedRemovals = removingFromWishlist.filter(sub => sub.result && !sub.pending);
    
    if (completedAdditions.length > 0 || completedRemovals.length > 0) {
      console.log('🔄 Detected completed submissions, refreshing wishlist...');
      
      // Refresh wishlist data
      getUserWishlistItems().then(data => {
        setWishlistItems(data);
        console.log('✅ Wishlist refreshed:', data);
      }).catch(console.error);
    }
  });

  // Reload dresses when filters change
  createEffect(() => {
    const currentFilters = filters();
    getDresses(currentFilters).then(data => {
      setDresses(data);
      console.log('🔄 Dresses reloaded for filters:', currentFilters);
    }).catch(console.error);
  });

  const handleFilterChange = (newFilters: DressFilters) => {
    setFilters(newFilters);
  };

  // Compute current wishlist with optimistic updates
  const currentWishlistItems = () => {
    const serverItems = wishlistItems();
    
    // Add optimistically added items
    const optimisticallyAdded = addingToWishlist
      .filter(sub => sub.pending)
      .map(sub => {
        const dressId = sub.input[0].get('dressId');
        return typeof dressId === 'string' ? dressId : '';
      })
      .filter(id => id !== '');
    
    // Remove optimistically removed items
    const optimisticallyRemoved = removingFromWishlist
      .filter(sub => sub.pending)
      .map(sub => {
        const dressId = sub.input[0].get('dressId');
        return typeof dressId === 'string' ? dressId : '';
      })
      .filter(id => id !== '');
    
    // Combine server data with optimistic updates
    const combined = [...new Set([...serverItems, ...optimisticallyAdded])];
    const result = combined.filter(id => !optimisticallyRemoved.includes(id));
    
    console.log('🔄 Catalog wishlist calculation:', {
      server: serverItems,
      adding: optimisticallyAdded,
      removing: optimisticallyRemoved,
      final: result
    });
    
    return result;
  };

  const isInWishlist = (dressId: string) => currentWishlistItems().includes(dressId);

  return (
    <div class="min-h-screen bg-gray-50">
      <Header />
      
      <main class="pt-20 pb-16">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
              Our Collection
            </h1>
            <p class="text-gray-600 max-w-2xl mx-auto">
              Discover our curated selection of elegant dresses for every occasion. 
              Filter by size or availability to find your perfect dress.
            </p>
          </div>
          
          {/* Debug Panel */}
          <Show when={false}>
            <div class="mb-4 p-4 bg-green-50 rounded text-sm">
              <h3 class="font-bold mb-2">🔧 Fixed Reactive Debug</h3>
              <p>User: {user()?.email || 'Not logged in'}</p>
              <p>Dresses: {dresses()?.length || 0}</p>
              <p>Server Wishlist: {JSON.stringify(wishlistItems())}</p>
              <p>Current Wishlist: {JSON.stringify(currentWishlistItems())}</p>
              <p>Adding Submissions: {addingToWishlist.length} (pending: {addingToWishlist.filter(s => s.pending).length})</p>
              <p>Removing Submissions: {removingFromWishlist.length} (pending: {removingFromWishlist.filter(s => s.pending).length})</p>
              <p>Loading: {isLoading() ? 'YES' : 'NO'}</p>
            </div>
          </Show>
          
          <FilterBar 
            onFilterChange={handleFilterChange}
            totalCount={dresses()?.length}
          />
          
          <Show 
            when={!isLoading()}
            fallback={
              <div class="flex justify-center py-16">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p class="text-gray-500 italic">Loading dresses...</p>
                </div>
              </div>
            }
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <For each={dresses()}>
                {(dress) => (
                  <div class="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div class="relative overflow-hidden rounded-t-lg bg-gray-100 aspect-[2/3]">
                      <img
                        src={dress.frontImage}
                        alt={dress.name}
                        class="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                      
                      {/* Wishlist button with forms */}
                      <Show when={user()}>
                        <div class="absolute top-4 right-4">
                          <Show 
                            when={isInWishlist(dress.id)}
                            fallback={
                              <form method="post" style="display: inline;">
                                <input type="hidden" name="dressId" value={dress.id} />
                                <button 
                                  formAction={addToWishlistAction}
                                  class="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                  title="Add to wishlist"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                              </form>
                            }
                          >
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
                          </Show>
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
                          <a
                            href={`/dresses/${dress.id}`}
                            class="bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                          >
                            View Details
                          </a>
                        </Show>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CatalogPage;
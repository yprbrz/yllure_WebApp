import { createAsyncStore, useSubmissions } from "@solidjs/router";
import { createSignal, For, Show } from 'solid-js';
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

// Server functions - following teacher's pattern
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

// Create actions from server functions - teacher's pattern
import { action } from '@solidjs/router';

const addToWishlistAction = action(addToWishlist);
const removeFromWishlistAction = action(removeFromWishlist);

const CatalogPage = () => {
  // Signals for filters
  const [filters, setFilters] = createSignal<DressFilters>({});
  
  // Async stores - teacher's pattern with preload
  const user = createAsyncStore(() => getUser(), { initialValue: null });
  const dresses = createAsyncStore(() => getDresses(filters()), { initialValue: [] });
  const wishlistItems = createAsyncStore(() => getUserWishlistItems(), { initialValue: [] });
  
  // Submissions for optimistic updates - teacher's pattern
  const addingToWishlist = useSubmissions(addToWishlistAction);
  const removingFromWishlist = useSubmissions(removeFromWishlistAction);

  const handleFilterChange = (newFilters: DressFilters) => {
    setFilters(newFilters);
  };

  // Filtered wishlist with optimistic updates - teacher's pattern
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
    return combined.filter(id => !optimisticallyRemoved.includes(id));
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
          
          {/* Debug Panel - Teacher's Show pattern */}
          <Show when={true}>
            <div class="mb-4 p-4 bg-blue-50 rounded text-sm">
              <h3 class="font-bold mb-2">🚀 Modern SolidJS Debug (Teacher's Pattern)</h3>
              <p>User: {user()?.email || 'Not logged in'}</p>
              <p>Dresses: {dresses()?.length || 0}</p>
              <p>Server Wishlist: {JSON.stringify(wishlistItems())}</p>
              <p>Current Wishlist: {JSON.stringify(currentWishlistItems())}</p>
              <p>Adding Submissions: {addingToWishlist.length}</p>
              <p>Removing Submissions: {removingFromWishlist.length}</p>
            </div>
          </Show>
          
          <FilterBar 
            onFilterChange={handleFilterChange}
            totalCount={dresses()?.length}
          />
          
          {/* Dress Grid - Teacher's For pattern */}
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
                    
                    {/* Wishlist button with forms - Teacher's form action pattern */}
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

          {/* Show pending additions - Teacher's submissions pattern */}
          <Show when={addingToWishlist.length > 0}>
            <div class="mt-4 p-4 bg-green-50 rounded">
              <h4 class="font-bold text-green-800">Adding to wishlist:</h4>
              <For each={addingToWishlist}>
                {(sub) => (
                  <Show when={sub.pending}>
                    <p class="text-green-700">
                      Dress {(() => {
                        const dressId = sub.input[0].get('dressId');
                        return typeof dressId === 'string' ? dressId : 'Unknown';
                      })()} (pending...)
                    </p>
                  </Show>
                )}
              </For>
            </div>
          </Show>

          {/* Show pending removals - Teacher's submissions pattern */}
          <Show when={removingFromWishlist.length > 0}>
            <div class="mt-4 p-4 bg-red-50 rounded">
              <h4 class="font-bold text-red-800">Removing from wishlist:</h4>
              <For each={removingFromWishlist}>
                {(sub) => (
                  <Show when={sub.pending}>
                    <p class="text-red-700">
                      Dress {(() => {
                        const dressId = sub.input[0].get('dressId');
                        return typeof dressId === 'string' ? dressId : 'Unknown';
                      })()} (pending...)
                    </p>
                  </Show>
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
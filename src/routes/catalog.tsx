import { createSignal } from 'solid-js';
import { createAsync } from '@solidjs/router';
import { action, revalidate } from '@solidjs/router';
import DressGrid from '~/components/DressGrid';
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

// Server function to fetch dresses
async function getDresses(filters: DressFilters = {}) {
  "use server";
  
  const where: any = {};

  if (filters.size) {
    where.size = filters.size;
  }

  if (filters.available !== undefined) {
    where.available = filters.available;
  }

  const dresses = await db.dress.findMany({
    where,
    orderBy: [
      { available: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  return dresses;
}

// Server function to get user's wishlist items
async function getUserWishlistItems() {
  "use server";
  
  const session = await getSession();
  if (!session.data.email) {
    return [];
  }

  const user = await db.user.findUnique({
    where: { email: session.data.email },
    include: {
      wishlist: {
        include: {
          items: true
        }
      }
    }
  });

  return user?.wishlist?.items.map(item => item.dressId) || [];
}

// Server action to add to wishlist
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

  // Revalidate all data to refresh the UI
  revalidate();
  
  // Return the updated wishlist items for immediate UI update
  return await getUserWishlistItems();
}, 'addToWishlist');

// Server action to remove from wishlist
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

  // Revalidate all data to refresh the UI
  revalidate();
  
  // Return the updated wishlist items for immediate UI update
  return await getUserWishlistItems();
}, 'removeFromWishlist');

const CatalogPage = () => {
  const [filters, setFilters] = createSignal<DressFilters>({});
  const [optimisticWishlist, setOptimisticWishlist] = createSignal<string[]>([]);
  
  const user = createAsync(() => getUser());
  const dresses = createAsync(() => getDresses(filters()));
  const wishlistItems = createAsync(() => getUserWishlistItems());
  
  // Update optimistic wishlist when server data changes
  const actualWishlistItems = () => wishlistItems() || [];
  
  // Merge server data with optimistic updates
  const currentWishlistItems = () => {
    const actual = actualWishlistItems();
    const optimistic = optimisticWishlist();
    
    // Merge arrays and remove duplicates
    return [...new Set([...actual, ...optimistic])];
  };

  const handleFilterChange = (newFilters: DressFilters) => {
    setFilters(newFilters);
  };

  const addToWishlist = async (dressId: string) => {
    if (!user()) {
      alert('Please sign in to add items to your wishlist');
      return;
    }
    
    // Optimistic update
    setOptimisticWishlist(prev => [...prev, dressId]);
    
    // Create FormData for the action
    const formData = new FormData();
    formData.append('dressId', dressId);
    
    try {
      await addToWishlistAction(formData);
      // Clear optimistic update after success
      setOptimisticWishlist([]);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Remove optimistic update on error
      setOptimisticWishlist(prev => prev.filter(id => id !== dressId));
    }
  };

  const removeFromWishlist = async (dressId: string) => {
    // Optimistic update
    setOptimisticWishlist(prev => prev.filter(id => id !== dressId));
    
    // Create FormData for the action
    const formData = new FormData();
    formData.append('dressId', dressId);
    
    try {
      await removeFromWishlistAction(formData);
      // Clear optimistic update after success
      setOptimisticWishlist([]);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Restore item on error
      setOptimisticWishlist(prev => [...prev, dressId]);
    }
  };

  return (
    <div class="min-h-screen bg-gray-50">
      <Header />
      
      <main class="pt-20 pb-16">
        <div class="max-w-7xl mx-auto px-4">
          {/* Page Header */}
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
              Our Collection
            </h1>
            <p class="text-gray-600 max-w-2xl mx-auto">
              Discover our curated selection of elegant dresses for every occasion. 
              Filter by size or availability to find your perfect dress.
            </p>
          </div>
          
          {/* Filters */}
          <FilterBar 
            onFilterChange={handleFilterChange}
            totalCount={dresses()?.length}
          />
          
          {/* Dress Grid */}
          <DressGrid
            dresses={dresses() || []}
            isLoading={!dresses()}
            onAddToWishlist={addToWishlist}
            onRemoveFromWishlist={removeFromWishlist}
            wishlistItems={currentWishlistItems()}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CatalogPage;
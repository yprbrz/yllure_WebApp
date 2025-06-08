import { createAsyncStore, useSubmissions, action } from "@solidjs/router";
import { createSignal, onMount, Show, For } from 'solid-js';
import { A } from '@solidjs/router';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { getUser } from '~/lib/auth/user';
import { getSession } from '~/lib/auth/session';
import { db } from '~/lib/db';

// Server function to get available dresses
async function getAvailableDresses() {
  "use server";
  
  const dresses = await db.dress.findMany({
    where: {
      available: true
    },
    orderBy: [
      { createdAt: 'desc' }
    ],
    take: 6 // Limit for homepage
  });

  return dresses;
}

// Server function to get user's wishlist items
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

    console.log('✅ Homepage: Successfully added to wishlist:', dressId);
    return { success: true, message: 'Added to wishlist' };
    
  } catch (error) {
    console.error('❌ Homepage: Error adding to wishlist:', error);
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

    console.log('✅ Homepage: Successfully removed from wishlist:', dressId);
    return { success: true, message: 'Removed from wishlist' };
    
  } catch (error) {
    console.error('❌ Homepage: Error removing from wishlist:', error);
    throw error;
  }
}

// Create actions from server functions
const addToWishlistAction = action(addToWishlist);
const removeFromWishlistAction = action(removeFromWishlist);

const HomePage = () => {
  // Signals for UI state
  const [showSlogan, setShowSlogan] = createSignal(false);
  
  // Async stores - teacher's pattern
  const user = createAsyncStore(() => getUser(), { initialValue: null });
  const availableDresses = createAsyncStore(() => getAvailableDresses(), { initialValue: [] });
  const wishlistItems = createAsyncStore(() => getUserWishlistItems(), { initialValue: [] });
  
  // Submissions for optimistic updates - teacher's pattern
  const addingToWishlist = useSubmissions(addToWishlistAction);
  const removingFromWishlist = useSubmissions(removeFromWishlistAction);
  
  onMount(() => {
    setTimeout(() => setShowSlogan(true), 500);
  });

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
    <div class="min-h-screen">
      <Header />
      
      <div class="pt-16">
        {/* Hero Section */}
        <section class="relative h-[80vh] flex items-center">
          <div 
            class="absolute inset-0 z-0 bg-cover bg-center" 
            style={{
              'background-image': 'url(https://i.pinimg.com/736x/9b/06/0c/9b060cd33a6702c03c013273c2c102ba.jpg)',
              'filter': 'brightness(0.8)'
            }}
          />
          
          <div class="max-w-7xl mx-auto px-4 relative z-10 text-white">
            <h1 
              class={`text-5xl md:text-7xl font-bold mb-6 md:mb-8 transition-opacity duration-1000 ${showSlogan() ? 'opacity-100' : 'opacity-0'}`}
            >
              Elegance in Every Curve
            </h1>
            <p class="max-w-lg text-lg mb-8 md:mb-12">
              DressRental offers premium dress rentals for every occasion. 
              Experience luxury fashion without commitment.
            </p>
            <A href="/catalog" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Explore the Collection
            </A>
          </div>
        </section>
        
        {/* Available Dresses */}
        <section class="py-16 bg-white">
          <div class="max-w-7xl mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-bold text-center mb-6">
              Available Dresses
            </h2>
            <p class="text-gray-600 text-center max-w-2xl mx-auto mb-12">
              Discover our collection of beautiful dresses available for rent. 
              Perfect for any special occasion.
            </p>
            
            {/* Debug Panel */}
            <Show when={true}>
              <div class="mb-4 p-4 bg-blue-50 rounded text-sm">
                <h3 class="font-bold mb-2">🏠 Homepage Debug (Modern SolidJS)</h3>
                <p>User: {user()?.email || 'Not logged in'}</p>
                <p>Available Dresses: {availableDresses()?.length || 0}</p>
                <p>Server Wishlist: {JSON.stringify(wishlistItems())}</p>
                <p>Current Wishlist: {JSON.stringify(currentWishlistItems())}</p>
                <p>Adding Submissions: {addingToWishlist.length}</p>
                <p>Removing Submissions: {removingFromWishlist.length}</p>
              </div>
            </Show>
            
            {/* Dress Cards */}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <For each={availableDresses().slice(0, 3)}>
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
                      
                      {/* Sign in prompt for non-authenticated users */}
                      <Show when={!user()}>
                        <A 
                          href="/login"
                          class="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                          title="Sign in to add to wishlist"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </A>
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
            
            <div class="text-center mt-12">
              <A href="/catalog" class="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                View All Dresses
              </A>
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section class="py-16 bg-gray-50">
          <div class="max-w-7xl mx-auto px-4">
            <div class="flex flex-col md:flex-row items-center gap-12">
              <div class="w-full md:w-1/2">
                <h2 class="text-3xl md:text-4xl font-bold mb-6">
                  About DressRental
                </h2>
                <p class="text-gray-700 mb-4">
                  DressRental was founded with a simple mission: to provide elegant, 
                  high-quality dress rentals for every woman and every occasion.
                </p>
                <p class="text-gray-700 mb-4">
                  We believe that every woman deserves to feel beautiful and confident. 
                  Our curated collection features stunning pieces for every occasion, 
                  from formal events to casual gatherings.
                </p>
                <p class="text-gray-700 mb-8">
                  By offering rentals, we make luxury fashion accessible without the commitment 
                  of purchasing, while promoting sustainability in the fashion industry.
                </p>
                <A href="/catalog" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Explore Collection
                </A>
              </div>
              <div class="w-full md:w-1/2 rounded-lg overflow-hidden">
                <img 
                  src="https://i.pinimg.com/736x/36/9b/fa/369bfa83dc2af77c91c46a1b8db16ad9.jpg" 
                  alt="About DressRental" 
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section class="py-16 bg-yellow-50">
          <div class="max-w-7xl mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">
              What Our Customers Say
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="bg-white p-8 rounded-lg shadow-sm">
                <div class="text-yellow-500 text-4xl mb-4">"</div>
                <p class="text-gray-700 italic mb-6">
                  Finding elegant dresses has always been a challenge. 
                  DressRental made it easy and affordable. I felt absolutely beautiful at my friend's wedding!
                </p>
                <p class="font-medium">— Sophia T.</p>
              </div>
              
              <div class="bg-white p-8 rounded-lg shadow-sm">
                <div class="text-yellow-500 text-4xl mb-4">"</div>
                <p class="text-gray-700 italic mb-6">
                  The quality of these dresses is outstanding. I rented the Elegant Evening Gown 
                  for a charity gala and received compliments all night. Will definitely rent again!
                </p>
                <p class="font-medium">— Michelle K.</p>
              </div>
              
              <div class="bg-white p-8 rounded-lg shadow-sm">
                <div class="text-yellow-500 text-4xl mb-4">"</div>
                <p class="text-gray-700 italic mb-6">
                  I love that I can wear designer dresses without the designer price tag. 
                  The sizing is perfect, and the service is exceptional. My go-to for special events.
                </p>
                <p class="font-medium">— Amara J.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section class="py-20 bg-gray-800 text-white">
          <div class="max-w-7xl mx-auto px-4 text-center">
            <h2 class="text-3xl md:text-5xl font-bold mb-6">
              Ready to Find Your Perfect Dress?
            </h2>
            <p class="max-w-2xl mx-auto mb-10 text-gray-300">
              Browse our collection and discover the perfect dress for your next special occasion.
            </p>
            <div class="flex flex-col md:flex-row justify-center gap-4">
              <A href="/catalog" class="bg-white text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                View Collection
              </A>
              <A href="/wishlist" class="bg-transparent border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-gray-800 transition-colors">
                View Wishlist
              </A>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default HomePage;
import { createSignal, onMount, Show, For } from 'solid-js';
import { A, createAsync, action, revalidate } from '@solidjs/router';
import DressCard from '~/components/DressCard';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { getUser } from '~/lib/auth/user';
import { getSession } from '~/lib/auth/session';
import { db } from '~/lib/db';

// Server function to get available dresses - ADD THIS FOR SSR
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
  
  return await getUserWishlistItems();
}, 'removeFromWishlist');

const HomePage = () => {
  const [showSlogan, setShowSlogan] = createSignal(false);
  
  // SSR-compatible data fetching - FIXED
  const user = createAsync(() => getUser());
  const availableDresses = createAsync(() => getAvailableDresses());
  const wishlistItems = createAsync(() => getUserWishlistItems());
  
  // Current wishlist items for UI
  const currentWishlistItems = () => wishlistItems() || [];
  
  onMount(() => {
    // Only animations in onMount - NO DATA FETCHING
    setTimeout(() => setShowSlogan(true), 500);
  });

  const addToWishlist = async (dressId: string) => {
    if (!user()) {
      alert('Please sign in to add items to your wishlist');
      return;
    }
    
    const formData = new FormData();
    formData.append('dressId', dressId);
    
    try {
      await addToWishlistAction(formData);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add item to wishlist. Please try again.');
    }
  };

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
            
            {/* Available Dresses with Suspense */}
            <Show 
              when={availableDresses()}
              fallback={
                <div class="flex justify-center py-16">
                  <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-gray-500 italic">Loading collection...</p>
                  </div>
                </div>
              }
            >
              <Show
                when={availableDresses() && availableDresses()!.length > 0}
                fallback={
                  <div class="text-center py-16">
                    <p class="text-gray-500">No dresses available at the moment.</p>
                    <A href="/catalog" class="text-blue-600 hover:text-blue-700 underline mt-2 block">
                      Browse all dresses
                    </A>
                  </div>
                }
              >
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <For each={availableDresses()!.slice(0, 3)}>
                    {(dress) => (
                      <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                        <div class="relative">
                          <img src={dress.frontImage} alt={dress.name} class="w-full h-64 object-cover" />
                          
                          {/* Wishlist Heart Button with Form Fallback */}
                          <Show when={user()}>
                            <div class="absolute top-3 right-3">
                              {/* JavaScript-enhanced button */}
                              <button
                                onClick={() => {
                                  const isInWishlist = currentWishlistItems().includes(dress.id);
                                  if (isInWishlist) {
                                    removeFromWishlist(dress.id);
                                  } else {
                                    addToWishlist(dress.id);
                                  }
                                }}
                                class={`p-2 rounded-full transition-colors ${
                                  currentWishlistItems().includes(dress.id)
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-white text-gray-400 hover:text-red-500 hover:bg-gray-50'
                                }`}
                                title={currentWishlistItems().includes(dress.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill={currentWishlistItems().includes(dress.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                              
                              {/* Fallback forms for no-JS (hidden but functional) */}
                              <Show when={!currentWishlistItems().includes(dress.id)}>
                                <form method="post" action={addToWishlistAction} class="hidden">
                                  <input type="hidden" name="dressId" value={dress.id} />
                                  <button type="submit" class="sr-only">Add to Wishlist</button>
                                </form>
                              </Show>
                              <Show when={currentWishlistItems().includes(dress.id)}>
                                <form method="post" action={removeFromWishlistAction} class="hidden">
                                  <input type="hidden" name="dressId" value={dress.id} />
                                  <button type="submit" class="sr-only">Remove from Wishlist</button>
                                </form>
                              </Show>
                            </div>
                          </Show>
                        </div>
                        
                        <div class="p-4">
                          <h3 class="text-lg font-semibold text-gray-900">{dress.name}</h3>
                          <p class="text-gray-600 mt-1">${dress.price}</p>
                          <div class="mt-4 flex justify-between">
                            <A href={`/dresses/${dress.id}`} class="text-indigo-600 hover:text-indigo-800 font-medium">
                              View Details
                            </A>
                            <Show when={!user()}>
                              <A href="/login" class="text-red-500 hover:text-red-700">
                                ♡ Sign in to save
                              </A>
                            </Show>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </Show>
            
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
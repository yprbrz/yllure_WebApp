import { createSignal, Show } from 'solid-js';
import { A } from '@solidjs/router';
import type { Size } from '@prisma/client';

export interface DressProps {
  id: string;
  name: string;
  price: number;
  size: Size;
  available: boolean;
  frontImage: string;
  backImage: string;
  featured?: boolean;
}

interface DressCardProps {
  dress: DressProps;
  onAddToWishlist?: (dressId: string) => void;
  onRemoveFromWishlist?: (dressId: string) => void;
  isInWishlist?: boolean;
  user?: any; // User object for authentication check
  addAction?: any; // Server action for adding to wishlist (no-JS fallback)
  removeAction?: any; // Server action for removing from wishlist (no-JS fallback)
}

const DressCard = (props: DressCardProps) => {
  const [showBackImage, setShowBackImage] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  
  // Safety check - return early if dress data is not available
  if (!props.dress) {
    return (
      <div class="bg-gray-200 rounded-lg animate-pulse">
        <div class="aspect-[2/3] bg-gray-300 rounded-t-lg"></div>
        <div class="p-4 space-y-2">
          <div class="h-4 bg-gray-300 rounded w-3/4"></div>
          <div class="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  const toggleImage = () => {
    setShowBackImage(!showBackImage());
  };
  
  const toggleWishlist = async () => {
    if (isLoading()) return;
    
    if (!props.user) {
      alert('Please sign in to add items to your wishlist');
      return;
    }
    
    setIsLoading(true);
    try {
      if (props.isInWishlist) {
        props.onRemoveFromWishlist?.(props.dress.id);
      } else {
        props.onAddToWishlist?.(props.dress.id);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(props.dress.price || 0);
  
  return (
    <div class="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <div class="relative overflow-hidden rounded-t-lg bg-gray-100 aspect-[2/3]">
        <img
          src={showBackImage() ? props.dress.backImage : props.dress.frontImage}
          alt={props.dress.name}
          class="w-full h-full object-cover object-center transition-all duration-300"
          loading="lazy"
        />
        
        {/* Hover overlay with controls */}
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
          {/* Toggle image button */}
          <button
            onClick={toggleImage}
            class="absolute bottom-4 right-4 bg-white/90 text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
            aria-label="Toggle image view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {/* Wishlist button - Enhanced JavaScript version */}
          <Show when={props.user}>
            <button
              onClick={toggleWishlist}
              disabled={isLoading()}
              class="absolute top-4 right-4 p-2 transition-all duration-300"
              aria-label={props.isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class={`h-6 w-6 transition-colors duration-300 ${
                  props.isInWishlist 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-white group-hover:text-red-500 drop-shadow-sm'
                } ${isLoading() ? 'opacity-50' : ''}`}
                fill={props.isInWishlist ? "currentColor" : "none"}
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
            </button>
          </Show>
          
          {/* No-JavaScript fallback forms */}
          <Show when={props.user && props.addAction && props.removeAction}>
            <div class="absolute top-4 right-4">
              {/* Form to add to wishlist (shown when NOT in wishlist) */}
              <Show when={!props.isInWishlist}>
                <form method="post" action={props.addAction} class="noscript-fallback">
                  <input type="hidden" name="dressId" value={props.dress.id} />
                  <button 
                    type="submit"
                    class="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    title="Add to wishlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </form>
              </Show>
              
              {/* Form to remove from wishlist (shown when IN wishlist) */}
              <Show when={props.isInWishlist}>
                <form method="post" action={props.removeAction} class="noscript-fallback">
                  <input type="hidden" name="dressId" value={props.dress.id} />
                  <button 
                    type="submit"
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
          <Show when={!props.user}>
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
        
        {/* Unavailable overlay */}
        <Show when={!props.dress.available}>
          <div class="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div class="bg-black/80 text-white py-2 px-4 rotate-[-35deg] text-sm font-medium">
              Unavailable
            </div>
          </div>
        </Show>
      </div>
      
      {/* Card content */}
      <div class="p-4">
        <h3 class="font-medium text-gray-900 text-lg leading-tight mb-2">{props.dress.name}</h3>
        <div class="flex justify-between items-center">
          <div>
            <p class="text-gray-900 font-semibold">{formattedPrice}</p>
            <p class="text-gray-500 text-sm">Size: {props.dress.size}</p>
          </div>
          <Show when={props.dress.available}>
            <A
              href={`/dresses/${props.dress.id}`}
              class="bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              View Details
            </A>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default DressCard;
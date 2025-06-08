import { For, Show } from 'solid-js';
import DressCard, { type DressProps } from './DressCard';

interface DressGridProps {
  dresses: DressProps[];
  isLoading?: boolean;
  onAddToWishlist?: (dressId: string) => void;
  onRemoveFromWishlist?: (dressId: string) => void;
  wishlistItems?: string[]; // Array of dress IDs that are in wishlist
  user?: any; // User object for authentication check
  addAction?: any; // Server action for adding to wishlist (no-JS fallback)
  removeAction?: any; // Server action for removing from wishlist (no-JS fallback)
}

const DressGrid = (props: DressGridProps) => {
  return (
    <div class="w-full">
      <Show 
        when={!props.isLoading && props.dresses.length > 0}
        fallback={
          <Show 
            when={props.isLoading}
            fallback={
              <div class="text-center py-12">
                <p class="text-gray-500 text-lg">No dresses found</p>
                <p class="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
              </div>
            }
          >
            {/* Loading skeleton */}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <For each={Array(8)}>
                {() => (
                  <div class="animate-pulse">
                    <div class="bg-gray-200 aspect-[2/3] rounded-t-lg mb-4"></div>
                    <div class="space-y-2">
                      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        }
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <For each={props.dresses}>
            {(dress) => (
              <DressCard
                dress={dress}
                onAddToWishlist={props.onAddToWishlist}
                onRemoveFromWishlist={props.onRemoveFromWishlist}
                isInWishlist={props.wishlistItems?.includes(dress.id)}
                user={props.user}
                addAction={props.addAction}
                removeAction={props.removeAction}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default DressGrid;
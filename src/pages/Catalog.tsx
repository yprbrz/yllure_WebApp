import { createResource, createSignal, createEffect, For, Show } from 'solid-js';
import { getAllDresses } from '../data/dresses';
import DressCard from '../components/ui/DressCard';
import type { Dress } from '@prisma/client';

interface Filters {
  colors: string[];
  sizes: string[];
  availability: boolean;
  category: string;
}

export default function Catalog() {
  const [dresses] = createResource(getAllDresses);
  const [filteredDresses, setFilteredDresses] = createSignal<Dress[]>([]);
  const [filters, setFilters] = createSignal<Filters>({
    colors: [],
    sizes: [],
    availability: false,
    category: ''
  });
  
  // Apply filters
  createEffect(() => {
    if (!dresses()) return;
    
    let results = [...dresses()];
    const currentFilters = filters();
    
    if (currentFilters.colors.length > 0) {
      results = results.filter(dress => 
        dress.colors.split(',').some(color => currentFilters.colors.includes(color.trim()))
      );
    }
    
    if (currentFilters.sizes.length > 0) {
      results = results.filter(dress => 
        dress.sizes.split(',').some(size => currentFilters.sizes.includes(size.trim()))
      );
    }
    
    if (currentFilters.availability) {
      results = results.filter(dress => dress.available);
    }
    
    if (currentFilters.category) {
      results = results.filter(dress => dress.category === currentFilters.category);
    }
    
    setFilteredDresses(results);
  });
  
  // Aggregate all unique colors and sizes
  const allColors = () => {
    if (!dresses()) return [];
    const colorSet = new Set<string>();
    dresses().forEach(dress => {
      dress.colors.split(',').forEach(color => colorSet.add(color.trim()));
    });
    return Array.from(colorSet);
  };

  const allSizes = () => {
    if (!dresses()) return [];
    const sizeSet = new Set<string>();
    dresses().forEach(dress => {
      dress.sizes.split(',').forEach(size => sizeSet.add(size.trim()));
    });
    return Array.from(sizeSet).sort((a, b) => parseInt(a) - parseInt(b));
  };

  const allCategories = () => {
    if (!dresses()) return [];
    return [...new Set(dresses().map(dress => dress.category))];
  };
  
  // Toggle color filter
  const toggleColorFilter = (color: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };
  
  // Toggle size filter
  const toggleSizeFilter = (size: string) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };
  
  // Toggle availability filter
  const toggleAvailabilityFilter = () => {
    setFilters(prev => ({ ...prev, availability: !prev.availability }));
  };
  
  // Set category filter
  const setCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      colors: [],
      sizes: [],
      availability: false,
      category: ''
    });
  };
  
  return (
    <div class="bg-ivory min-h-screen py-12">
      <div class="container mx-auto px-4">
        <h1 class="font-cormorant text-4xl font-bold text-charcoal text-center mb-4">
          Our Collection
        </h1>
        <p class="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Discover our exclusive selection of plus-size dresses for every occasion.
        </p>
        
        <div class="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <div class="w-full lg:w-1/4 space-y-6">
            <div class="bg-white p-5 rounded-lg shadow-sm">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-cormorant text-xl font-semibold text-charcoal">Filters</h3>
                <button 
                  onClick={clearFilters}
                  class="text-sm text-taupe hover:underline"
                >
                  Clear All
                </button>
              </div>
              
              {/* Category filter */}
              <div class="mb-6">
                <h4 class="font-medium text-charcoal mb-3">Category</h4>
                <div class="space-y-2">
                  <div class="flex items-center">
                    <input
                      type="radio"
                      id="category-all"
                      name="category"
                      checked={filters().category === ''}
                      onChange={() => setCategoryFilter('')}
                      class="mr-2"
                    />
                    <label for="category-all" class="text-gray-700">All Categories</label>
                  </div>
                  <For each={allCategories()}>
                    {(category) => (
                      <div class="flex items-center">
                        <input
                          type="radio"
                          id={`category-${category}`}
                          name="category"
                          checked={filters().category === category}
                          onChange={() => setCategoryFilter(category)}
                          class="mr-2"
                        />
                        <label for={`category-${category}`} class="text-gray-700">{category}</label>
                      </div>
                    )}
                  </For>
                </div>
              </div>
              
              {/* Colors filter */}
              <div class="mb-6">
                <h4 class="font-medium text-charcoal mb-3">Colors</h4>
                <div class="flex flex-wrap gap-2">
                  <For each={allColors()}>
                    {(color) => (
                      <button
                        onClick={() => toggleColorFilter(color)}
                        class={`px-3 py-1 text-sm rounded-full transition-colors ${
                          filters().colors.includes(color)
                            ? 'bg-taupe text-ivory'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {color}
                      </button>
                    )}
                  </For>
                </div>
              </div>
              
              {/* Sizes filter */}
              <div class="mb-6">
                <h4 class="font-medium text-charcoal mb-3">Sizes</h4>
                <div class="flex flex-wrap gap-2">
                  <For each={allSizes()}>
                    {(size) => (
                      <button
                        onClick={() => toggleSizeFilter(size)}
                        class={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                          filters().sizes.includes(size)
                            ? 'bg-taupe text-ivory'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    )}
                  </For>
                </div>
              </div>
              
              {/* Availability filter */}
              <div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="availability"
                    checked={filters().availability}
                    onChange={toggleAvailabilityFilter}
                    class="mr-2"
                  />
                  <label for="availability" class="text-gray-700">Available Now</label>
                </div>
              </div>
            </div>
            
            <div class="bg-champagne-gold bg-opacity-10 p-5 rounded-lg">
              <h3 class="font-cormorant text-xl font-semibold text-charcoal mb-3">Need Help?</h3>
              <p class="text-gray-700 text-sm mb-4">
                Not sure what size or style would suit you best? Our stylists are here to help.
              </p>
              <a 
                href="mailto:styling@yllure.com" 
                class="text-taupe hover:underline text-sm"
              >
                Contact a Stylist →
              </a>
            </div>
          </div>
          
          {/* Dresses grid */}
          <div class="w-full lg:w-3/4">
            <Show 
              when={!dresses.loading} 
              fallback={
                <div class="flex justify-center">
                  <div class="w-16 h-16 border-4 border-taupe border-t-transparent rounded-full animate-spin"></div>
                </div>
              }
            >
              <Show 
                when={filteredDresses().length > 0} 
                fallback={
                  <div class="text-center py-12 text-gray-600">
                    No dresses match your selected filters. Try adjusting your criteria.
                  </div>
                }
              >
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <For each={filteredDresses()}>
                    {(dress) => <DressCard dress={dress} />}
                  </For>
                </div>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
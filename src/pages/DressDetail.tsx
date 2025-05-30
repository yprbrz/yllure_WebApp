import { createSignal, createEffect, Show, For } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { getDressById } from '../data/dresses';
import DateRangePicker from '../components/ui/DateRangePicker';
import { useCart } from '../store/cartStore';

export default function DressDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Dress data
  const dress = getDressById(parseInt(params.id));
  
  // State
  const [selectedColor, setSelectedColor] = createSignal(dress?.colors[0] || '');
  const [selectedSize, setSelectedSize] = createSignal(dress?.sizes[0] || '');
  const [mainImage, setMainImage] = createSignal(dress?.images[0] || '');
  const [startDate, setStartDate] = createSignal<Date>(new Date());
  const [endDate, setEndDate] = createSignal<Date>(new Date());
  const [rentalDays, setRentalDays] = createSignal(3);
  const [isZoomed, setIsZoomed] = createSignal(false);
  
  // Price calculation
  const price = () => {
    if (!dress) return 0;
    const basePrice = dress.salePrice || dress.price;
    return basePrice * rentalDays();
  };
  
  // Handle date change
  const handleDateChange = (start: Date, end: Date, days: number) => {
    setStartDate(start);
    setEndDate(end);
    setRentalDays(days);
  };
  
  // Add to cart
  const handleAddToCart = () => {
    if (!dress) return;
    
    addToCart({
      id: Date.now(),
      dress,
      color: selectedColor(),
      size: selectedSize(),
      startDate: startDate(),
      endDate: endDate(),
      days: rentalDays(),
      totalPrice: price()
    });
    
    navigate('/cart');
  };
  
  // Toggle image zoom
  const toggleZoom = () => {
    setIsZoomed(!isZoomed());
  };
  
  // If dress not found
  if (!dress) {
    return (
      <div class="container mx-auto px-4 py-16 text-center">
        <h1 class="font-cormorant text-3xl font-semibold text-charcoal mb-4">
          Dress Not Found
        </h1>
        <p class="text-gray-600 mb-8">
          The dress you're looking for could not be found.
        </p>
        <a href="/catalog" class="btn-primary">
          Browse Collection
        </a>
      </div>
    );
  }
  
  return (
    <div class="bg-ivory py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Section */}
          <div class="space-y-4">
            <div class="relative overflow-hidden bg-white rounded-lg shadow-sm">
              <div 
                class={`relative cursor-zoom-in transition-transform duration-500 ${
                  isZoomed() ? 'scale-150' : 'scale-100'
                }`}
                onClick={toggleZoom}
              >
                <img 
                  src={mainImage()} 
                  alt={dress.name}
                  class="w-full h-auto object-contain object-center"
                />
                <Show when={!dress.availability}>
                  <div class="absolute top-0 right-0 bg-charcoal text-ivory px-3 py-1 text-sm">
                    Unavailable
                  </div>
                </Show>
                <Show when={dress.salePrice}>
                  <div class="absolute top-0 left-0 bg-taupe text-ivory px-3 py-1 text-sm">
                    Sale
                  </div>
                </Show>
              </div>
              <div class="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
                <Show when={isZoomed()}>
                  Click to zoom out
                </Show>
                <Show when={!isZoomed()}>
                  Click to zoom in
                </Show>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <For each={dress.images}>
                {(image) => (
                  <button 
                    onClick={() => setMainImage(image)}
                    class={`w-16 h-16 rounded border-2 overflow-hidden ${
                      mainImage() === image ? 'border-taupe' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${dress.name} view`} 
                      class="w-full h-full object-cover object-center"
                    />
                  </button>
                )}
              </For>
            </div>
          </div>
          
          {/* Details Section */}
          <div class="space-y-6">
            <div>
              <h1 class="font-cormorant text-3xl font-semibold text-charcoal">
                {dress.name}
              </h1>
              <div class="mt-2">
                <Show when={dress.salePrice !== undefined} fallback={
                  <span class="text-xl font-semibold text-charcoal">${dress.price}/day</span>
                }>
                  <span class="text-xl font-semibold text-charcoal">${dress.salePrice}/day</span>
                  <span class="ml-2 text-gray-500 line-through">${dress.price}</span>
                </Show>
              </div>
            </div>
            
            <p class="text-gray-700">
              {dress.description}
            </p>
            
            <Show when={!dress.availability}>
              <div class="bg-red-50 border border-red-200 rounded p-4 text-red-800">
                This dress is currently unavailable for rental. You can join our notification list to be alerted when it becomes available.
              </div>
            </Show>
            
            <Show when={dress.availability}>
              {/* Color Selection */}
              <div>
                <h3 class="text-charcoal font-medium mb-2">Select Color</h3>
                <div class="flex flex-wrap gap-2">
                  <For each={dress.colors}>
                    {(color) => (
                      <button
                        onClick={() => setSelectedColor(color)}
                        class={`px-4 py-2 rounded-full transition-colors ${
                          selectedColor() === color
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
              
              {/* Size Selection */}
              <div>
                <h3 class="text-charcoal font-medium mb-2">Select Size</h3>
                <div class="flex flex-wrap gap-2">
                  <For each={dress.sizes}>
                    {(size) => (
                      <button
                        onClick={() => setSelectedSize(size)}
                        class={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${
                          selectedSize() === size
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
              
              {/* Date Range Picker */}
              <DateRangePicker onDateChange={handleDateChange} />
              
              {/* Price Summary */}
              <div class="bg-champagne-gold bg-opacity-20 p-4 rounded">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-charcoal">Total Rental Price:</span>
                  <span class="text-xl font-semibold text-charcoal">${price().toFixed(2)}</span>
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <button 
                onClick={handleAddToCart}
                class="w-full btn-primary py-3 text-center"
              >
                Add to Cart
              </button>
            </Show>
            
            {/* Size Guide and other details */}
            <div class="border-t border-greige pt-6 space-y-4">
              <div class="flex items-center text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                <span>Professional Cleaning Included</span>
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <span>Free Shipping Both Ways</span>
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <a href="#" class="text-taupe hover:underline">Size Guide</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
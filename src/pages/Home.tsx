import { A } from '@solidjs/router';
import { createSignal, onMount } from 'solid-js';
import { getFeaturedDresses, Dress } from '../data/dresses';
import DressCard from '../components/ui/DressCard';

export default function Home() {
  const [featuredDresses, setFeaturedDresses] = createSignal<Dress[]>([]);
  
  onMount(() => {
    setFeaturedDresses(getFeaturedDresses());
  });
  
  return (
    <div>
      {/* Hero Section */}
      <section class="relative bg-ivory min-h-[80vh] flex items-center">
        <div class="absolute inset-0 bg-charcoal opacity-10"></div>
        <div class="container mx-auto px-4 relative z-10">
          <div class="max-w-2xl">
            <h1 class="font-cormorant text-4xl md:text-6xl font-bold text-charcoal leading-tight">
              Elegance in Every Curve
            </h1>
            <p class="mt-4 text-lg text-charcoal opacity-90">
              Exclusive plus-size dress rentals for every occasion. Experience luxury without compromise.
            </p>
            <div class="mt-8 flex flex-wrap gap-4">
              <A href="/catalog" class="btn-primary">
                Explore Collection
              </A>
              <A href="/notify" class="btn-outlined">
                Get Notified
              </A>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Dresses */}
      <section class="py-16 bg-champagne-gold bg-opacity-10">
        <div class="container mx-auto px-4">
          <h2 class="font-cormorant text-3xl md:text-4xl font-semibold text-center text-charcoal mb-4">
            Featured Collection
          </h2>
          <p class="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            Discover our most coveted dresses, curated for your special occasions.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDresses().map(dress => (
              <DressCard dress={dress} />
            ))}
          </div>
          
          <div class="mt-12 text-center">
            <A href="/catalog" class="btn-primary">
              Explore the Collection
            </A>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section class="py-16 bg-ivory">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="font-cormorant text-3xl font-semibold text-charcoal mb-6">
                The Yllure Experience
              </h2>
              <p class="text-gray-700 mb-4">
                At Yllure, we believe that every woman deserves to feel beautiful, regardless of size. Our curated collection of designer dresses ranges from size 14 to 26, ensuring that you find the perfect fit for your special occasion.
              </p>
              <p class="text-gray-700 mb-6">
                Each dress is carefully selected for quality, style, and comfort, allowing you to celebrate your curves with confidence.
              </p>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-4 rounded shadow-sm">
                  <div class="font-cormorant text-2xl font-semibold text-taupe">20+</div>
                  <p class="text-sm text-gray-600">Designer Brands</p>
                </div>
                <div class="bg-white p-4 rounded shadow-sm">
                  <div class="font-cormorant text-2xl font-semibold text-taupe">100%</div>
                  <p class="text-sm text-gray-600">Satisfaction Guarantee</p>
                </div>
              </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="font-cormorant text-2xl font-semibold text-charcoal mb-4">
                How It Works
              </h3>
              <ol class="space-y-6">
                <li class="flex items-start">
                  <span class="bg-taupe text-ivory w-8 h-8 rounded-full flex items-center justify-center mr-4 shrink-0">1</span>
                  <div>
                    <h4 class="font-medium text-charcoal">Browse & Select</h4>
                    <p class="text-gray-600 text-sm mt-1">
                      Explore our collection and find dresses that speak to your style.
                    </p>
                  </div>
                </li>
                <li class="flex items-start">
                  <span class="bg-taupe text-ivory w-8 h-8 rounded-full flex items-center justify-center mr-4 shrink-0">2</span>
                  <div>
                    <h4 class="font-medium text-charcoal">Choose Your Dates</h4>
                    <p class="text-gray-600 text-sm mt-1">
                      Select rental dates that work with your event schedule.
                    </p>
                  </div>
                </li>
                <li class="flex items-start">
                  <span class="bg-taupe text-ivory w-8 h-8 rounded-full flex items-center justify-center mr-4 shrink-0">3</span>
                  <div>
                    <h4 class="font-medium text-charcoal">Wear & Enjoy</h4>
                    <p class="text-gray-600 text-sm mt-1">
                      Receive your dress, make a statement, and create memories.
                    </p>
                  </div>
                </li>
                <li class="flex items-start">
                  <span class="bg-taupe text-ivory w-8 h-8 rounded-full flex items-center justify-center mr-4 shrink-0">4</span>
                  <div>
                    <h4 class="font-medium text-charcoal">Easy Return</h4>
                    <p class="text-gray-600 text-sm mt-1">
                      Use our prepaid return label - no cleaning necessary!
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section class="py-16 bg-taupe text-ivory">
        <div class="container mx-auto px-4">
          <h2 class="font-cormorant text-3xl md:text-4xl font-semibold text-center mb-12">
            Customer Stories
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white bg-opacity-10 p-6 rounded">
              <div class="flex items-center mb-4">
                <div class="mr-4 w-12 h-12 bg-champagne-gold rounded-full flex items-center justify-center text-taupe font-cormorant text-xl">
                  J
                </div>
                <div>
                  <h4 class="font-medium">Jennifer L.</h4>
                  <p class="text-sm text-ivory text-opacity-80">Wedding Guest</p>
                </div>
              </div>
              <p class="italic text-ivory text-opacity-90">
                "Yllure helped me feel confident and beautiful at my best friend's wedding. The dress fit perfectly and I received so many compliments!"
              </p>
            </div>
            <div class="bg-white bg-opacity-10 p-6 rounded">
              <div class="flex items-center mb-4">
                <div class="mr-4 w-12 h-12 bg-champagne-gold rounded-full flex items-center justify-center text-taupe font-cormorant text-xl">
                  M
                </div>
                <div>
                  <h4 class="font-medium">Michelle K.</h4>
                  <p class="text-sm text-ivory text-opacity-80">Gala Attendee</p>
                </div>
              </div>
              <p class="italic text-ivory text-opacity-90">
                "Finding elegant evening wear in my size has always been a challenge until I discovered Yllure. The selection is amazing!"
              </p>
            </div>
            <div class="bg-white bg-opacity-10 p-6 rounded">
              <div class="flex items-center mb-4">
                <div class="mr-4 w-12 h-12 bg-champagne-gold rounded-full flex items-center justify-center text-taupe font-cormorant text-xl">
                  S
                </div>
                <div>
                  <h4 class="font-medium">Sarah T.</h4>
                  <p class="text-sm text-ivory text-opacity-80">Black Tie Event</p>
                </div>
              </div>
              <p class="italic text-ivory text-opacity-90">
                "The quality of Yllure's dresses exceeded my expectations. The rental process was seamless and the dress arrived in perfect condition."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section class="py-16 bg-ivory">
        <div class="container mx-auto px-4 text-center">
          <h2 class="font-cormorant text-3xl md:text-4xl font-semibold text-charcoal mb-4">
            Ready to Find Your Perfect Dress?
          </h2>
          <p class="text-gray-600 max-w-2xl mx-auto mb-8">
            Explore our collection and discover dresses that celebrate your curves.
          </p>
          <A href="/catalog" class="btn-primary text-lg px-8 py-3">
            Browse the Collection
          </A>
        </div>
      </section>
    </div>
  );
}
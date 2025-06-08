import { A } from "@solidjs/router";
import Header from "~/components/Header";
import Footer from "~/components/Footer";

export default function NotFound() {
  return (
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main class="flex-1 flex items-center justify-center px-4 py-16">
        <div class="text-center max-w-md mx-auto">
          {/* 404 Illustration */}
          <div class="mb-8">
            <svg 
              class="w-32 h-32 mx-auto text-gray-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="1.5" 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-4.5A8 8 0 118 12a8 8 0 01-8-8z" 
              />
            </svg>
          </div>
          
          {/* 404 Message */}
          <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p class="text-gray-600 mb-8">
            Oops! The dress you're looking for seems to have walked away. 
            Let's get you back to our beautiful collection.
          </p>
          
          {/* Action Buttons */}
          <div class="space-y-4">
            <A 
              href="/" 
              class="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </A>
            <A 
              href="/catalog" 
              class="block w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-medium border border-blue-200 hover:bg-blue-50 transition-colors"
            >
              Browse Dresses
            </A>
          </div>
          
          {/* Popular Links */}
          <div class="mt-12 pt-8 border-t border-gray-200">
            <p class="text-sm text-gray-500 mb-4">Popular pages:</p>
            <div class="flex flex-wrap justify-center gap-4 text-sm">
              <A href="/" class="text-blue-600 hover:underline">
                Home
              </A>
              <span class="text-gray-300">•</span>
              <A href="/catalog" class="text-blue-600 hover:underline">
                Collection
              </A>
              <span class="text-gray-300">•</span>
              <A href="/wishlist" class="text-blue-600 hover:underline">
                Wishlist
              </A>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
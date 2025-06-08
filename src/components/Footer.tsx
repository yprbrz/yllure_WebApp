import { A } from '@solidjs/router';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer class="bg-gray-900 text-gray-100 py-12">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-2xl font-bold mb-4">DressRental</h3>
            <p class="text-blue-400 mb-4">Elegance for Every Occasion</p>
            <p class="text-gray-400 text-sm">
              Discover beautiful dresses for rent. Perfect for special occasions, 
              events, and moments when you want to feel extraordinary.
            </p>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold mb-4">Quick Links</h3>
            <ul class="space-y-2">
              <li>
                <A href="/" class="text-gray-400 hover:text-blue-400 transition-colors">
                  Home
                </A>
              </li>
              <li>
                <A href="/catalog" class="text-gray-400 hover:text-blue-400 transition-colors">
                  Collection
                </A>
              </li>
              <li>
                <A href="/wishlist" class="text-gray-400 hover:text-blue-400 transition-colors">
                  Wishlist
                </A>
              </li>
              <li>
                <A href="/about" class="text-gray-400 hover:text-blue-400 transition-colors">
                  About Us
                </A>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold mb-4">Contact</h3>
            <ul class="space-y-2 text-gray-400">
              <li>Email: contact@dressrental.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>
                <a href="#" class="text-blue-400 hover:underline">
                  Subscribe to our newsletter
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} DressRental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
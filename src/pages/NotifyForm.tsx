import { createSignal } from 'solid-js';

export default function NotifyForm() {
  const [email, setEmail] = createSignal('');
  const [categories, setCategories] = createSignal<string[]>([]);
  const [sizes, setSizes] = createSignal<string[]>([]);
  const [formStatus, setFormStatus] = createSignal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = createSignal('');
  
  const allCategories = ['Evening', 'Cocktail', 'Casual', 'Business'];
  const allSizes = ['14', '16', '18', '20', '22', '24', '26'];
  
  const toggleCategory = (category: string) => {
    setCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const toggleSize = (size: string) => {
    setSizes(prev => 
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };
  
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    // Validate form
    if (!validateEmail(email())) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    if (categories().length === 0) {
      setErrorMessage('Please select at least one category');
      return;
    }
    
    if (sizes().length === 0) {
      setErrorMessage('Please select at least one size');
      return;
    }
    
    setFormStatus('submitting');
    setErrorMessage('');
    
    // In a real app, you would send this data to FormSubmit.co
    // For this demo, we'll simulate a successful submission
    setTimeout(() => {
      setFormStatus('success');
    }, 1500);
  };
  
  return (
    <div class="bg-ivory py-12 min-h-screen">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto">
          <h1 class="font-cormorant text-4xl font-semibold text-charcoal text-center mb-4">
            Stay Updated
          </h1>
          <p class="text-center text-gray-600 mb-8">
            Be the first to know when new dresses arrive or when your favorite styles become available.
          </p>
          
          {formStatus() === 'success' ? (
            <div class="bg-white p-8 rounded-lg shadow-md text-center">
              <div class="bg-champagne-gold text-taupe w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 class="font-cormorant text-2xl font-semibold text-charcoal mb-4">
                Thank You!
              </h2>
              <p class="text-gray-600 mb-8">
                You're now on our notification list. We'll update you when new dresses matching your preferences become available.
              </p>
              <a href="/" class="btn-primary">
                Return to Home
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} class="bg-white p-8 rounded-lg shadow-md">
              <div class="mb-6">
                <label for="email" class="block text-gray-700 font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  class="w-full px-4 py-2 border border-greige rounded focus:outline-none focus:ring-2 focus:ring-taupe"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div class="mb-6">
                <h3 class="text-gray-700 font-medium mb-2">Interested Categories</h3>
                <div class="flex flex-wrap gap-3">
                  {allCategories.map(category => (
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      class={`px-4 py-2 rounded-full transition-colors ${
                        categories().includes(category)
                          ? 'bg-taupe text-ivory'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div class="mb-8">
                <h3 class="text-gray-700 font-medium mb-2">Your Size Range</h3>
                <div class="flex flex-wrap gap-3">
                  {allSizes.map(size => (
                    <button
                      type="button"
                      onClick={() => toggleSize(size)}
                      class={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                        sizes().includes(size)
                          ? 'bg-taupe text-ivory'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {errorMessage() && (
                <div class="mb-6 bg-red-50 border border-red-200 text-red-800 rounded p-3 text-sm">
                  {errorMessage()}
                </div>
              )}
              
              <button
                type="submit"
                disabled={formStatus() === 'submitting'}
                class="w-full btn-primary py-3 flex justify-center items-center"
              >
                {formStatus() === 'submitting' ? (
                  <>
                    <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Get Notified'
                )}
              </button>
              
              <p class="text-center text-sm text-gray-500 mt-4">
                We respect your privacy and will only use your email for notifications.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
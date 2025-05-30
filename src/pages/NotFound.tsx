import { A } from '@solidjs/router';

export default function NotFound() {
  return (
    <div class="bg-ivory py-20 min-h-[70vh] flex items-center">
      <div class="container mx-auto px-4 text-center">
        <h1 class="font-cormorant text-6xl font-bold text-taupe mb-4">404</h1>
        <h2 class="font-cormorant text-3xl font-semibold text-charcoal mb-6">
          Page Not Found
        </h2>
        <p class="text-gray-600 max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <A href="/" class="btn-primary">
          Return to Home
        </A>
      </div>
    </div>
  );
}
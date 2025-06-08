import { A, useSubmission } from '@solidjs/router';
import { Show } from 'solid-js';
import { login } from '~/lib/auth/simple';
import Header from '~/components/Header';
import Footer from '~/components/Footer';

const LoginPage = () => {
  const logging = useSubmission(login);

  return (
    <div class="min-h-screen bg-gray-50">
      <Header />
      
      <main class="pt-20 pb-16">
        <div class="max-w-md mx-auto px-4">
          <div class="bg-white rounded-lg shadow-sm p-8">
            <h1 class="text-2xl font-bold text-center text-gray-900 mb-8">
              Sign In
            </h1>
            
            <Show when={logging.error}>
              <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p class="text-red-600 text-sm">{logging.error.message}</p>
              </div>
            </Show>
            
            <form method="post" action={login} class="space-y-6">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Enter your password"
                />
              </div>
              
              <button
                type="submit"
                disabled={logging.pending}
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {logging.pending ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            
            <div class="mt-6 text-center">
              <p class="text-gray-600">
                Don't have an account?{' '}
                <A href="/register" class="text-blue-600 hover:text-blue-700">
                  Sign up
                </A>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
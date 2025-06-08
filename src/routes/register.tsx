import { A, useSubmission } from '@solidjs/router';
import { Show } from 'solid-js';
import { register } from '~/lib/auth/simple';
import Header from '~/components/Header';
import Footer from '~/components/Footer';

const RegisterPage = () => {
  const registering = useSubmission(register);

  return (
    <div class="min-h-screen bg-gray-50">
      <Header />
      
      <main class="pt-20 pb-16">
        <div class="max-w-md mx-auto px-4">
          <div class="bg-white rounded-lg shadow-sm p-8">
            <h1 class="text-2xl font-bold text-center text-gray-900 mb-8">
              Create Account
            </h1>
            
            <Show when={registering.error}>
              <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p class="text-red-600 text-sm">{registering.error.message}</p>
              </div>
            </Show>
            
            <form method="post" action={register} class="space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="John"
                  />
                </div>
                
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
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
                  placeholder="john@example.com"
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
                  minlength="8"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Minimum 8 characters"
                />
              </div>
              
              <button
                type="submit"
                disabled={registering.pending}
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registering.pending ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div class="mt-6 text-center">
              <p class="text-gray-600">
                Already have an account?{' '}
                <A href="/login" class="text-blue-600 hover:text-blue-700">
                  Sign in
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

export default RegisterPage;
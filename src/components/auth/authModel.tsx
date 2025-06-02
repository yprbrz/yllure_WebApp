import { createSignal, Show } from 'solid-js';
import { useAuth } from '../../store/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal(props: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = createSignal(true);
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [name, setName] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin()) {
        await signIn(email(), password());
      } else {
        await signUp(email(), password(), name());
      }
      props.onClose();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!props.isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={props.onClose}>
      <div class="bg-white p-8 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 class="font-cormorant text-2xl font-semibold text-charcoal mb-6">
          {isLogin() ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} class="space-y-4">
          <Show when={!isLogin()}>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                class="w-full px-4 py-2 border border-greige rounded focus:outline-none focus:ring-2 focus:ring-taupe"
              />
            </div>
          </Show>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              class="w-full px-4 py-2 border border-greige rounded focus:outline-none focus:ring-2 focus:ring-taupe"
              required
              autocomplete="email"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              class="w-full px-4 py-2 border border-greige rounded focus:outline-none focus:ring-2 focus:ring-taupe"
              required
              autocomplete={isLogin() ? "current-password" : "new-password"}
              minLength={6}
            />
          </div>

          <Show when={error()}>
            <p class="text-red-600 text-sm">{error()}</p>
          </Show>

          <button
            type="submit"
            class="w-full btn-primary py-2"
            disabled={loading()}
          >
            {loading() ? (
              <span class="flex items-center justify-center">
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </span>
            ) : (
              isLogin() ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        <div class="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin())}
            class="text-taupe hover:underline"
          >
            {isLogin() ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>

        <button
          onClick={props.onClose}
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
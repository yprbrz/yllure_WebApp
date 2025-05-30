import { lazy, Component } from 'solid-js';
import { Routes, Route } from '@solidjs/router';
import Layout from './components/layout/Layout';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const DressDetail = lazy(() => import('./pages/DressDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const NotifyForm = lazy(() => import('./pages/NotifyForm'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Import cart store provider
import { CartProvider } from './store/cartStore';

const App: Component = () => {
  return (
    <CartProvider>
      <Layout>
        <Routes>
          <Route path="/" component={Home} />
          <Route path="/catalog" component={Catalog} />
          <Route path="/dress/:id" component={DressDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/notify" component={NotifyForm} />
          <Route path="*" component={NotFound} />
        </Routes>
      </Layout>
    </CartProvider>
  );
}

export default App;
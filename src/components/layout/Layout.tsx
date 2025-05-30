import { ParentProps, Suspense } from 'solid-js';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout(props: ParentProps) {
  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />
      <main class="flex-grow">
        <Suspense fallback={
          <div class="flex justify-center items-center h-[70vh]">
            <div class="w-16 h-16 border-4 border-taupe border-solid border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          {props.children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
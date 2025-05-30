import { CartItem as CartItemType, useCart } from '../../store/cartStore';
import { format } from 'date-fns';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem(props: CartItemProps) {
  const { removeFromCart } = useCart();
  const { item } = props;
  
  return (
    <div class="border-b border-greige py-6 flex flex-col md:flex-row">
      <div class="w-full md:w-1/4 mb-4 md:mb-0">
        <img 
          src={item.dress.images[0]} 
          alt={item.dress.name} 
          class="w-full h-48 object-cover object-center rounded"
        />
      </div>
      
      <div class="w-full md:w-3/4 md:pl-6 flex flex-col">
        <div class="flex justify-between">
          <h3 class="font-cormorant text-xl font-semibold text-charcoal">{item.dress.name}</h3>
          <button 
            onClick={() => removeFromCart(item.id)}
            class="text-gray-400 hover:text-taupe transition-colors"
            aria-label="Remove from cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span class="text-sm text-gray-500">Color:</span>
            <p class="text-charcoal">{item.color}</p>
          </div>
          <div>
            <span class="text-sm text-gray-500">Size:</span>
            <p class="text-charcoal">{item.size}</p>
          </div>
          <div>
            <span class="text-sm text-gray-500">Daily Rate:</span>
            <p class="text-charcoal">
              ${item.dress.salePrice || item.dress.price}
            </p>
          </div>
          <div>
            <span class="text-sm text-gray-500">Days:</span>
            <p class="text-charcoal">{item.days}</p>
          </div>
        </div>
        
        <div class="mt-4">
          <span class="text-sm text-gray-500">Rental Period:</span>
          <p class="text-charcoal">
            {format(item.startDate, 'MMM d, yyyy')} - {format(item.endDate, 'MMM d, yyyy')}
          </p>
        </div>
        
        <div class="mt-auto pt-4 flex justify-end">
          <span class="text-lg font-semibold text-charcoal">${item.totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
import { A } from '@solidjs/router';
import { Dress } from '../../data/dresses';
import { Show } from 'solid-js';

interface DressCardProps {
  dress: Dress;
}

export default function DressCard(props: DressCardProps) {
  const { dress } = props;
  
  return (
    <div class="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <div class="relative overflow-hidden">
        <A href={`/dress/${dress.id}`}>
          <img 
            src={dress.images[0]} 
            alt={dress.name} 
            class="w-full h-80 object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        </A>
        
        <Show when={!dress.availability}>
          <div class="absolute top-0 right-0 bg-charcoal text-ivory px-3 py-1 text-sm">
            Unavailable
          </div>
        </Show>
        
        <Show when={dress.salePrice}>
          <div class="absolute top-0 left-0 bg-taupe text-ivory px-3 py-1 text-sm">
            Sale
          </div>
        </Show>
      </div>
      
      <div class="p-4">
        <A href={`/dress/${dress.id}`}>
          <h3 class="font-cormorant text-xl font-semibold text-charcoal hover:text-taupe transition-colors">
            {dress.name}
          </h3>
        </A>
        
        <div class="flex mt-2 space-x-2">
          {dress.colors.slice(0, 3).map(color => (
            <div class="w-4 h-4 rounded-full border border-greige" title={color}></div>
          ))}
          <Show when={dress.colors.length > 3}>
            <div class="w-4 h-4 rounded-full border border-greige flex items-center justify-center text-xs">+</div>
          </Show>
        </div>
        
        <div class="mt-3 flex justify-between items-center">
          <div>
            <Show when={dress.salePrice !== undefined} fallback={
              <span class="font-semibold text-charcoal">${dress.price}/day</span>
            }>
              <span class="font-semibold text-charcoal">${dress.salePrice}/day</span>
              <span class="ml-2 text-sm text-gray-500 line-through">${dress.price}</span>
            </Show>
          </div>
          
          <A href={`/dress/${dress.id}`} class="btn-outlined py-1 px-4 text-sm">
            View
          </A>
        </div>
      </div>
    </div>
  );
}
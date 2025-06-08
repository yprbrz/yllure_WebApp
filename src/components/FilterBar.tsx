import { createSignal } from 'solid-js';
import type { Size } from '@prisma/client';

interface FilterBarProps {
  onFilterChange: (filters: {
    size?: Size;
    available?: boolean;
  }) => void;
  totalCount?: number;
}

const FilterBar = (props: FilterBarProps) => {
  const [selectedSize, setSelectedSize] = createSignal<Size | ''>('');
  const [availableOnly, setAvailableOnly] = createSignal(false);

  const sizes: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleFilterChange = () => {
    const filters: any = {};
    
    if (selectedSize()) filters.size = selectedSize();
    if (availableOnly()) filters.available = true;
    
    props.onFilterChange(filters);
  };

  const handleSizeChange = (size: Size | '') => {
    setSelectedSize(size);
    handleFilterChange();
  };

  const handleAvailableChange = (checked: boolean) => {
    setAvailableOnly(checked);
    handleFilterChange();
  };

  const clearFilters = () => {
    setSelectedSize('');
    setAvailableOnly(false);
    props.onFilterChange({});
  };

  const hasActiveFilters = () => {
    return selectedSize() || availableOnly();
  };

  return (
    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Size Filter */}
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Size:</label>
          <select
            value={selectedSize()}
            onChange={(e) => handleSizeChange(e.currentTarget.value as Size | '')}
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sizes</option>
            {sizes.map(size => (
              <option value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Available Only */}
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="available-filter"
            checked={availableOnly()}
            onChange={(e) => handleAvailableChange(e.currentTarget.checked)}
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label for="available-filter" class="text-sm font-medium text-gray-700 whitespace-nowrap">
            Available only
          </label>
        </div>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters()}
          class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Clear filters
        </button>
      </div>

      {/* Results count */}
      <div class="mt-3 pt-3 border-t border-gray-100">
        <p class="text-sm text-gray-600">
          {props.totalCount !== undefined ? `${props.totalCount} dresses found` : 'Loading...'}
        </p>
      </div>
    </div>
  );
};

export default FilterBar;
import { createSignal, createEffect, Show } from 'solid-js';
import { format, addDays, differenceInDays } from 'date-fns';

interface DateRangePickerProps {
  onDateChange: (startDate: Date, endDate: Date, days: number) => void;
}

export default function DateRangePicker(props: DateRangePickerProps) {
  const today = new Date();
  const [startDate, setStartDate] = createSignal<Date>(today);
  const [endDate, setEndDate] = createSignal<Date>(addDays(today, 3));
  const [days, setDays] = createSignal<number>(3);
  
  // Format dates for input fields
  const formattedStartDate = () => format(startDate(), 'yyyy-MM-dd');
  const formattedEndDate = () => format(endDate(), 'yyyy-MM-dd');
  
  // Set minimum end date to be at least the start date
  const minEndDate = () => format(startDate(), 'yyyy-MM-dd');
  
  // Update days whenever dates change
  createEffect(() => {
    const daysDiff = differenceInDays(endDate(), startDate());
    setDays(Math.max(1, daysDiff));
    props.onDateChange(startDate(), endDate(), days());
  });
  
  // Handle start date change
  const handleStartDateChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    const newStartDate = new Date(value);
    setStartDate(newStartDate);
    
    // If end date is before new start date, adjust it
    if (endDate() < newStartDate) {
      setEndDate(addDays(newStartDate, 1));
    }
  };
  
  // Handle end date change
  const handleEndDateChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    const newEndDate = new Date(value);
    setEndDate(newEndDate);
  };

  return (
    <div class="space-y-4">
      <h3 class="text-charcoal font-medium">Select Rental Period</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={formattedStartDate()}
            min={format(today, 'yyyy-MM-dd')}
            onChange={handleStartDateChange}
            class="w-full px-4 py-2 border border-greige rounded focus:outline-none focus:ring-1 focus:ring-taupe"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={formattedEndDate()}
            min={minEndDate()}
            onChange={handleEndDateChange}
            class="w-full px-4 py-2 border border-greige rounded focus:outline-none focus:ring-1 focus:ring-taupe"
          />
        </div>
      </div>
      
      <div class="bg-champagne-gold bg-opacity-10 p-4 rounded">
        <div class="flex justify-between items-center">
          <span class="text-charcoal">Rental Duration:</span>
          <span class="font-semibold text-charcoal">{days()} {days() === 1 ? 'day' : 'days'}</span>
        </div>
      </div>
    </div>
  );
}
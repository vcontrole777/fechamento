
import { useState, useEffect } from "react";
import { startOfDay, endOfDay, format, parse } from "date-fns";
import { DateFilterOption } from "@/components/common/DateFilter";

// Define the type for our shared date state
export interface SharedDateState {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  option: DateFilterOption;
}

// This hook provides shared date filter state across the app
export function useSharedDateFilter() {
  // Initialize state from localStorage or defaults
  const [state, setState] = useState<SharedDateState>(() => {
    const savedState = localStorage.getItem('sharedDateFilter');
    
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Convert string dates back to Date objects
        return {
          dateRange: {
            from: parsedState.dateRange.from ? new Date(parsedState.dateRange.from) : null,
            to: parsedState.dateRange.to ? new Date(parsedState.dateRange.to) : null,
          },
          option: parsedState.option as DateFilterOption
        };
      } catch (e) {
        console.error("Failed to parse saved date filter state:", e);
      }
    }
    
    // Default state if nothing in localStorage
    const today = new Date();
    return {
      dateRange: {
        from: startOfDay(today),
        to: endOfDay(today)
      },
      option: "today" as DateFilterOption
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('sharedDateFilter', JSON.stringify({
      dateRange: {
        from: state.dateRange.from ? state.dateRange.from.toISOString() : null,
        to: state.dateRange.to ? state.dateRange.to.toISOString() : null,
      },
      option: state.option
    }));
  }, [state]);

  // Update function that pages will call
  const updateSharedDateFilter = (dateRange: {from: Date | null, to: Date | null}, option: DateFilterOption) => {
    setState({
      dateRange: {
        from: dateRange.from ? startOfDay(dateRange.from) : null,
        to: dateRange.to ? endOfDay(dateRange.to) : null,
      },
      option
    });
  };

  return {
    dateRange: state.dateRange,
    selectedOption: state.option,
    updateSharedDateFilter
  };
}

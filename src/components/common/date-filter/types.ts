
import { Dispatch, SetStateAction } from "react";

export type DateFilterOption = 
  | "all"
  | "today" 
  | "yesterday" 
  | "last7days" 
  | "last15days" 
  | "last30days" 
  | "custom";

export type DateRange = { from: Date | null; to: Date | null };

export interface DateFilterProps {
  onFilterChange: (dateRange: DateRange, option: DateFilterOption) => void;
}

export interface CalendarPopoverProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  date: DateRange;
  setDate: Dispatch<SetStateAction<DateRange>>;
  selectedOption: DateFilterOption;
  setSelectedOption: Dispatch<SetStateAction<DateFilterOption>>;
  formatDateRange: () => string;
}

export interface DateFilterOptionsProps {
  selectedOption: DateFilterOption;
  handleOptionSelect: (option: DateFilterOption) => void;
}

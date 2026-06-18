// src/components/ui/ExplysDatePicker.tsx
import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";

// Импортируем типы из вашего проекта (проверьте путь!)
import type {
  DatePickerInputProps,
  DatePickerWrapperProps,
} from "../../types/date-picker-input";

// 1. Внутренний кастомный инпут для календаря
const CustomDateTimeInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  (props, ref) => {
    const { onClick, value, onChange, onKeyDown, id } = props;

    return (
      <div className="relative w-full">
        <input
          id={id}
          type="date"
          ref={ref}
          value={value || ""}
          onChange={onChange}
          onKeyDown={onKeyDown}
          // Блокируем всплытие событий, чтобы не конфликтовать с внешними кликами
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick(e as any);
          }}
          onFocus={(e) => e.stopPropagation()}
          autoComplete="off"
          className="flex h-12 w-full bg-background border border-input hover:border-primary/50 rounded-xl pl-4 pr-12 py-2 text-[15px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ring-offset-background transition-all cursor-pointer shadow-sm [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0"
        />
        <button
          type="button"
          onClick={onClick}
          tabIndex={-1}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
        >
          <CalendarIcon className="size-5" />
        </button>
      </div>
    );
  },
);

CustomDateTimeInput.displayName = "CustomDateTimeInput";

// 2. Главная обертка над react-datepicker, которую мы будем экспортировать
export function ExplysDatePicker({
  selected,
  onChange,
  id,
  onKeyDown,
}: DatePickerWrapperProps) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat="yyyy-MM-dd'T'HH:mm"
      wrapperClassName="w-full"
      portalId="calendar-portal"
      preventOpenOnFocus={true}
      customInput={<CustomDateTimeInput id={id} onKeyDown={onKeyDown} />}
    />
  );
}

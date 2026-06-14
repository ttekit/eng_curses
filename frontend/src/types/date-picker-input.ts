import type { InputHTMLAttributes } from "react";

/** Props passed by react-datepicker to `customInput` components. */
export type DatePickerInputProps = InputHTMLAttributes<HTMLInputElement> & {
  onClick?: () => void;
  isError?: boolean;
};

export type DateTimePickerInputProps = DatePickerInputProps;

export type DatePickerWrapperProps = {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  id?: string;
  onKeyDown?: InputHTMLAttributes<HTMLInputElement>["onKeyDown"];
};

/** Google DOB prompt `customInput` — uses controlled string date instead of react-datepicker value. */
export type GoogleDobDateInputProps = DatePickerInputProps & {
  dobValue?: string;
  onDobChange: (value: string) => void;
};

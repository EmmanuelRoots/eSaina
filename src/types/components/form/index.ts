export type FieldType = 'autoComplete' | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';

export interface FieldOption {
  value: string | number;
  label: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export type ValidationRule<T> = (value: T) => string | null;

export type FormValidator<T> = (values: T) => FormErrors<T>;

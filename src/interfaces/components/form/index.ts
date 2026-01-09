/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CSSProperties } from 'react'

import type {
  FieldOption,
  FieldType,
  FormErrors,
  FormValidator,
  ValidationRule,
} from '../../../types/components/form'
import type { CredentialResponse } from '@react-oauth/google'

export interface FieldConfig<T, X = any> {
  name: keyof T
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  options?: FieldOption[]
  validation?: ValidationRule<T>
  disabled?: boolean
  className?: string
  inputStyle?: CSSProperties
  labelStyle?: CSSProperties
  min?: number
  max?: number
  step?: number
  rows?: number
  data?: X[]
  getSuggestionLabel?: (item: X) => string
  getSuggestionKey?: (item: X) => string
  onAutoCompleteSelect?: (item: X) => void
  onInputChange?: (value: string) => void
}

export interface FormState<T> {
  values: T
  errors: FormErrors<T>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
}

export interface UseFormReturn<T> {
  values: T
  errors: FormErrors<T>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
  setValue: (name: keyof T, value: any) => void
  setError: (name: keyof T, error: string) => void
  setTouchedField: (name: keyof T) => void
  validate: (fieldsConfig: FieldConfig<T>[]) => boolean
  reset: () => void
  setSubmitting: (isSubmitting: boolean) => void
}

export interface Logo {
  logoUrl: string
  logoWidth?: number
  logoHeight?: number
}

export interface GenericFormProps<T extends Record<string, any>> {
  fields: FieldConfig<T>[]
  initialValues: T
  onSubmit: (values: T) => void | Promise<void>
  onValidate?: FormValidator<T>
  title?: string
  titleStyle?: CSSProperties
  submitText?: string
  resetText?: string
  className?: string
  loading?: boolean
  disabled?: boolean
  showResetButton?: boolean
  showInitButton?: boolean
  style?: CSSProperties
  showGoogleLogin?: boolean
  onGoogleLoginSuccess?: (res: CredentialResponse) => void
  logo?: Logo
}

export interface FormFieldProps<T extends Record<string, any>> {
  field: FieldConfig<T>
  value: any
  error?: string
  touched?: boolean
  onChange: (value: any) => void
  onBlur: () => void
  disabled?: boolean
}

export interface FormButtonsProps {
  submitText: string
  resetText: string
  loading: boolean
  disabled: boolean
  showResetButton: boolean
  onReset: () => void
}

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useState } from 'react'

import type { FormErrors } from '../../types/components/form'
import type { FieldConfig } from '../../interfaces/components/form'

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onValidate?: (values: T) => FormErrors<T>
) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [name]: value }))

      // Effacer l'erreur quand l'utilisateur tape
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: undefined }))
      }
    },
    [errors]
  )

  const setTouchedField = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [])

  const validate = useCallback(
    (fieldsConfig: FieldConfig<T>[]): boolean => {
      const newErrors: FormErrors<T> = {}

      fieldsConfig.forEach(field => {
        const value = values[field.name]

        // Validation required
        if (field.required && (!value || value === '')) {
          newErrors[field.name] = `${field.label} est requis`
          return
        }

        // Validation personnalisée
        if (field.validation && value) {
          const validationError = field.validation(value)
          if (validationError) {
            newErrors[field.name] = validationError
            return
          }
        }
      })

      // Validation personnalisée du formulaire
      if (onValidate) {
        const customErrors = onValidate(values)
        Object.assign(newErrors, customErrors)
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    [values, onValidate]
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    setValue,
    setTouchedField,
    validate,
    reset,
  }
}

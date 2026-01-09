/**
 * generic form test
 */
import type { FieldConfig } from '../../interfaces/components/form'

/**
 * get user as example
 */

export type UserFormData = {
  firstName: string
  lastName: string
  email: string
  age: number
  country: string
  acceptTerms: boolean
  gender: 'male' | 'female' | 'other'
  bio: string
}
export const userFormFields: FieldConfig<UserFormData>[] = [
  {
    name: 'firstName',
    label: 'Prénom',
    type: 'text',
    placeholder: 'Entrez votre prénom',
    required: true,
  },
  {
    name: 'lastName',
    label: 'Nom',
    type: 'text',
    placeholder: 'Entrez votre nom',
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'exemple@email.com',
    required: true,
  },
  {
    name: 'age',
    label: 'Âge',
    type: 'number',
    placeholder: '25',
    required: true,
  },
  {
    name: 'country',
    label: 'Pays',
    type: 'select',
    placeholder: 'Sélectionnez votre pays',
    required: true,
    options: [
      { value: 'fr', label: 'France' },
      { value: 'ca', label: 'Canada' },
      { value: 'be', label: 'Belgique' },
      { value: 'ch', label: 'Suisse' },
    ],
  },
  {
    name: 'gender',
    label: 'Genre',
    type: 'radio',
    required: true,
    options: [
      { value: 'male', label: 'Homme' },
      { value: 'female', label: 'Femme' },
      { value: 'other', label: 'Autre' },
    ],
  },
  {
    name: 'bio',
    label: 'Biographie',
    type: 'textarea',
    placeholder: 'Parlez-nous de vous...',
    required: false,
  },
  {
    name: 'acceptTerms',
    label: "J'accepte les conditions d'utilisation",
    type: 'checkbox',
    required: true,
  },
]

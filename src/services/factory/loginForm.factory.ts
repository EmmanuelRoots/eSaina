import type { LoginDTO } from "../../data/dto/login"
import { useThemeColors } from "../../hooks/theme"
import type { FieldConfig } from "../../interfaces/components/form"

export const LoginFormFactory = () => {
    const colors = useThemeColors()

    const formFields: FieldConfig<LoginDTO>[] = [
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'tapez votre email',
            required: true,
            labelStyle: {
                color: colors.default
            }
        },
        {
            name: 'password',
            label: 'Mot de passe',
            type: 'password',
            placeholder: 'tapez votre mot de passe',
            required: true,
            labelStyle: {
                color: colors.default
            }
        }
    ]

    return formFields
}
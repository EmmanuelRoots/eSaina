/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CSSProperties } from "react";
import { useForm } from "../../hooks/form";
import type { GenericFormProps } from "../../interfaces/components/form";
import Input from "./input";
import { useThemeColors } from "../../hooks/theme";
import { GoogleLogin } from "@react-oauth/google";

const GenericForm = <T extends Record<string, any>>({
  fields,
  initialValues,
  title,
  titleStyle,
  onSubmit,
  onValidate,
  submitText = 'Soumettre',
  resetText = 'Réinitialiser',
  className = '',
  loading = false,
  showInitButton = false,
  style,
  showGoogleLogin=false,
  onGoogleLoginSuccess,
  logo,
}: GenericFormProps<T>)=> {
  const {
    values,
    errors,
    touched,
    setValue,
    setTouchedField,
    validate,
    reset
  } = useForm(initialValues, onValidate);
  const colors = useThemeColors()
  const defaultStyle = {
    backgroundColor : colors.primaryBackground
  } as CSSProperties

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate(fields)) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Erreur lors de la soumission:', error);
      }
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
      <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
        <div style={{...defaultStyle,...style}}>
          {
            logo && (<div style={{margin : "auto"}}><img src={logo.logoUrl} width={logo.logoWidth} height={logo.logoHeight}/></div>)
          }
          {
            title && (<div style={{margin:"auto",...titleStyle}}><h1>{title}</h1></div>)
          }
          {fields.map((field) => (
            <Input
              key={field.name as string}
              field={field}
              value={values[field.name]}
              error={errors[field.name]}
              touched={touched[field.name]}
              onChange={(value) => setValue(field.name, value)}
              onSelect={(value)=> setValue(field.name, value)}
              onBlur={() => setTouchedField(field.name)}
              labelStyle={field.labelStyle}
              
            />
          ))}
          <button
            type="submit"
            disabled={loading}

            style={{
              backgroundColor:colors.secondary,
              fontSize: '1rem',
              padding : '0.5rem',
              color: colors.primaryBackground,
              border: "none",
              borderRadius : '0.375rem',
              fontWeight : 'bold'
            }}
          >
            {loading ? 'Chargement...' : submitText}
          </button>
          
          {showInitButton && (<button
            type="button"
            onClick={handleReset}
            disabled={loading}
          >
            {resetText}
          </button>)}

          {showGoogleLogin && onGoogleLoginSuccess && (
            <div style={{width:'100%'}}>
              <GoogleLogin 
                onSuccess={onGoogleLoginSuccess}
                text="continue_with"
                size="large"
                shape="pill"
              />
            </div>
          )}
        </div>
      </form>
    
  );
}

export default GenericForm;

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CSSProperties } from "react";
import type { FieldConfig } from "../../interfaces/components/form";
import AutoComplete from "../autoComplete";

const defaultStyle = {
  container: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: 10,
    alignItems: "center" as const,
  },
  label: {
    marginBottom: "0.5rem",
    color: "#212529",
    fontSize: "1rem",
    lineHeight: "1.5",
    fontWeight: 'bold'
  },
  input: {
    display: "block",
    padding: "0.375rem 0.75rem",
    fontSize: "1rem",
    fontWeight: "400",
    lineHeight: "1.5",
    color: "#212529",
    backgroundColor: "#fff",
    backgroundImage: "none",
    border: "1px solid #ced4da",
    borderRadius: "0.375rem",
    transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
    outline: "none"
  },
  inputFocus: {
    borderColor: "#86b7fe",
    boxShadow: "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
  },
  inputError: {
    borderColor: "#dc3545",
    boxShadow: "0 0 0 0.25rem rgba(220, 53, 69, 0.25)"
  },
  inputDisabled: {
    backgroundColor: "#e9ecef",
    opacity: "1",
    cursor: "not-allowed"
  },
  textarea: {
    display: "block",
    width: "100%",
    padding: "0.375rem 0.75rem",
    fontSize: "1rem",
    fontWeight: "400",
    lineHeight: "1.5",
    color: "#212529",
    backgroundColor: "#fff",
    backgroundImage: "none",
    border: "1px solid #ced4da",
    borderRadius: "0.375rem",
    transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
    outline: "none",
    resize: "vertical" as const,
    minHeight: "calc(1.5em + 0.75rem + 2px)"
  },
  select: {
    display: "block",
    width: "100%",
    padding: "0.375rem 2.25rem 0.375rem 0.75rem",
    fontSize: "1rem",
    fontWeight: "400",
    lineHeight: "1.5",
    color: "#212529",
    backgroundColor: "#fff",
    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.75rem center",
    backgroundSize: "16px 12px",
    border: "1px solid #ced4da",
    borderRadius: "0.375rem",
    transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
    outline: "none",
    appearance: "none" as const,
  },
  checkbox: {
    width: "1em",
    height: "1em",
    marginTop: "0.25em",
    verticalAlign: "top",
    backgroundColor: "#fff",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
    border: "1px solid rgba(0, 0, 0, 0.25)",
    appearance: "none" as const,
    borderRadius: "0.25em",
    cursor: "pointer"
  },
  radio: {
    width: "1em",
    height: "1em",
    marginTop: "0.25em",
    verticalAlign: "top",
    backgroundColor: "#fff",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
    border: "1px solid rgba(0, 0, 0, 0.25)",
    appearance: "none" as const,
    borderRadius: "50%",
    cursor: "pointer"
  },
  errorText: {
    width: "100%",
    marginTop: "0.25rem",
    fontSize: "0.875em",
    color: "#dc3545"
  },
  requiredAsterisk: {
    color: "#dc3545",
    marginLeft: "0.25rem"
  },
  checkboxLabel: {
    marginLeft: "0.5rem",
    fontSize: "1rem",
    fontWeight: "400",
    color: "#212529",
    cursor: "pointer"
  },
  radioContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem"
  },
  radioItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  }
};

const Input = <T extends Record<string, any>>({
  field,
  value,
  error,
  touched,
  inputStyle,
  labelStyle,
  onChange,
  onBlur,
  onSelect,
}: {
  field: FieldConfig<T>;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (value: any) => void;
  inputStyle? : CSSProperties,
  labelStyle? : CSSProperties,
  onBlur: () => void;
  onSelect? : (value :any)=> void,
}) => {
  const getInputStyle = () => {
    let style = { ...defaultStyle.input, ...inputStyle || {} };
    
    if (error && touched) {
      style = { ...style, ...defaultStyle.inputError };
    }
    
    if (field.disabled) {
      style = { ...style, ...defaultStyle.inputDisabled };
    }
    
    return style;
  };

  const getTextareaStyle = () => {
    let style = { ...defaultStyle.textarea};
    
    if (error && touched) {
      style = { ...style, ...defaultStyle.inputError };
    }
    
    if (field.disabled) {
      style = { ...style, ...defaultStyle.inputDisabled };
    }
    
    return style;
  };

  const getSelectStyle = () => {
    let style = { ...defaultStyle.select };
    
    if (error && touched) {
      style = { ...style, ...defaultStyle.inputError };
    }
    
    if (field.disabled) {
      style = { ...style, ...defaultStyle.inputDisabled };
    }
    
    return style;
  };

  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            style={getTextareaStyle()}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
          />
        );

      case 'select':
        return (
          <select
            style={getSelectStyle()}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={field.required}
            disabled={field.disabled}
          >
            <option value="">{field.placeholder || 'Sélectionnez...'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              style={defaultStyle.checkbox}
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              onBlur={onBlur}
              disabled={field.disabled}
            />
            <label style={defaultStyle.checkboxLabel}>{field.label}</label>
          </div>
        );

      case 'radio':
        return (
          <div style={defaultStyle.radioContainer}>
            {field.options?.map((option) => (
              <div key={option.value} style={defaultStyle.radioItem}>
                <input
                  type="radio"
                  style={defaultStyle.radio}
                  name={field.name as string}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  disabled={field.disabled}
                />
                <label style={defaultStyle.checkboxLabel}>{option.label}</label>
              </div>
            ))}
          </div>
        );

      case "autoComplete" :
        return (
          <AutoComplete
            data={field.data!}
            getSuggestionLabel={field.getSuggestionLabel!}
            getSuggestionKey={field.getSuggestionKey!}
            onSelect={(item)=>onSelect && onSelect(item as any)}
            onInputChange={field.onInputChange}
          />
        )

      default:
        return (
          <input
            type={field.type}
            style={getInputStyle()}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
          />
        );
    }
  };

  return (
    <div style={defaultStyle.container}>
      <div>
        {field.type !== 'checkbox' && (
          <label style={{...defaultStyle.label, ...labelStyle}}>
            {field.label}
            {field.required && <span style={defaultStyle.requiredAsterisk}>*</span>}
          </label>
        )}
      </div>
      <div>
        {renderInput()}
      </div>
      {error && touched && (
        <p style={defaultStyle.errorText}>{error}</p>
      )}
    </div>
  );
}

export default Input;
import GenericForm from "../../components/form";
import { type CreateProjectRequestDTO } from "../../data/dto/project";
import projectApi from "../../services/api/project.api";
import { useThemeColors } from "../../hooks/theme";

interface ProjectFormProps {
  onSuccess: () => void;
}

const ProjectForm = ({ onSuccess }: ProjectFormProps) => {
  const colors = useThemeColors();

  const fields = [
    { name: 'key', label: 'Clé du projet', type: 'text', placeholder: 'Ex: ESA' },
    { name: 'name', label: 'Nom du projet', type: 'text', placeholder: 'Ex: eSaina' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const initialValues: CreateProjectRequestDTO = {
    key: '',
    name: '',
    description: '',
  };

  const handleSubmit = async (values: CreateProjectRequestDTO) => {
    try {
      await projectApi.createProject(values);
      onSuccess();
    } catch (error) {
      console.error('Erreur création projet:', error);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <GenericForm
        fields={fields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitText="Créer le projet"
        style={{ backgroundColor: 'transparent' }}
      />
    </div>
  );
};

export default ProjectForm;

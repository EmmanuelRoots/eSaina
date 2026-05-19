import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import projectApi from "../../services/api/project.api";
import type { ProjectDTO } from "../../data/dto/project";
import { Card, CardBody, CardHeader } from "../../components/card";
import Column from "../../components/column";
import Row from "../../components/row";
import { useThemeColors } from "../../hooks/theme";
import Button from "../../components/Button";
import { SectionLayout } from "../layout/section";
import Modal from "../../components/modal";
import ProjectForm from "./ProjectForm";

const ProjectList = () => {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const colors = useThemeColors();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    const data = await projectApi.getMyProjects();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = () => {
    setIsModalOpen(false);
    fetchProjects();
  };

  if (loading && projects.length === 0) return <div>Chargement des projets...</div>;

  return (
    <SectionLayout>
      <Column style={{ padding: "20px", gap: "20px" }}>
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ color: 'var(--color-text)' }}>Mes Projets</h1>
          <Button onClick={() => setIsModalOpen(true)}>Nouveau Projet</Button>
        </Row>
        
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <ProjectForm onSuccess={handleProjectCreated} />
        </Modal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {projects.map((project) => (
            <Card
              key={project.id}
              style={{ cursor: "pointer" }}
            >
              <div onClick={() => navigate(`/projects/${project.id}/board`)}>
                <CardHeader>
                  <Row style={{ justifyContent: "space-between" }}>
                    <span>{project.key}</span>
                    <span style={{ fontSize: "0.8em", color: 'var(--color-text-secondary)' }}>
                      {project.owner?.firstName}
                    </span>
                  </Row>
                </CardHeader>
                <CardBody>
                  <h3 style={{ margin: "0 0 10px 0" }}>{project.name}</h3>
                  <p style={{ fontSize: "0.9em", color: 'var(--color-text-secondary)' }}>
                    {project.description || "Pas de description"}
                  </p>
                </CardBody>
              </div>
            </Card>
          ))}
        </div>
      </Column>
    </SectionLayout>
  );
};

export default ProjectList;

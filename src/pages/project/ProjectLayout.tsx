import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import Row from "../../components/row";
import Column from "../../components/column";
import { useThemeColors } from "../../hooks/theme";

const ProjectLayout = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const colors = useThemeColors();

  const tabs = [
    { label: "Tableau", path: "board" },
    { label: "Backlog", path: "backlog" },
  ];

  return (
    <Column style={{ height: "100%" }}>
      <Row
        style={{
          padding: "0 20px",
          borderBottom: "1px solid #ddd",
          gap: "20px",
          backgroundColor: "white",
        }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname.includes(tab.path);
          return (
            <div
              key={tab.path}
              onClick={() => navigate(`/projects/${projectId}/${tab.path}`)}
              style={{
                padding: "15px 10px",
                cursor: "pointer",
                borderBottom: isActive ? `2px solid ${colors.primary}` : "2px solid transparent",
                color: isActive ? colors.primary : "#666",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {tab.label}
            </div>
          );
        })}
      </Row>
      <div style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </div>
    </Column>
  );
};

export default ProjectLayout;

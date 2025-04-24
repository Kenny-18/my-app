export default function SimpleEducationForm() {
    return (
      <div style={{ padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "10px" }}>
        <h2 style={{ color: "#333", borderBottom: "2px solid #13f0c4", paddingBottom: "10px", display: "inline-block" }}>
          Formación Académica
        </h2>
        <p style={{ color: "#666", marginBottom: "25px" }}>
          Esta es una versión simplificada del formulario de educación para verificar que todo funciona correctamente.
        </p>
        <div style={{ marginTop: "20px" }}>
          <button
            style={{
              backgroundColor: "#13f0c4",
              color: "#000",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              fontWeight: "500",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Añadir Educación (Demo)
          </button>
        </div>
      </div>
    )
  }
  
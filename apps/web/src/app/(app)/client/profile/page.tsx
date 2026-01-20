"use client";

import { useState } from "react";
import { Save, User, Mail, Phone, MapPin } from "react-feather";
import { SectionHeading } from "@/app/components/ui/SectionHeading";
import { GlowCard } from "@/app/components/ui/GlowCard";
import { EventoraButton } from "@/app/components/ui/EventoraButton";
import { InputField } from "@/app/components/ui/InputField";
import { useAuth } from "@/app/hooks/useAuth";

export default function ClientProfilePage() {
  const { user } = useAuth();
  
  // Mock profile data
  const [profile, setProfile] = useState({
    name: user?.name || "Cliente Eventora",
    email: user?.email || "cliente@example.com",
    phone: "+52 55 1234 5678",
    address: "Polanco, CDMX",
    birthdate: "1990-01-15",
    emergencyContact: "María López",
    emergencyPhone: "+52 55 8765 4321",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Call API to save profile
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      alert("Perfil actualizado correctamente");
    }, 1000);
  };

  return (
    <div className="client-profile">
      <SectionHeading 
        eyebrow="Mi Perfil" 
        title="Información Personal"
      >
        Mantén tus datos actualizados para una mejor experiencia.
      </SectionHeading>

      <GlowCard>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <User size={48} />
            </div>
            <div>
              <h2>{profile.name}</h2>
              <p>{profile.email}</p>
            </div>
            <EventoraButton
              variant={isEditing ? "ghost" : "primary"}
              onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
            >
              {isEditing ? "Cancelar" : "Editar"}
            </EventoraButton>
          </div>

          <div className="profile-form">
            <div className="form-section">
              <h3><User size={20} /> Información básica</h3>
              <div className="form-grid">
                <InputField
                  label="Nombre completo"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                />
                <InputField
                  label="Correo electrónico"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                />
                <InputField
                  label="Teléfono"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                />
                <InputField
                  label="Fecha de nacimiento"
                  type="date"
                  value={profile.birthdate}
                  onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-section">
              <h3><MapPin size={20} /> Dirección</h3>
              <InputField
                label="Dirección"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="form-section">
              <h3><Phone size={20} /> Contacto de emergencia</h3>
              <div className="form-grid">
                <InputField
                  label="Nombre"
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                  disabled={!isEditing}
                />
                <InputField
                  label="Teléfono"
                  type="tel"
                  value={profile.emergencyPhone}
                  onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <EventoraButton
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save size={16} />
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </EventoraButton>
              </div>
            )}
          </div>
        </div>
      </GlowCard>

      <style jsx>{`
        .client-profile {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .profile-card {
          padding: 2rem;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--primary-light, #818cf8));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .profile-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .profile-header p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0.25rem 0 0;
        }

        .profile-header :global(button) {
          margin-left: auto;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 1rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-wrap: wrap;
          }

          .profile-header :global(button) {
            margin-left: 0;
            width: 100%;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SectionHeading } from "@/app/components/ui/SectionHeading";
import { GlowCard } from "@/app/components/ui/GlowCard";
import { EventoraButton } from "@/app/components/ui/EventoraButton";
import { getClients, createClient, updateClient, deleteClient, exportClientsCSV, type Client, type CreateClientPayload } from "@/lib/admin-api";
import { Search, Plus, Edit2, Trash2, Phone, Mail, User, X, Download, Filter } from "react-feather";

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [membershipFilter, setMembershipFilter] = useState<"all" | "with" | "without">("all");
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    const timer = setTimeout(() => setDebouncedSearch(value), 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch clients
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ["clients", debouncedSearch, membershipFilter],
    queryFn: () => getClients({ 
      search: debouncedSearch || undefined, 
      role: "CLIENT",
      hasMembership: membershipFilter === "all" ? undefined : membershipFilter === "with" ? "true" : "false",
    }),
  });

  // Export CSV handler
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const blob = await exportClientsCSV({
        search: debouncedSearch || undefined,
        hasMembership: membershipFilter === "all" ? undefined : membershipFilter === "with" ? "true" : "false",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clientes-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting CSV:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsModalOpen(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientPayload> }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsModalOpen(false);
      setEditingClient(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: CreateClientPayload = {
      email: formData.get("email") as string,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string || undefined,
    };

    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="clients-page">
      <section className="clients-header glass-panel">
        <SectionHeading eyebrow="Gestión" title="Clientes">
          Administra tu base de clientes, historial y contacto.
        </SectionHeading>
        
        <div className="clients-actions">
          <div className="clients-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <div className="clients-filter">
            <Filter size={16} />
            <select 
              value={membershipFilter} 
              onChange={(e) => setMembershipFilter(e.target.value as "all" | "with" | "without")}
            >
              <option value="all">Todos</option>
              <option value="with">Con membresía</option>
              <option value="without">Sin membresía</option>
            </select>
          </div>

          <button 
            className="clients-export-btn" 
            onClick={handleExportCSV}
            disabled={isExporting || clients.length === 0}
          >
            <Download size={18} />
            {isExporting ? "Exportando..." : "Exportar CSV"}
          </button>

          <EventoraButton onClick={() => { setEditingClient(null); setIsModalOpen(true); }}>
            <Plus size={18} />
            Nuevo cliente
          </EventoraButton>
        </div>
      </section>

      <section className="clients-list">
        {isLoading && (
          <div className="clients-loading">
            <p>Cargando clientes...</p>
          </div>
        )}

        {error && (
          <GlowCard>
            <p className="clients-error">Error al cargar clientes. Intenta de nuevo.</p>
          </GlowCard>
        )}

        {!isLoading && !error && clients.length === 0 && (
          <GlowCard>
            <div className="clients-empty">
              <User size={48} />
              <p>No hay clientes registrados</p>
              <EventoraButton onClick={() => setIsModalOpen(true)}>
                Agregar primer cliente
              </EventoraButton>
            </div>
          </GlowCard>
        )}

        <div className="clients-grid">
          {clients.map((client) => (
            <GlowCard key={client.id}>
              <div className="client-card">
                <div className="client-card__avatar">
                  <User size={24} />
                </div>
                <div className="client-card__info">
                  <h3>{client.name || "Sin nombre"}</h3>
                  <p className="client-card__email">
                    <Mail size={14} />
                    {client.email}
                  </p>
                  {client.phone && (
                    <p className="client-card__phone">
                      <Phone size={14} />
                      {client.phone}
                    </p>
                  )}
                  <p className="client-card__date">
                    Cliente desde {new Date(client.createdAt).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <div className="client-card__actions">
                  <button 
                    className="client-card__action" 
                    onClick={() => handleEdit(client)}
                    aria-label="Editar cliente"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="client-card__action client-card__action--danger" 
                    onClick={() => handleDelete(client.id)}
                    aria-label="Eliminar cliente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingClient ? "Editar cliente" : "Nuevo cliente"}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="client-form">
              <div className="form-group">
                <label htmlFor="name">Nombre completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={editingClient?.name || ""}
                  required
                  placeholder="María García"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={editingClient?.email || ""}
                  required
                  placeholder="maria@ejemplo.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Teléfono (opcional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={editingClient?.phone || ""}
                  placeholder="+52 55 1234 5678"
                />
              </div>
              <div className="form-actions">
                <EventoraButton type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </EventoraButton>
                <EventoraButton 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? "Guardando..." 
                    : editingClient ? "Actualizar" : "Crear cliente"}
                </EventoraButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .clients-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .clients-header {
          padding: 2rem;
        }

        .clients-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .clients-search {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          flex: 1;
          min-width: 250px;
        }

        .clients-search input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 0.95rem;
          width: 100%;
        }

        .clients-search input::placeholder {
          color: var(--text-muted);
        }

        .clients-filter {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: var(--text-secondary);
        }

        .clients-filter select {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .clients-export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clients-export-btn:hover:not(:disabled) {
          background: var(--surface-hover);
          border-color: var(--primary);
        }

        .clients-export-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clients-list {
          min-height: 300px;
        }

        .clients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }

        .clients-loading,
        .clients-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          gap: 1rem;
          color: var(--text-muted);
        }

        .clients-error {
          color: var(--error);
          text-align: center;
          padding: 2rem;
        }

        .client-card {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .client-card__avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .client-card__info {
          flex: 1;
          min-width: 0;
        }

        .client-card__info h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
          color: var(--text-primary);
        }

        .client-card__email,
        .client-card__phone,
        .client-card__date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0.25rem 0;
        }

        .client-card__date {
          color: var(--text-muted);
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }

        .client-card__actions {
          display: flex;
          gap: 0.5rem;
        }

        .client-card__action {
          background: var(--surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          padding: 0.5rem;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .client-card__action:hover {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .client-card__action--danger:hover {
          background: var(--error);
          border-color: var(--error);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          width: 100%;
          max-width: 480px;
          padding: 2rem;
          border-radius: 1rem;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
        }

        .modal-close:hover {
          color: var(--text-primary);
        }

        .client-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-group input {
          background: var(--surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          padding: 0.875rem 1rem;
          font-size: 1rem;
          color: var(--text-primary);
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .form-group input::placeholder {
          color: var(--text-muted);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}

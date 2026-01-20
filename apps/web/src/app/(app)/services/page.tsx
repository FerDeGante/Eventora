"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getServiceCategories,
  createServiceCategory,
  deleteServiceCategory,
  type Service,
  type ServiceCategory,
  type CreateServicePayload,
} from "@/lib/admin-api";

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap" as const,
    gap: "1rem",
  } as React.CSSProperties,
  title: {
    fontSize: "1.875rem",
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  } as React.CSSProperties,
  subtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginTop: "0.25rem",
  } as React.CSSProperties,
  headerActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  primaryButton: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "0.5rem",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    boxShadow: "0 2px 4px rgba(99, 102, 241, 0.3)",
  } as React.CSSProperties,
  secondaryButton: {
    background: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "0.625rem 1.25rem",
    borderRadius: "0.5rem",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
  } as React.CSSProperties,
  dangerButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "0.875rem",
  } as React.CSSProperties,
  tableContainer: {
    background: "white",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
  } as React.CSSProperties,
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  } as React.CSSProperties,
  th: {
    background: "#f9fafb",
    padding: "0.875rem 1rem",
    textAlign: "left" as const,
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e5e7eb",
  } as React.CSSProperties,
  td: {
    padding: "1rem",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "0.875rem",
    color: "#374151",
  } as React.CSSProperties,
  serviceName: {
    fontWeight: 600,
    color: "#1f2937",
  } as React.CSSProperties,
  categoryBadge: (color: string) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 500,
    background: `${color}15`,
    color: color,
  }) as React.CSSProperties,
  categoryDot: (color: string) => ({
    width: "0.5rem",
    height: "0.5rem",
    borderRadius: "50%",
    background: color,
  }) as React.CSSProperties,
  duration: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    color: "#6b7280",
  } as React.CSSProperties,
  price: {
    fontWeight: 600,
    color: "#059669",
  } as React.CSSProperties,
  actions: {
    display: "flex",
    gap: "0.5rem",
  } as React.CSSProperties,
  iconButton: {
    background: "transparent",
    border: "none",
    padding: "0.5rem",
    cursor: "pointer",
    borderRadius: "0.375rem",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  modal: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: "1rem",
  } as React.CSSProperties,
  modalContent: {
    background: "white",
    borderRadius: "0.75rem",
    maxWidth: "32rem",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  } as React.CSSProperties,
  modalHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  modalTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
  } as React.CSSProperties,
  modalBody: {
    padding: "1.5rem",
  } as React.CSSProperties,
  modalFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
  } as React.CSSProperties,
  formGroup: {
    marginBottom: "1.25rem",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    minHeight: "80px",
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  } as React.CSSProperties,
  select: {
    width: "100%",
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    background: "white",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  } as React.CSSProperties,
  helpText: {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginTop: "0.25rem",
  } as React.CSSProperties,
  emptyState: {
    textAlign: "center" as const,
    padding: "4rem 2rem",
    color: "#6b7280",
  } as React.CSSProperties,
  emptyIcon: {
    width: "4rem",
    height: "4rem",
    margin: "0 auto 1rem",
    color: "#d1d5db",
  } as React.CSSProperties,
  emptyTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  categoriesSection: {
    marginBottom: "2rem",
  } as React.CSSProperties,
  categoriesList: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.5rem",
    marginTop: "0.75rem",
  } as React.CSSProperties,
  categoryChip: (color: string, isActive: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.5rem 0.875rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: 500,
    background: isActive ? color : "#f3f4f6",
    color: isActive ? "white" : "#374151",
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s ease",
  }) as React.CSSProperties,
  addCategoryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.5rem 0.875rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    background: "transparent",
    color: "#6366f1",
    cursor: "pointer",
    border: "1px dashed #6366f1",
  } as React.CSSProperties,
  searchBar: {
    marginBottom: "1.5rem",
  } as React.CSSProperties,
  searchInput: {
    width: "100%",
    maxWidth: "24rem",
    padding: "0.625rem 0.75rem 0.625rem 2.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  searchWrapper: {
    position: "relative" as const,
    maxWidth: "24rem",
  } as React.CSSProperties,
  searchIcon: {
    position: "absolute" as const,
    left: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  } as React.CSSProperties,
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  } as React.CSSProperties,
  colorInputWrapper: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  } as React.CSSProperties,
  colorInput: {
    width: "3rem",
    height: "2.25rem",
    padding: "0.25rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    cursor: "pointer",
  } as React.CSSProperties,
};

// ============================================
// ICONS
// ============================================
const PlusIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const PackageIcon = () => (
  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ============================================
// TYPES
// ============================================
type ServiceFormData = {
  name: string;
  description: string;
  defaultDuration: number;
  basePrice: number;
  categoryId: string;
  isPackageable: boolean;
};

type CategoryFormData = {
  name: string;
  colorHex: string;
};

// ============================================
// COMPONENT
// ============================================
export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    name: "",
    description: "",
    defaultDuration: 60,
    basePrice: 0,
    categoryId: "",
    isPackageable: true,
  });

  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: "",
    colorHex: "#6366f1",
  });

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [servicesData, categoriesData] = await Promise.all([
        getServices(),
        getServiceCategories(),
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Error loading services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategoryId || service.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  // Format price
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(cents / 100);
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // Handle service form
  const handleOpenServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        description: service.description || "",
        defaultDuration: service.defaultDuration,
        basePrice: service.basePrice / 100, // Convert from cents
        categoryId: service.categoryId || "",
        isPackageable: service.isPackageable,
      });
    } else {
      setEditingService(null);
      setServiceForm({
        name: "",
        description: "",
        defaultDuration: 60,
        basePrice: 0,
        categoryId: "",
        isPackageable: true,
      });
    }
    setShowServiceModal(true);
    setError(null);
  };

  const handleSaveService = async () => {
    if (!serviceForm.name || serviceForm.defaultDuration <= 0) {
      setError("Nombre y duración son requeridos");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: CreateServicePayload = {
        name: serviceForm.name,
        description: serviceForm.description || undefined,
        defaultDuration: serviceForm.defaultDuration,
        basePrice: Math.round(serviceForm.basePrice * 100), // Convert to cents
        categoryId: serviceForm.categoryId || undefined,
        isPackageable: serviceForm.isPackageable,
      };

      if (editingService) {
        await updateService(editingService.id, payload);
      } else {
        await createService(payload);
      }

      await loadData();
      setShowServiceModal(false);
    } catch (err: any) {
      setError(err.message || "Error saving service");
    } finally {
      setSaving(false);
    }
  };

  // Handle category form
  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      setError("Nombre de categoría es requerido");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createServiceCategory({
        name: categoryForm.name,
        colorHex: categoryForm.colorHex,
      });
      await loadData();
      setShowCategoryModal(false);
      setCategoryForm({ name: "", colorHex: "#6366f1" });
    } catch (err: any) {
      setError(err.message || "Error creating category");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleConfirmDelete = async () => {
    if (!deletingService) return;

    setSaving(true);
    try {
      await deleteService(deletingService.id);
      await loadData();
      setShowDeleteModal(false);
      setDeletingService(null);
    } catch (err: any) {
      setError(err.message || "Error deleting service");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try {
      await deleteServiceCategory(categoryId);
      await loadData();
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
      }
    } catch (err: any) {
      alert(err.message || "Error deleting category");
    }
  };

  // Render loading
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{ fontSize: "1.5rem", color: "#6b7280" }}>Cargando servicios...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Servicios</h1>
          <p style={styles.subtitle}>
            Gestiona tu catálogo de servicios y paquetes
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            style={styles.secondaryButton}
            onClick={() => setShowCategoryModal(true)}
          >
            <PlusIcon /> Nueva Categoría
          </button>
          <button
            style={styles.primaryButton}
            onClick={() => handleOpenServiceModal()}
          >
            <PlusIcon /> Nuevo Servicio
          </button>
        </div>
      </div>

      {/* Categories Filter */}
      <div style={styles.categoriesSection}>
        <div style={styles.categoriesList}>
          <button
            style={styles.categoryChip("#6366f1", !selectedCategoryId)}
            onClick={() => setSelectedCategoryId(null)}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              style={styles.categoryChip(cat.colorHex || "#6366f1", selectedCategoryId === cat.id)}
              onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleDeleteCategory(cat.id);
              }}
            >
              <span style={styles.categoryDot(cat.colorHex || "#6366f1")} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchBar}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Buscar servicios..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        {filteredServices.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <PackageIcon />
            </div>
            <div style={styles.emptyTitle}>
              {searchQuery || selectedCategoryId ? "No se encontraron servicios" : "Sin servicios"}
            </div>
            <p>
              {searchQuery || selectedCategoryId
                ? "Intenta con otros filtros"
                : "Crea tu primer servicio para comenzar"}
            </p>
            {!searchQuery && !selectedCategoryId && (
              <button
                style={{ ...styles.primaryButton, marginTop: "1rem", display: "inline-flex" }}
                onClick={() => handleOpenServiceModal()}
              >
                <PlusIcon /> Crear Servicio
              </button>
            )}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Servicio</th>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Duración</th>
                <th style={styles.th}>Precio</th>
                <th style={styles.th}>Paqueteable</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td style={styles.td}>
                    <div style={styles.serviceName}>{service.name}</div>
                    {service.description && (
                      <div style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        {service.description.substring(0, 50)}
                        {service.description.length > 50 ? "..." : ""}
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    {service.category ? (
                      <span style={styles.categoryBadge(service.category.colorHex || "#6366f1")}>
                        <span style={styles.categoryDot(service.category.colorHex || "#6366f1")} />
                        {service.category.name}
                      </span>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>—</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.duration}>
                      <ClockIcon />
                      {formatDuration(service.defaultDuration)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.price}>{formatPrice(service.basePrice)}</span>
                  </td>
                  <td style={styles.td}>
                    {service.isPackageable ? (
                      <span style={{ color: "#059669" }}>✓</span>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>—</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <div style={{ ...styles.actions, justifyContent: "flex-end" }}>
                      <button
                        style={styles.iconButton}
                        onClick={() => handleOpenServiceModal(service)}
                        title="Editar"
                      >
                        <EditIcon />
                      </button>
                      <button
                        style={{ ...styles.iconButton, color: "#ef4444" }}
                        onClick={() => {
                          setDeletingService(service);
                          setShowDeleteModal(true);
                        }}
                        title="Eliminar"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Service Modal */}
      {showServiceModal && (
        <div style={styles.modal} onClick={() => setShowServiceModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingService ? "Editar Servicio" : "Nuevo Servicio"}
              </h2>
              <button
                style={styles.iconButton}
                onClick={() => setShowServiceModal(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <div style={styles.modalBody}>
              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre del Servicio *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="Ej: Masaje Relajante"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Descripción</label>
                <textarea
                  style={styles.textarea}
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, description: e.target.value })
                  }
                  placeholder="Describe brevemente el servicio..."
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Duración (minutos) *</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={serviceForm.defaultDuration}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        defaultDuration: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                    max="480"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Precio (MXN)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={serviceForm.basePrice}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        basePrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.01"
                  />
                  <p style={styles.helpText}>Precio base del servicio</p>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Categoría</label>
                <select
                  style={styles.select}
                  value={serviceForm.categoryId}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, categoryId: e.target.value })
                  }
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={serviceForm.isPackageable}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, isPackageable: e.target.checked })
                    }
                  />
                  <span>Incluir en paquetes</span>
                </label>
                <p style={styles.helpText}>
                  Permite que este servicio pueda ser incluido en paquetes de sesiones
                </p>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={styles.secondaryButton}
                onClick={() => setShowServiceModal(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                style={styles.primaryButton}
                onClick={handleSaveService}
                disabled={saving}
              >
                {saving ? "Guardando..." : editingService ? "Guardar Cambios" : "Crear Servicio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div style={styles.modal} onClick={() => setShowCategoryModal(false)}>
          <div
            style={{ ...styles.modalContent, maxWidth: "24rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nueva Categoría</h2>
              <button
                style={styles.iconButton}
                onClick={() => setShowCategoryModal(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <div style={styles.modalBody}>
              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre de la Categoría *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  placeholder="Ej: Masajes, Faciales..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Color</label>
                <div style={styles.colorInputWrapper}>
                  <input
                    type="color"
                    style={styles.colorInput}
                    value={categoryForm.colorHex}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, colorHex: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    style={{ ...styles.input, flex: 1 }}
                    value={categoryForm.colorHex}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, colorHex: e.target.value })
                    }
                    placeholder="#6366f1"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={styles.secondaryButton}
                onClick={() => setShowCategoryModal(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                style={styles.primaryButton}
                onClick={handleSaveCategory}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Crear Categoría"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingService && (
        <div style={styles.modal} onClick={() => setShowDeleteModal(false)}>
          <div
            style={{ ...styles.modalContent, maxWidth: "24rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Eliminar Servicio</h2>
              <button
                style={styles.iconButton}
                onClick={() => setShowDeleteModal(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <div style={styles.modalBody}>
              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}
              <p style={{ margin: 0, color: "#374151" }}>
                ¿Estás seguro que deseas eliminar el servicio{" "}
                <strong>{deletingService.name}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={styles.secondaryButton}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingService(null);
                }}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                style={styles.dangerButton}
                onClick={handleConfirmDelete}
                disabled={saving}
              >
                {saving ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

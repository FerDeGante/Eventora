// src/components/ServiceCard.tsx
export default function ServiceCard({ service }: { service: {id:string, label:string, icon:string} }) {
    return (
      <div className="service-card p-3 text-center">
        <div className="display-4">{service.icon}</div>
        <h5 className="mt-2">{service.label}</h5>
      </div>
    )
  }
  
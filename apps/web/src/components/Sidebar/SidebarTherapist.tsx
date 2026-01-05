// src/components/Sidebar/SidebarTherapist.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import logoEventora from "public/images/logo_bloom_clean.png";

const links = [
  { href: "/therapist", label: "Reservaciones", icon: "📅" },
  { href: "/therapist/manual", label: "Crear Reservación", icon: "➕" },
  // Agrega más opciones aquí si quieres
];

export default function SidebarTherapist() {
  const router = useRouter();
  return (
    <aside className="sidebar-admin bg-white border-end p-3" style={{minWidth: 220, minHeight: '80vh'}}>
      <div className="mb-4">
        <Image 
          src={logoEventora} 
          width={120} 
          height={80} // Ajusta este valor según la proporción de tu imagen
          alt="Eventora Fisio"
        />
      </div>
      <ul className="list-unstyled">
        {links.map((l) => (
          <li key={l.href}>
            <Link 
              href={l.href}
              className={`d-block py-2 px-2 rounded ${router.pathname === l.href ? 'bg-primary text-white fw-bold' : 'text-dark'}`}
            >
              <span style={{fontSize: 18}}>{l.icon}</span> <span className="ms-2">{l.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
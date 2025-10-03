"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Navbar as BSNavbar,
  Nav,
  Container,
  NavDropdown,
} from "react-bootstrap";
import {
  FaInfoCircle,
  FaCalendarAlt,
  FaSignInAlt,
  FaUser,
} from "react-icons/fa";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToReservas = () => {
    if (session) {
      router.push("/reservasform");
    } else {
      router.push("/login?redirect=/reservasform");
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <BSNavbar
      sticky="top"
      expand="lg"
      className={scrolled ? "navbar-scrolled" : "navbar-base"}
      style={{
        transition: "background 0.3s, box-shadow 0.3s",
        boxShadow: scrolled
          ? "0 2px 10px rgba(96,186,194,0.09)"
          : undefined,
      }}
    >
      <Container>
        <Link
          href="/"
          className="navbar-brand d-flex align-items-center gap-2"
          style={{ minWidth: 125 }}
        >
          <Image
            src="/images/logo_bloom_white.png"
            alt="Logo Bloom"
            width={150}
            height={150}
            className="logo-img"
            priority
            style={{
              width: 120,
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Link>

        <BSNavbar.Toggle aria-controls="navbar-nav" />
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="ms-auto gap-3 align-items-center">
            {/* Botón/enlace a Reservar */}
            <button
              type="button"
              className="btn btn-reservar d-flex align-items-center"
              style={{
                background:
                  "linear-gradient(90deg, #aee6e8 0%, #e7bbee 100%)",
                color: "#35594a",
                border: "none",
                borderRadius: 18,
                fontWeight: 700,
                fontSize: "1.03rem",
                boxShadow: "0 6px 18px #60bac22a",
                padding: "0.65rem 1.5rem",
                transition: "box-shadow .14s, transform .12s",
                letterSpacing: "-.5px",
                marginRight: 3,
                gap: 7,
              }}
              onClick={goToReservas}
              tabIndex={0}
            >
              <FaCalendarAlt className="me-1" style={{ fontSize: "1.15em" }} />
              Reservar
            </button>

            {/* Botón de Iniciar sesión (solo si NO hay sesión) */}
            {!session && (
              <button
                type="button"
                className="btn btn-reservar d-flex align-items-center"
                style={{
                  background:
                    "linear-gradient(90deg, #aee6e8 0%, #e7bbee 100%)",
                  color: "#35594a",
                  border: "none",
                  borderRadius: 18,
                  fontWeight: 700,
                  fontSize: "1.03rem",
                  boxShadow: "0 6px 18px #60bac22a",
                  padding: "0.65rem 1.5rem",
                  transition: "box-shadow .14s, transform .12s",
                  letterSpacing: "-.5px",
                  marginRight: 3,
                  gap: 7,
                }}
                onClick={goToLogin}
                tabIndex={0}
              >
                <FaSignInAlt className="me-1" style={{ fontSize: "1.13em" }} />
                Iniciar sesión
              </button>
            )}

            {/* Dropdown para usuarios autenticados */}
            {session && (
              <NavDropdown
                title={
                  <span className="d-flex align-items-center">
                    <FaUser className="me-1" />
                    {session.user?.name}
                  </span>
                }
                id="user-dd"
                align="end"
                menuVariant="light"
                className="nav-link"
              >
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => router.push("/dashboard")}
                >
                  Mi Dashboard
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Cerrar sesión
                </button>
              </NavDropdown>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>

      {/* Estilo adicional rápido para ambos botones */}
      <style jsx global>{`
        .btn.btn-reservar:hover,
        .btn.btn-reservar:focus {
          box-shadow: 0 12px 30px #aee6e888;
          background: linear-gradient(90deg, #e7bbee 10%, #aee6e8 100%);
          color: #35594a;
          transform: translateY(-2px) scale(1.03);
        }
        @media (max-width: 700px) {
          .btn.btn-reservar {
            font-size: 1rem;
            padding: 0.59rem 1.15rem;
            margin-top: 9px;
          }
        }
      `}</style>
    </BSNavbar>
  );
}

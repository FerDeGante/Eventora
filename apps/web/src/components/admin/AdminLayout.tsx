"use client";
import React, { useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Container, Row, Col, Nav, Dropdown } from "react-bootstrap";
import { useSession, signOut } from "next-auth/react";
import {
  FaUsers,
  FaUserMd,
  FaCalendarAlt,
  FaCalendarPlus,
  FaChartBar,
} from "react-icons/fa";

import ClientsSection from "./ClientsSection";
import TherapistsSection from "./TherapistsSection";
import ManualReservationSection from "./ManualReservationSection";
import CalendarSection from "../CalendarSection";
import StatsSection from "./StatsSection"; // <- import StatsSection

export default function AdminLayout() {
  const [section, setSection] = useState<"clients"|"therapists"|"manual"|"calendar"|"reports">("manual");
  const { data: session } = useSession();

  const iconProps = { style: { color: "#60bac2" } } as const;
  const sections = [
    { key: "clients",   label: "Clientes",           icon: <FaUsers    {...iconProps} /> },
    { key: "therapists",label: "Terapeutas",        icon: <FaUserMd   {...iconProps} /> },
    { key: "manual",    label: "Generar reservación",icon: <FaCalendarPlus {...iconProps} /> },
    { key: "calendar",  label: "Calendario",        icon: <FaCalendarAlt {...iconProps} /> },
    { key: "reports",   label: "Reportes",          icon: <FaChartBar {...iconProps} /> },
  ] as const;

  function renderContent() {
    switch (section) {
      case "clients":     return <ClientsSection />;
      case "therapists":  return <TherapistsSection />;
      case "manual":      return <ManualReservationSection />;
      case "calendar":    return <CalendarSection
  apiBaseUrl="/api/admin/reservations"
  canEdit={true}
  title="Reservaciones para"
/>
      case "reports":     return <StatsSection />;   // <- aquí
      default:            return null;
    }
  }

  return (
    <>
      <Navbar />
      <Container fluid className="py-4">
        <Row className="mb-3">
          <Col className="d-flex justify-content-end">
            {session && (
              <Dropdown>
                <Dropdown.Toggle variant="light" id="dd-admin">
                  {session.user?.name}
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item onClick={() => signOut({ callbackUrl: "/" })}>
                    Cerrar sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Col>
        </Row>
        <Row>
          <Col md={2}>
            <Nav className="flex-column">
              {sections.map((s) => (
                <Nav.Link
                  key={s.key}
                  active={section === s.key}
                  onClick={() => setSection(s.key)}
                  className="d-flex align-items-center text-primary"
                  style={{ backgroundColor: section === s.key ? "#e7f1ff" : undefined }}
                >
                  {s.icon}
                  <span className="ms-2">{s.label}</span>
                </Nav.Link>
              ))}
            </Nav>
          </Col>
          <Col md={10}>{renderContent()}</Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}

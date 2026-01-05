// src/components/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaTwitter, FaFacebook, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer-bloom">
      <div className="footer-bloom-container">
        <div className="footer-bloom-col logo-col">
          <Image
            src="/images/logo_bloom_clean.png"
            alt="Eventora"
            width={180}
            height={180}
            className="footer-bloom-logo"
          />
        </div>
        <div className="footer-bloom-col nav-col">
          <nav>
            <ul>
              <li>
                <Link href="/login">
                  Inicia sesión
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=reservar">
                  Reserva
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="footer-bloom-col info-col">
          <div className="footer-bloom-info">
            <p>Av. San Juan 77-Piso 1, Local 2, Chapultepec, 62450 Cuernavaca, Mor.</p>
            <p>
              <a href="mailto:info@bloomfisio.com" className="footer-bloom-link">
                info@bbloomfisio.com
              </a>
            </p>
            <div className="footer-bloom-socials">
              <a href="https://www.facebook.com/share/1CV1nbzusA/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="footer-bloom-social facebook"><FaFacebook /></a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="footer-bloom-social twitter"><FaTwitter /></a>
              <a href="https://instagram.com/bloom.fisiomx" target="_blank" rel="noopener noreferrer" className="footer-bloom-social instagram"><FaInstagram /></a>
              <a href="mailto:info@bloomfisio.com" className="footer-bloom-social email"><FaEnvelope /></a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bloom-bottom">
        <span>© 2024 Eventora Fisioterapia. Todos los derechos reservados.</span>
        <span>
          {" "}Creado por{" "}
          <a
            href="https://de-gante.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-bloom-link"
            style={{ fontWeight: "bold", color: "#8e44ad" }}
          >
            De Gante ® 
          </a>
        </span>
      </div>
    </footer>
  );
}

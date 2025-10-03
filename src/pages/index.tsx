import type { NextPage } from 'next'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import NuestrosServicios from '@/components/NuestrosServicios'
import AlbercaSection from '@/components/AlbercaSection'

const Home: NextPage = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const handleHero = (e: React.MouseEvent) => {
    e.preventDefault()
    if (session) router.push('/dashboard?tab=reservar')
    else router.push('/login')
  }

  return (
    <>
      <Head>
        <title>Bloom Fisio | Estimulación Acuática en Cuernavaca</title>
        <meta name="description" content="El refugio líder en estimulación acuática y fisioterapia en Cuernavaca. Alberca única, climatizada y segura para bebés y adultos." />
        <link rel="icon" href="/images/logo_bloom_clean.png" />
      </Head>
      {/* Navbar se inyecta globalmente */}

      {/* HERO */}
     <header className="bloom-hero">
  <div className="bloom-hero-flex">
    <div className="bloom-hero-photo left">
      <img src="/images/estimulación_acuatica_2.png" alt="Clase real en Bloom" className="bloom-polaroid" />
    </div>
    <div className="bloom-hero-content">
      <img src="/images/logo_bloom_clean.png" alt="Bloom Fisio Logo" className="bloom-hero-logo" />
      <h1 className="bloom-hero-title">
        Somos el centro líder en<br />
        <span className="bloom-highlight">estimulación temprana acuática</span> <br />
        y fisioterapia en Cuernavaca
      </h1>
      <button onClick={handleHero} className="bloom-hero-btn">
        Reserva tu cita ahora
      </button>
    </div>
    <div className="bloom-hero-photo right">
      <img src="/images/pool_baby_animated.png" alt="Fisioterapeuta y bebé en piscina" className="bloom-polaroid" />
    </div>
  </div>
</header>


      {/* NUESTROS SERVICIOS */}
      <section className="bloom-servicios">
        <NuestrosServicios />
      </section>

      {/* NUESTRA ALBERCA */}
      <AlbercaSection />

      {/* Newsletter */}
      <section className="bloom-newsletter">
        <h2>Recibe tips de bienestar y ofertas exclusivas</h2>
        <form className="newsletter-form">
          <input type="text" placeholder="Tu nombre" name="nombre" autoComplete="off" />
          <input type="email" placeholder="Tu correo" name="correo" autoComplete="off" />
          <button type="submit">Enviar</button>
        </form>
      </section>

      {/* Footer global lo inyecta _app.tsx */}
    </>
  )
}

export default Home

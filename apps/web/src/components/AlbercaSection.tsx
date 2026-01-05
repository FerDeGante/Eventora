import Image from "next/image";

export default function AlbercaSection() {
  return (
    <section className="bloom-alberca-section">
      <h2 className="bloom-section-title">Nuestra alberca</h2>
      <p className="bloom-alberca-desc">
        Única en Cuernavaca, climatizada, limpia y diseñada para estimular a los bebés.<br />
        Pioneros en estimulación en agua y cuidado en cada detalle para cuidamos bebés y niños.
      </p>
      <div className="bloom-alberca-photos">
        <div className="bloom-polaroid">
          <Image
            src="/images/alberca_hd_bloom.png"
            alt="Alberca Eventora"
            width={370}
            height={440}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              borderRadius: "inherit",
            }}
            priority
          />
        </div>
        <div className="bloom-polaroid">
          <Image
            src="/images/pool_baby_animated.png"
            alt="Bebé y terapeuta en piscina"
            width={370}
            height={440}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              borderRadius: "inherit",
            }}
            priority
          />
        </div>
      </div>
    </section>
  );
}

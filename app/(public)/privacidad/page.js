import Link from 'next/link'
import SiteHeader from '@/components/ui/SiteHeader'
import { POLITICA_VERSION, RESPONSABLE, SITE_NAME, SITE_URL } from '@/lib/sitio'

export const metadata = {
  title: `Política de tratamiento de datos — ${SITE_NAME}`,
  description: `Cómo ${SITE_NAME} recoge, usa y protege los datos personales, y cómo ejercer tus derechos.`,
}

// Política de tratamiento de datos personales según la Ley 1581 de 2012 y el Decreto 1377 de 2013
// (compilado en el Decreto 1074 de 2015). Los datos del responsable salen de lib/sitio.js.
export default function PrivacidadPage() {
  const fecha = new Date(`${POLITICA_VERSION}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-8 sm:pt-14">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Política de tratamiento de datos personales</h1>
        <p className="mt-3 text-sm text-ink-subtle">Vigente desde el {fecha}.</p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-ink-muted [&_h2]:text-lg [&_h2]:font-bold [&_h2]:tracking-[-0.01em] [&_h2]:text-ink [&_li]:mt-1.5 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
          <section>
            <h2>1. Quién es el responsable</h2>
            <p className="mt-2">{SITE_NAME} ({SITE_URL}) es un directorio de negocios de comida de Ciénaga, Magdalena. El responsable del tratamiento de los datos personales es <strong>{RESPONSABLE.nombre}</strong>, persona natural, como titular de este proyecto personal.</p>
            <ul>
              <li><strong>Domicilio:</strong> {RESPONSABLE.direccion}, {RESPONSABLE.ciudad}.</li>
              <li><strong>Correo:</strong> <a href={`mailto:${RESPONSABLE.correo}`} className="text-brand-dark underline">{RESPONSABLE.correo}</a></li>
              <li><strong>Teléfono y WhatsApp:</strong> {RESPONSABLE.telefono}</li>
            </ul>
            <p className="mt-2">Puedes usar cualquiera de estos medios para cualquier asunto relacionado con tus datos.</p>
          </section>

          <section>
            <h2>2. Qué datos recogemos</h2>
            <p className="mt-2"><strong>Si publicas un negocio</strong>, al registrarte nos das:</p>
            <ul>
              <li>Tu nombre, tu correo electrónico, una contraseña (guardada cifrada; nadie puede verla) y tu número de WhatsApp personal.</li>
              <li>Los datos del negocio: nombre, categoría, dirección, WhatsApp del negocio, horario, productos, fotos, carta, formas de pago, condiciones de domicilio y redes sociales.</li>
            </ul>
            <p className="mt-3"><strong>Si solo visitas la página</strong>, no te pedimos ningún dato personal. Usamos cookies técnicas solo para mantener abierta la sesión de los dueños de negocio.</p>
          </section>

          <section>
            <h2>3. Para qué los usamos</h2>
            <ul>
              <li>Crear y administrar tu cuenta, y permitirte recuperar el acceso si olvidas la contraseña.</li>
              <li>Publicar el perfil de tu negocio para que los clientes lo encuentren y te contacten.</li>
              <li>Comunicarnos contigo sobre tu cuenta o cambios importantes en el servicio.</li>
              <li>Cumplir obligaciones legales y atender solicitudes de autoridades competentes.</li>
            </ul>
            <p className="mt-3">No vendemos ni alquilamos tus datos personales.</p>
          </section>

          <section>
            <h2>4. Qué información es pública</h2>
            <p className="mt-2">El perfil del negocio es público por naturaleza: cualquier persona puede ver su nombre, dirección, horario, productos, fotos, carta, formas de pago, redes sociales y el <strong>WhatsApp del negocio</strong>. Tu nombre, tu correo y tu WhatsApp personal <strong>no</strong> se publican. Publica solo información que quieras que vean tus clientes.</p>
          </section>

          <section>
            <h2>5. Tus derechos</h2>
            <p className="mt-2">Como titular de los datos tienes derecho a:</p>
            <ul>
              <li>Conocer, actualizar y rectificar tus datos. Puedes hacerlo tú mismo desde el panel de tu negocio.</li>
              <li>Pedir prueba de la autorización que nos diste.</li>
              <li>Ser informado sobre el uso que les damos.</li>
              <li>Revocar la autorización y pedir que borremos tus datos, cuando no exista un deber legal de conservarlos. Puedes eliminar tu negocio desde el panel o escribirnos.</li>
              <li>Acceder gratis a tus datos.</li>
              <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley, después de haber agotado el trámite de consulta o reclamo con nosotros.</li>
            </ul>
          </section>

          <section>
            <h2>6. Cómo hacer una consulta o un reclamo</h2>
            <p className="mt-2">Escríbenos a <strong>{RESPONSABLE.correo}</strong> indicando tu nombre, el correo de tu cuenta y lo que solicitas.</p>
            <ul>
              <li><strong>Consultas</strong> (qué datos tenemos y cómo los usamos): respondemos en un máximo de 10 días hábiles.</li>
              <li><strong>Reclamos</strong> (corregir, actualizar, borrar o revocar): respondemos en un máximo de 15 días hábiles. Si el reclamo está incompleto, te pediremos lo que falte.</li>
            </ul>
          </section>

          <section>
            <h2>7. Dónde se guardan y quién nos ayuda</h2>
            <p className="mt-2">Para funcionar usamos proveedores que guardan y procesan los datos por cuenta nuestra: Supabase (base de datos, cuentas y archivos) y Vercel (alojamiento de la página). Sus servidores pueden estar fuera de Colombia. Al aceptar esta política autorizas esa transmisión, y exigimos a estos proveedores medidas de seguridad adecuadas.</p>
          </section>

          <section>
            <h2>8. Seguridad</h2>
            <p className="mt-2">Usamos conexiones cifradas, contraseñas cifradas y reglas de acceso para que solo el dueño de cada negocio pueda modificar su información. Ningún sistema es infalible; si detectamos un incidente que afecte tus datos, te lo informaremos.</p>
          </section>

          <section>
            <h2>9. Cuánto tiempo los guardamos</h2>
            <p className="mt-2">Mientras tu cuenta esté activa. Si eliminas tu negocio o nos pides borrar tus datos, los suprimimos, salvo lo que debamos conservar por obligación legal.</p>
          </section>

          <section>
            <h2>10. Cambios a esta política</h2>
            <p className="mt-2">Si cambiamos esta política te lo informaremos en la página o por correo. La fecha de arriba indica la versión vigente.</p>
          </section>
        </div>

        <p className="mt-12 text-sm text-ink-subtle"><Link href="/" className="font-semibold text-brand-dark hover:underline">Volver al inicio</Link></p>
      </main>
    </>
  )
}

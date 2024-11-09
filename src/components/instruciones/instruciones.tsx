import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function Instruciones() {
  return (
    <>
      <Accordion type="single" collapsible className="w-[544px]">
        <AccordionItem value="item-1">
          <AccordionTrigger>¿Para qué sirve esta aplicación?</AccordionTrigger>
          <AccordionContent>
            <ol className="list-outside list-none space-y-2">
              {/* text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]  */}
              <li>
                Esta aplicación fue creada para facilitar la gestión de
                servicios de PostgreSQL en Windows. Permite iniciar y detener
                las bases de datos de PostgreSQL según la versión que elijas.
                Además, ofrece la opción de editar fácilmente el tipo de inicio
                del servicio.
              </li>
              <li>
                Por defecto, cuando instalas PostgreSQL en Windows, el servicio
                se inicia automáticamente, lo cual, aunque no consuma muchos
                recursos, puede ser innecesario si no se utiliza constantemente.
                Esta herramienta te permite cambiar esa configuración y decidir
                cuándo quieres que el servicio se inicie, ahorrando así recursos
                del sistema.
              </li>
              <li>
                Es importante tener en cuenta que la aplicación debe ejecutarse
                como administrador para poder realizar estos cambios en los
                servicios del sistema.
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>
            ¿Cómo Utilizar la Aplicación? Guía Paso a Paso
          </AccordionTrigger>
          <AccordionContent>
            <ol className="list-outside pl-[25px] list-decimal space-y-2">
              <li>
                <span className="font-extrabold">
                  Inicia la aplicación como administrador.
                </span>
              </li>
              <li>
                Selecciona la versión de PostgreSQL que deseas iniciar, detener
                o configurar.
              </li>
              <li>
                Cambia el tipo de inicio a{' '}
                <span className="font-extrabold">Manual</span> si aun no lo
                hiciste, por defecto esta en{' '}
                <span className="font-extrabold">
                  Automático (Inicio retrasado)
                </span>
                .
              </li>
              <li>
                Para iniciar PostgreSQL, presiona el botón{' '}
                <span className="font-extrabold">Iniciar</span> , que ejecutará
                un comando como:{' '}
                <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
                  net start postgresql-x64-16
                </code>
                .
              </li>
              <li>
                Para detener PostgreSQL, presiona el botón{' '}
                <span className="font-extrabold">Apagar</span> , que ejecutará
                un comando como:{' '}
                <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
                  net stop postgresql-x64-16
                </code>
                . Aunque normalmente se detendría al apagar el equipo, esta
                opción te permite hacerlo manualmente.
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}

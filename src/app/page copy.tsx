'use client'

import { Footer } from '@/components/footer/footer'
import { Instruciones } from '@/components/instruciones/instruciones'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { invoke } from '@tauri-apps/api/core'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface Service {
  name: string
  status: string
}

type ApiResponse = {
  error: boolean
  contenido?: Service[]
  mensaje?: string
}

export default function Component() {
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState<string | null>(null)
  const [poperError, setPoperError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchServices = useCallback(async () => {
    try {
      const result = await invoke<ApiResponse>('get_postgresql_services')
      if (result.error) {
        setError(result.mensaje || 'Error desconocido')
      } else {
        setServices(result.contenido || [])
        setSelectedService((prevSelected) =>
          prevSelected
            ? result.contenido?.find((s) => s.name === prevSelected.name) ||
              null
            : null
        )
      }
    } catch {
      setError('Error en la comunicación con Tauri')
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const handleStartStop = async (action: 'start' | 'stop') => {
    if (!selectedService) {
      setPoperError('Debe seleccionar una versión de PostgreSQL.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response: ApiResponse = await invoke('manage_postgresql_service', {
        action,
        version: selectedService.name,
      })
      if (response.error) {
        setError(response.mensaje || 'Error desconocido')
      } else {
        await fetchServices()
      }
    } catch {
      setError('Error al comunicarse con Tauri')
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSelect = (serviceName: string) => {
    const service = services.find((s) => s.name === serviceName)
    setSelectedService((prevSelected) =>
      prevSelected?.name === serviceName ? null : service || null
    )
    setOpen(false)
    setPoperError(null) // Clear poperError when a service is selected
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-extrabold text-orange-500 drop-shadow-md">
          Controlador de PostgreSQL
        </h1>

        <div className="flex flex-col space-y-2">
          <label
            className={cn('text-sm font-medium leading-none', {
              'text-red-600': !!poperError === true,
            })}
          >
            Versión de PostgreSQL
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[320px] justify-between"
              >
                {selectedService
                  ? selectedService.name
                  : 'Seleccionar versión de PostgreSQL...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0">
              <Command>
                <CommandInput placeholder="Buscar versión..." />
                <CommandList>
                  <CommandEmpty>No se encontró ninguna versión.</CommandEmpty>
                  <CommandGroup>
                    {services.map((service) => (
                      <CommandItem
                        key={service.name}
                        value={service.name}
                        onSelect={handleServiceSelect}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedService?.name === service.name
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {service.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {poperError ? (
            <p className="text-sm text-red-600">{poperError}</p>
          ) : selectedService ? (
            <p
              className={`text-sm ${
                selectedService.status === '4  RUNNING'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              PostgreSQL versión {selectedService.name} está{' '}
              {selectedService.status === '4  RUNNING'
                ? 'iniciado'
                : 'detenido'}
              .
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Selecciona la versión de PostgreSQL que quieras utilizar o
              modificar.
            </p>
          )}
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button
            className="shadow-lg shadow-orange-500/50 rounded-full border border-solid border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            onClick={() => handleStartStop('start')}
            disabled={loading || selectedService?.status === '4  RUNNING'}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Esperando...
              </>
            ) : (
              'Iniciar'
            )}
          </Button>
          <Button
            variant="outline"
            className="shadow-lg rounded-full border border-solid text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44 bg-transparent border-black/[.08] dark:border-white/[.145] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent"
            onClick={() => handleStartStop('stop')}
            disabled={loading || selectedService?.status === '1  STOPPED'}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Esperando...
              </>
            ) : (
              'Apagar'
            )}
          </Button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Instruciones />
      </main>
      <Footer />
    </div>
  )
}

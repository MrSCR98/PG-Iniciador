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

type StartType =
  | 'Automático'
  | 'Manual'
  | 'Deshabilitado'
  | 'Automático (Inicio retrasado)'

export default function Component() {
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState<string | null>(null)
  const [poperError, setPoperError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [startTypeOpen, setStartTypeOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentStartType, setCurrentStartType] = useState<StartType | null>(
    null
  )
  const [selectedStartType, setSelectedStartType] = useState<StartType | null>(
    null
  )
  const [errorStartType, setErrorStartType] = useState<string | null>(null)

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

  const fetchStartType = useCallback(async () => {
    if (!selectedService) return

    try {
      const result = await invoke<string>('obtener_tipo_inicio_servicio', {
        servicio: selectedService.name,
      })
      const response = JSON.parse(result)
      if (!response.error) {
        const startType = response.mensaje.split(': ')[1] as StartType
        setCurrentStartType(startType)
        setSelectedStartType(startType)
      } else {
        setErrorStartType(
          response.mensaje || 'Error al obtener el tipo de inicio'
        )
      }
    } catch {
      setErrorStartType('Error en la comunicación con Tauri')
    }
  }, [selectedService])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  useEffect(() => {
    if (selectedService) {
      fetchStartType()
    }
  }, [selectedService, fetchStartType])

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
    setPoperError(null)
    setCurrentStartType(null)
    setSelectedStartType(null)
  }

  const handleStartTypeSelect = (startType: StartType) => {
    setSelectedStartType(startType)
    setStartTypeOpen(false)
  }

  const handleChangeStartType = async () => {
    if (!selectedService || !selectedStartType) return

    setLoading(true)
    setErrorStartType(null)

    try {
      const result = await invoke<string>('cambiar_tipo_inicio_servicio', {
        servicio: selectedService.name,
        tipo: selectedStartType,
      })
      const response = JSON.parse(result)
      if (response.error) {
        setErrorStartType(
          response.mensaje || 'Error al cambiar el tipo de inicio'
        )
      } else {
        setCurrentStartType(selectedStartType)
        setErrorStartType(null)
      }
    } catch {
      setErrorStartType('Error en la comunicación con Tauri')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 sm:pr-[65px] font-[family-name:var(--font-geist-sans)]">
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

        {selectedService && (
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium leading-none">
              Tipo de inicio
            </label>
            <div className="flex items-center space-x-2">
              <Popover open={startTypeOpen} onOpenChange={setStartTypeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={startTypeOpen}
                    className="w-[320px] justify-between"
                    disabled={!selectedService}
                  >
                    {selectedStartType || 'Seleccionar tipo...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar tipo..." />
                    <CommandList>
                      <CommandEmpty>No se encontró ningún tipo.</CommandEmpty>
                      <CommandGroup>
                        {(
                          [
                            'Automático',
                            'Manual',
                            'Deshabilitado',
                            'Automático (Inicio retrasado)',
                          ] as const
                        ).map((type) => (
                          <CommandItem
                            key={type}
                            value={type}
                            onSelect={() => handleStartTypeSelect(type)}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedStartType === type
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {type}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button
                onClick={handleChangeStartType}
                disabled={
                  !selectedStartType ||
                  selectedStartType === currentStartType ||
                  loading
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aplicando...
                  </>
                ) : (
                  'Aplicar'
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground max-w-[544px]">
              Configura esto en <span className="font-semibold">manual</span>
              {currentStartType ? (
                <>
                  , su estado actual es:{' '}
                  <span className="font-semibold text-green-600 text-sm">
                    {currentStartType}
                  </span>
                </>
              ) : (
                '.'
              )}
            </p>
            {errorStartType && (
              <p className="text-sm text-red-600">{errorStartType}</p>
            )}
          </div>
        )}

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button
            className="shadow-lg shadow-orange-500/50 rounded-full border border-solid border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            onClick={() => handleStartStop('start')}
            disabled={
              loading ||
              selectedService?.status === '4  RUNNING' ||
              !selectedService
            }
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
            disabled={
              loading ||
              selectedService?.status === '1  STOPPED' ||
              !selectedService
            }
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

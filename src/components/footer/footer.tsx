import { invoke } from '@tauri-apps/api/core'
import { Github } from 'lucide-react'
import { Button } from '../ui/button'

export function Footer() {
  // Función asíncrona para llamar a 'abrir_enlace' desde Tauri
  const handleOpenGitHub = async (value: string) => {
    try {
      await invoke('abrir_enlace', { url: value })
      console.log('Enlace a GitHub abierto')
    } catch (error) {
      console.error('Error al abrir enlace:', error)
    }
  }

  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      <Button
        variant="ghost"
        className="hover:bg-transparent group"
        onClick={() =>
          handleOpenGitHub('https://github.com/MrSCR98/PG-Iniciador')
        }
      >
        <Github className="w-4 h-4" />{' '}
        <span className="group-hover:underline underline-offset-2">
          Ir a GitHub →
        </span>
      </Button>
    </footer>
  )
}

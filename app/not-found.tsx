import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Página no encontrada</h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
          Lo sentimos, no pudimos encontrar la página que buscas. Es posible que haya sido movida o que la dirección sea incorrecta.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

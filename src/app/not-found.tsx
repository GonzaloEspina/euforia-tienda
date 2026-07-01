import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🗺️</p>
      <h1 className="text-2xl font-bold mb-2">Salida no encontrada</h1>
      <p className="text-euforia-muted mb-6">
        Esta salida no existe o ya no está disponible.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 rounded-xl bg-euforia-sky text-euforia-darker font-bold"
      >
        Volver al catálogo
      </Link>
    </div>
  );
}

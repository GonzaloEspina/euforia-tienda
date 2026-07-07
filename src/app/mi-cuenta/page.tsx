const WORDPRESS_ACCOUNT_URL = "https://viajaconeuforia.com/mi-cuenta/";

export default function MiCuentaPage() {
  return (
    <section className="flex flex-col min-h-[calc(100dvh-8rem)]">
      <div className="bg-white border-b border-sky-100 px-4 py-3 text-center">
        <h1 className="text-xl font-bold text-travel-ink">Mi cuenta</h1>
        <p className="text-sm text-travel-ink-muted">
          Ingresá o gestioná tu cuenta sin salir de la tienda
        </p>
      </div>
      <iframe
        title="Mi cuenta Euforia Viajes"
        src={WORDPRESS_ACCOUNT_URL}
        className="flex-1 w-full min-h-[70dvh] border-0 bg-white"
        loading="lazy"
      />
    </section>
  );
}

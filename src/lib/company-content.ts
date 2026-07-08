export const COMPANY = {
  legajo: "16816",
  phone: "+54 280 441-6228",
  phoneHref: "tel:+542804416228",
  email: "adm@viajaconeuforia.com",
  address: "Av. Fontana 243, Trelew",
  addressHref: "https://maps.google.com/?q=Av.+Fontana+243,+Trelew,+Chubut",
  hours: "09:00 – 17:00 hs",
  whatsapp: "5492804321400",
  social: {
    instagram: "https://www.instagram.com/euforiaviajestrelew/",
    facebook: "https://www.facebook.com/euforiaviajes",
  },
  mapEmbed:
    "https://maps.google.com/maps?q=Av.+Fontana+243,+Trelew,+Chubut&t=&z=15&ie=UTF8&iwloc=&output=embed",
} as const;

export const BANK_DETAILS = {
  holder: "ROLLFER SRL",
  cuit: "30-71536965-2",
  alias: "ROLLFER.MP",
  cvu: "0000003100000266413668",
  email: COMPANY.email,
} as const;

export const ABOUT_PARAGRAPHS = [
  "Nos complace presentarles Euforia Viajes, una agencia de turismo con sede en Trelew, Chubut, Argentina, debidamente registrada con el número de legajo 16816. Con una amplia presencia en la región, contamos con sucursales estratégicamente ubicadas en toda la provincia de Chubut y la provincia de Río Negro, lo que nos permite ofrecer una cobertura completa y servicios de alta calidad.",
  "Euforia Viajes se especializa en brindar experiencias únicas en hotelería y excursiones en Argentina. Nuestra empresa se distingue por organizar salidas grupales a destinos emblemáticos como Puerto Madryn, Bariloche, Esquel, Los Antiguos, Calafate, Ushuaia, Cataratas, Camboriú, Salta, Río Hondo, Mendoza, Ana Juan, La Rioja, San Luis, Buenos Aires y Carlos Paz, donde los viajeros pueden explorar la belleza natural y cultural de nuestro país de manera única y memorable.",
  "Nuestra base operativa se encuentra estratégicamente ubicada en la ciudad de Trelew, en la calle Fontana 243. Desde aquí, coordinamos y gestionamos meticulosamente cada detalle de los viajes, garantizando la satisfacción de nuestros clientes y la excelencia en cada experiencia.",
  "En Euforia Viajes, estamos comprometidos con ofrecer un servicio de primera clase, adaptado a las necesidades y expectativas de nuestros pasajeros. Nos enorgullece poder proporcionar soluciones integrales y personalizadas que aseguran que cada viaje sea una experiencia inolvidable.",
] as const;

export const BRANCHES = [
  {
    name: "Trelew",
    address: "Av. Fontana 243",
    mapQuery: "Av. Fontana 243, Trelew, Chubut",
  },
] as const;

export type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  subsections?: { title: string; bullets: string[] }[];
};

export const LEGAL_SECTIONS: LegalSection[] = [
  {
    title: "1. Servicios Incluidos",
    paragraphs: [
      "Transporte: Desde el punto de origen al punto de destino y regreso, en unidades con asientos reclinables, ventanilla panorámica, música funcional y aire acondicionado, cuando así lo especifique el programa contratado. Para excursiones y visitas locales, las características del vehículo podrán variar según disponibilidad.",
      "Alojamiento: En habitaciones con baño privado del tipo contratado (doble, triple o cuádruple), con impuestos incluidos. El alojamiento estará disponible a partir de las 14:00 hs. del día de llegada hasta las 10:00 hs. del día de salida.",
      "Desayuno y Comidas: Según lo especificado en cada programa. El organizador no se responsabiliza por la calidad, variedad o cantidad de los servicios de comida prestados por terceros.",
      "Excursiones: Las incluidas expresamente en el itinerario contratado. Cualquier excursión adicional será considerada un servicio extra y tendrá costo aparte.",
      "Guía y Asistencia: Cuando el programa lo contemple, se dispondrá de guía o acompañante de viaje durante el recorrido principal.",
    ],
  },
  {
    title: "2. Menores de Edad",
    paragraphs: [
      "Los menores de edad deberán viajar acompañados por al menos un adulto responsable. Los menores no abonarán tarifa de adulto únicamente cuando el programa contemple expresamente una tarifa diferencial para menores; de lo contrario, abonarán el precio completo y gozarán de todos los servicios incluidos.",
    ],
  },
  {
    title: "3. Equipaje",
    paragraphs: [
      "Cada pasajero podrá transportar hasta dos piezas de equipaje: una maleta de bodega de hasta 20 kg y un bolso de mano. El exceso de equipaje será aceptado únicamente si la capacidad del vehículo lo permite y podrá tener un costo adicional. El equipaje viaja por cuenta y riesgo exclusivo del pasajero.",
    ],
  },
  {
    title: "4. Documentación",
    paragraphs: [
      "La obtención y vigencia de toda documentación requerida para el viaje (DNI, pasaporte, visas, certificados de vacunación u otros) es responsabilidad exclusiva del pasajero. El organizador no asume ninguna responsabilidad por inconvenientes derivados de documentación incompleta, vencida o en mal estado.",
    ],
  },
  {
    title: "5. Alteraciones y Modificaciones del Itinerario",
    paragraphs: [
      "El organizador se reserva el derecho de modificar el orden del recorrido o reemplazar excursiones por otras de características similares, cuando circunstancias operativas o de fuerza mayor así lo requieran.",
    ],
  },
  {
    title: "6. Inscripción y Aceptación de Condiciones",
    paragraphs: [
      "Se considerará formalmente inscripto al pasajero una vez que haya efectuado el pago de la seña o acordado las condiciones de pago con el organizador. La inscripción implica la aceptación plena e incondicional de todas las cláusulas establecidas en las presentes Condiciones Generales.",
    ],
  },
  {
    title: "7. Cancelación por parte del Organizador",
    paragraphs: [
      "El organizador se reserva el derecho de cancelar cualquier salida cuando el número de inscriptos no sea suficiente para su realización, notificando al pasajero con una anticipación mínima de 7 (siete) días previos a la fecha de salida. En tal caso, el pasajero podrá optar por trasladarse a la próxima salida disponible con plazas, o bien recibir la devolución íntegra del importe abonado.",
    ],
  },
  {
    title: "8. Desistimiento por parte del Pasajero",
    paragraphs: ["Toda cancelación deberá ser notificada por escrito al organizador. Las penalidades aplicables son las siguientes:"],
    subsections: [
      {
        title: "Programas Grupales en Bus",
        bullets: [
          "Con más de 30 días de anticipación a la salida: retención del 10% (+ IVA) del valor total del viaje.",
          "Entre 30 y 16 días de anticipación: retención del 25% (+ IVA) del valor total.",
          "Entre 15 días y 72 horas de anticipación: retención del 50% (+ IVA) del valor total.",
          "Con menos de 72 horas de anticipación o sin aviso previo: retención del 100% del valor total.",
        ],
      },
      {
        title: "Programas Grupales Aéreos",
        bullets: [
          "Desde la fecha de seña hasta 45 días previos a la salida: se retiene la seña abonada (equivalente al 30% de la reserva).",
          "Entre 45 y 30 días previos a la salida: se cobra la tarifa aérea vigente informada por el organizador.",
          "Con menos de 30 días de anticipación: se cobra la tarifa aérea más las penalidades que apliquen los prestadores de servicios terrestres.",
        ],
      },
    ],
  },
  {
    title: "9. Reembolso",
    paragraphs: [
      "Toda reclamación de reembolso deberá ser presentada por escrito ante la agencia dentro de los 30 días corridos posteriores a la finalización del tour, acompañada de los comprobantes correspondientes. Vencido dicho plazo, no se atenderá reclamo alguno.",
    ],
  },
  {
    title: "10. Responsabilidad del Organizador",
    paragraphs: [
      "Euforia Viajes actúa como intermediario y organizador entre el pasajero y los prestadores de servicios. En tal carácter, el organizador no asume responsabilidad por deficiencias, incumplimientos, accidentes, retrasos, cancelaciones o cualquier irregularidad en los servicios prestados por terceros.",
    ],
  },
  {
    title: "11. Tarifas y Forma de Pago",
    paragraphs: [
      "Las tarifas publicadas están sujetas a variación sin previo aviso. Los pagos realizados mediante cheque tendrán un cargo administrativo del 2% sobre el monto total. Los pagos en efectivo, transferencia bancaria o tarjeta de débito no tienen cargo adicional, salvo que se indique lo contrario al momento de la cotización.",
    ],
  },
  {
    title: "12. Sin Deducciones por los Siguientes Conceptos",
    bullets: [
      "Cuando el pasajero no se presentara a la hora de inicio del tour o de cualquier excursión programada, por cualquier motivo.",
      "Cuando desperfectos técnicos impidieran el funcionamiento de servicios complementarios como baño, aire acondicionado, música, televisión u otros que no impliquen un cargo adicional al precio del viaje.",
    ],
    paragraphs: [],
  },
  {
    title: "13. Limitación al Derecho de Permanencia",
    paragraphs: [
      "El organizador se reserva el derecho de exigir el abandono del tour a cualquier pasajero cuya conducta, estado de salud u otra circunstancia represente un perjuicio para los demás pasajeros o comprometa el normal desarrollo del viaje.",
    ],
  },
  {
    title: "14. Condiciones para Servicios con Vuelos Aéreos",
    paragraphs: [
      "Al momento de contratar un paquete con vuelo incluido, el pasajero deberá abonar la totalidad del costo del transporte aéreo más la seña correspondiente a los servicios terrestres. Los boletos aéreos se emiten entre 30 y 45 días previos a la fecha de salida, según las condiciones de cada aerolínea.",
    ],
  },
  {
    title: "15. Documentación Requerida para Emisión de Boletos",
    paragraphs: [
      "Vuelos Internacionales: número de pasaporte, fecha de vencimiento y fecha de nacimiento del pasajero. Vuelos Domésticos: número de DNI, fecha de vencimiento y fecha de nacimiento del pasajero. La obtención de visados y cualquier otro requisito de ingreso al destino es responsabilidad exclusiva del pasajero.",
    ],
  },
  {
    title: "16. Jurisdicción",
    paragraphs: [
      "Para cualquier controversia derivada de la contratación de los servicios ofrecidos por Euforia Viajes, las partes se someten a la jurisdicción de los tribunales ordinarios de la ciudad de Trelew, Provincia del Chubut, renunciando a cualquier otro fuero que pudiera corresponder.",
    ],
  },
];

export const LEGAL_NOTICE =
  "Euforia Viajes — Leg. 16816 | Vigencia: 01/10/2024 — Sujeto a variación sin previo aviso.";

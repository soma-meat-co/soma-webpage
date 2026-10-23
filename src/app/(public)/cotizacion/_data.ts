export const steps = ["Producto", "Cortes", "Volumen", "Contacto"];

export const especies = [
  { icon: "🐑", name: "Cordero / Ovino", desc: "Canal entera y todos los cortes de cordero" },
  { icon: "🐂", name: "Res / Bovino", desc: "Cortes premium de res bajo TIF 422" },
  { icon: "🐖", name: "Cerdo / Porcino", desc: "Procesamiento completo porcino TIF" },
  { icon: "🐓", name: "Ave / Pollo", desc: "Línea avícola con estándares TIF" },
];

export const certificaciones: { name: string; sub: string; color: string }[] = [
  { name: "TIF 845", sub: "Siempre incluido", color: "#AC1F25" },
  { name: "Kosher", sub: "Bajo solicitud", color: "#3C2415" },
  { name: "Halal", sub: "Bajo solicitud", color: "#006644" },
];

export const cortesData = [
  {
    cat: "Canal",
    items: [
      { e: "🐑", n: "Canal Entera", w: "8–16 kg" },
      { e: "🐑", n: "Media Canal", w: "4–8 kg" },
    ],
  },
  {
    cat: "Pierna y Paleta",
    items: [
      { e: "🍖", n: "Pierna", w: "1.5–3 kg" },
      { e: "🍖", n: "Paleta C/Hueso", w: "1–2 kg" },
      { e: "🥩", n: "Paleta S/Hueso", w: "700g–1.5 kg" },
    ],
  },
  {
    cat: "Costillar",
    items: [
      { e: "🥩", n: "Rack / Frenched", w: "600g–1.2 kg" },
      { e: "🥩", n: "Costillar", w: "700g–1.5 kg" },
    ],
  },
  {
    cat: "Lomo y Más",
    items: [
      { e: "🥩", n: "Lomo", w: "400–800g" },
      { e: "🍖", n: "Chamorro", w: "300–600g" },
      { e: "🦴", n: "Cuello", w: "400–700g" },
      { e: "✏️", n: "A Especificación", w: "Personalizado" },
    ],
  },
];

export const freqs = ["Pedido único", "Semanal", "Quincenal", "Mensual"];
export const empaques = ["Al Vacío", "A Granel", "Sin preferencia"];
export const tiposCliente = [
  "Restaurante / Hotel",
  "Supermercado / Tienda",
  "Distribuidor / Mayorista",
  "Exportador / Importador",
  "Carnicería",
  "Catering",
  "Consumidor final",
];

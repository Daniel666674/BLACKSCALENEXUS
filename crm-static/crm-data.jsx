// CRM Data Layer - Seed data + Google Sheet integration
const CRM_SEED_CONTACTS = [
  { id: "c1", name: "María García", email: "maria@techstartup.mx", phone: "+52 55 1234 5678", company: "TechStartup MX", source: "website", temperature: "hot", score: 85, notes: "Interesada en plan empresarial. Tiene equipo de 15 personas.", createdAt: Date.now() - 5*86400000, updatedAt: Date.now() - 86400000 },
  { id: "c2", name: "Carlos Rodríguez", email: "carlos@inmobiliaria.com", phone: "+52 33 9876 5432", company: "Inmobiliaria Rodríguez", source: "referido", temperature: "warm", score: 60, notes: "Referido por Juan. Busca automatizar seguimiento de clientes.", createdAt: Date.now() - 10*86400000, updatedAt: Date.now() - 3*86400000 },
  { id: "c3", name: "Ana Martínez", email: "ana@consultoria.mx", phone: "+52 81 5555 1234", company: "Martínez Consultores", source: "redes_sociales", temperature: "warm", score: 55, notes: "Nos contactó por LinkedIn. Consultoría de RRHH.", createdAt: Date.now() - 7*86400000, updatedAt: Date.now() - 2*86400000 },
  { id: "c4", name: "Roberto Sánchez", email: "roberto@tienda.com", phone: "+52 55 7777 8888", company: "Tienda en Línea SA", source: "formulario", temperature: "cold", score: 25, notes: "Llenó formulario web. E-commerce de ropa.", createdAt: Date.now() - 15*86400000, updatedAt: Date.now() - 15*86400000 },
  { id: "c5", name: "Laura Hernández", email: "laura@agencia.mx", phone: "+52 33 4444 5555", company: "Agencia Creativa", source: "evento", temperature: "hot", score: 90, notes: "Conocida en evento de networking. Muy interesada, pidió demo inmediata.", createdAt: Date.now() - 3*86400000, updatedAt: Date.now() },
  { id: "c6", name: "Diego Flores", email: "diego@logistica.mx", phone: "+52 55 2222 3333", company: "LogiMex", source: "llamada_fria", temperature: "cold", score: 15, notes: "Llamada fría. No mostró mucho interés inicial.", createdAt: Date.now() - 20*86400000, updatedAt: Date.now() - 18*86400000 },
  { id: "c7", name: "Sofía Ramírez", email: "sofia@dental.mx", phone: "+52 81 6666 7777", company: "Dental Premium", source: "whatsapp", temperature: "warm", score: 45, notes: "Escribió por WhatsApp preguntando precios.", createdAt: Date.now() - 12*86400000, updatedAt: Date.now() - 5*86400000 },
];

const CRM_SEED_STAGES = [
  { id: "s1", name: "Nuevo", order: 0, color: "#64748b", isWon: false, isLost: false },
  { id: "s2", name: "Contactado", order: 1, color: "#3b82f6", isWon: false, isLost: false },
  { id: "s3", name: "Propuesta", order: 2, color: "#a855f7", isWon: false, isLost: false },
  { id: "s4", name: "Negociación", order: 3, color: "#f59e0b", isWon: false, isLost: false },
  { id: "s5", name: "Ganado", order: 4, color: "#22c55e", isWon: true, isLost: false },
  { id: "s6", name: "Perdido", order: 5, color: "#ef4444", isWon: false, isLost: true },
];

const CRM_SEED_DEALS = [
  { id: "d1", title: "Plan Empresarial - TechStartup", value: 25000000, stageId: "s3", contactId: "c1", expectedClose: Date.now() + 15*86400000, probability: 70, notes: "Enviamos propuesta. Esperando respuesta del director.", createdAt: Date.now() - 4*86400000 },
  { id: "d2", title: "CRM Personalizado - Inmobiliaria", value: 18000000, stageId: "s2", contactId: "c2", expectedClose: Date.now() + 30*86400000, probability: 40, notes: "Primera llamada realizada. Agendamos demo.", createdAt: Date.now() - 8*86400000 },
  { id: "d3", title: "Servicio Premium - Agencia Creativa", value: 45000000, stageId: "s4", contactId: "c5", expectedClose: Date.now() + 7*86400000, probability: 85, notes: "Negociando precio. Muy probable que cierre esta semana.", createdAt: Date.now() - 2*86400000 },
  { id: "d4", title: "Paquete Básico - Dental Premium", value: 7500000, stageId: "s1", contactId: "c7", expectedClose: Date.now() + 45*86400000, probability: 20, notes: "Lead inicial, necesita más información.", createdAt: Date.now() - 6*86400000 },
  { id: "d5", title: "Consultoría RRHH - Martínez", value: 32000000, stageId: "s3", contactId: "c3", expectedClose: Date.now() + 20*86400000, probability: 55, notes: "Propuesta enviada por email.", createdAt: Date.now() - 5*86400000 },
];

const CRM_SEED_ACTIVITIES = [
  { id: "a1", type: "email", description: "Envío de propuesta comercial con pricing y features del plan empresarial.", contactId: "c1", dealId: "d1", scheduledAt: null, completedAt: Date.now() - 2*86400000, createdAt: Date.now() - 2*86400000 },
  { id: "a2", type: "call", description: "Llamada de introducción. Carlos mostró interés en automatizar su proceso.", contactId: "c2", dealId: "d2", scheduledAt: null, completedAt: Date.now() - 5*86400000, createdAt: Date.now() - 5*86400000 },
  { id: "a3", type: "meeting", description: "Reunión presencial en evento de networking. Intercambiamos tarjetas.", contactId: "c5", dealId: "d3", scheduledAt: null, completedAt: Date.now() - 3*86400000, createdAt: Date.now() - 3*86400000 },
  { id: "a4", type: "follow_up", description: "Dar seguimiento a María sobre la propuesta enviada.", contactId: "c1", dealId: "d1", scheduledAt: Date.now() + 86400000, completedAt: null, createdAt: Date.now() },
  { id: "a5", type: "follow_up", description: "Agendar demo con Carlos para mostrar el CRM personalizado.", contactId: "c2", dealId: "d2", scheduledAt: Date.now() + 3*86400000, completedAt: null, createdAt: Date.now() },
  { id: "a6", type: "note", description: "Roberto parece no estar listo para comprar. Agregar a newsletter.", contactId: "c4", dealId: null, scheduledAt: null, completedAt: Date.now() - 10*86400000, createdAt: Date.now() - 10*86400000 },
  { id: "a7", type: "call", description: "Llamada de seguimiento con Ana. Pidió más detalles sobre integraciones.", contactId: "c3", dealId: "d5", scheduledAt: null, completedAt: Date.now() - 4*86400000, createdAt: Date.now() - 4*86400000 },
  { id: "a8", type: "email", description: "Envío de brochure digital a Sofía con planes y precios.", contactId: "c7", dealId: "d4", scheduledAt: null, completedAt: Date.now() - 8*86400000, createdAt: Date.now() - 8*86400000 },
];

// Next Steps per contact (AI-suggested)
const CRM_NEXT_STEPS = {
  c1: [
    { id: "ns1", text: "Llamar para resolver dudas sobre la propuesta", priority: "high", dueDate: Date.now() + 86400000 },
    { id: "ns2", text: "Enviar caso de éxito de empresa similar", priority: "medium", dueDate: Date.now() + 2*86400000 },
  ],
  c2: [
    { id: "ns3", text: "Preparar demo personalizada", priority: "high", dueDate: Date.now() + 3*86400000 },
    { id: "ns4", text: "Enviar video tutorial del CRM", priority: "low", dueDate: Date.now() + 5*86400000 },
  ],
  c3: [
    { id: "ns5", text: "Compartir documentación de integraciones", priority: "medium", dueDate: Date.now() + 2*86400000 },
  ],
  c4: [
    { id: "ns6", text: "Agregar a campaña de nurturing por email", priority: "low", dueDate: Date.now() + 30*86400000 },
  ],
  c5: [
    { id: "ns7", text: "Cerrar negociación — enviar contrato final", priority: "high", dueDate: Date.now() + 2*86400000 },
    { id: "ns8", text: "Agendar onboarding para la próxima semana", priority: "medium", dueDate: Date.now() + 7*86400000 },
  ],
  c7: [
    { id: "ns9", text: "Follow-up por WhatsApp con precios actualizados", priority: "medium", dueDate: Date.now() + 4*86400000 },
  ],
};

// Google Sheets integration
const SHEET_CONFIG = {
  sheetUrl: "",
  sheetId: "",
  isConnected: false,
  lastSync: null,
};

function parseGoogleSheetUrl(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function fetchSheetData(sheetId) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const cols = json.table.cols.map(c => c.label);
    const rows = json.table.rows.map(r => {
      const obj = {};
      r.c.forEach((cell, i) => {
        obj[cols[i] || `col${i}`] = cell ? (cell.v || "") : "";
      });
      return obj;
    });
    return rows;
  } catch (e) {
    console.error("Sheet fetch error:", e);
    return null;
  }
}

function mapSheetRowToContact(row, index) {
  const name = row.nombre || row.name || row.Name || row.Nombre || "";
  const email = row.email || row.Email || row.correo || row.Correo || "";
  const phone = row.phone || row.Phone || row.telefono || row.Telefono || row["teléfono"] || "";
  const company = row.company || row.Company || row.empresa || row.Empresa || "";
  const source = row.source || row.fuente || row.Source || row.Fuente || "otro";
  const temp = row.temperature || row.temperatura || "cold";
  if (!name) return null;
  return {
    id: `sheet-${index}`,
    name, email, phone, company,
    source: source.toLowerCase().replace(/ /g, "_"),
    temperature: temp.toLowerCase().includes("cal") ? "hot" : temp.toLowerCase().includes("tib") ? "warm" : "cold",
    score: parseInt(row.score || row.Score || "0") || Math.floor(Math.random() * 60 + 10),
    notes: row.notes || row.notas || row.Notes || "",
    createdAt: Date.now() - Math.floor(Math.random() * 20) * 86400000,
    updatedAt: Date.now(),
  };
}

// CRM Store (React context)
const CRMContext = React.createContext(null);

function CRMProvider({ children }) {
  const [contacts, setContacts] = React.useState(CRM_SEED_CONTACTS);
  const [deals, setDeals] = React.useState(CRM_SEED_DEALS);
  const [stages] = React.useState(CRM_SEED_STAGES);
  const [activities, setActivities] = React.useState(CRM_SEED_ACTIVITIES);
  const [nextSteps, setNextSteps] = React.useState(CRM_NEXT_STEPS);
  const [sheetConfig, setSheetConfig] = React.useState(SHEET_CONFIG);

  const connectSheet = React.useCallback(async (url) => {
    const sheetId = parseGoogleSheetUrl(url);
    if (!sheetId) return { success: false, error: "URL inválida" };
    const rows = await fetchSheetData(sheetId);
    if (!rows) return { success: false, error: "No se pudo acceder a la hoja" };
    const newContacts = rows.map(mapSheetRowToContact).filter(Boolean);
    if (newContacts.length > 0) {
      setContacts(prev => [...prev, ...newContacts]);
    }
    setSheetConfig({ sheetUrl: url, sheetId, isConnected: true, lastSync: Date.now() });
    return { success: true, count: newContacts.length };
  }, []);

  const addContact = React.useCallback((contact) => {
    const newContact = { ...contact, id: `c${Date.now()}`, createdAt: Date.now(), updatedAt: Date.now() };
    setContacts(prev => [newContact, ...prev]);
    return newContact;
  }, []);

  const updateContact = React.useCallback((id, updates) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c));
  }, []);

  const deleteContact = React.useCallback((id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setDeals(prev => prev.filter(d => d.contactId !== id));
    setActivities(prev => prev.filter(a => a.contactId !== id));
  }, []);

  const addDeal = React.useCallback((deal) => {
    const newDeal = { ...deal, id: `d${Date.now()}`, createdAt: Date.now() };
    setDeals(prev => [newDeal, ...prev]);
    return newDeal;
  }, []);

  const moveDeal = React.useCallback((dealId, stageId) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stageId } : d));
  }, []);

  const addActivity = React.useCallback((activity) => {
    const newActivity = { ...activity, id: `a${Date.now()}`, createdAt: Date.now() };
    setActivities(prev => [newActivity, ...prev]);
    return newActivity;
  }, []);

  const completeActivity = React.useCallback((id) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, completedAt: Date.now() } : a));
  }, []);

  const value = {
    contacts, deals, stages, activities, nextSteps, sheetConfig,
    addContact, updateContact, deleteContact,
    addDeal, moveDeal,
    addActivity, completeActivity,
    connectSheet,
  };

  return React.createElement(CRMContext.Provider, { value }, children);
}

function useCRM() {
  return React.useContext(CRMContext);
}

// Helpers
function formatCRM(cents) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(cents);
}

function formatDateCRM(ts) {
  if (!ts) return "-";
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(new Date(ts));
}

function formatRelative(ts) {
  const diff = Math.floor((Date.now() - ts) / 86400000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff < 7) return `Hace ${diff} días`;
  if (diff < 30) return `Hace ${Math.floor(diff / 7)} sem`;
  return formatDateCRM(ts);
}

function daysUntil(ts) {
  return Math.ceil((ts - Date.now()) / 86400000);
}

const SOURCE_LABELS_CRM = {
  website: "Sitio web", whatsapp: "WhatsApp", referido: "Referido",
  redes_sociales: "Redes sociales", llamada_fria: "Llamada fría",
  email: "Email", formulario: "Formulario", evento: "Evento",
  import: "Importado", webhook: "Webhook", otro: "Otro",
};

const ACTIVITY_ICONS = { call: "📞", email: "✉️", meeting: "👥", note: "📝", follow_up: "⏰" };
const ACTIVITY_LABELS = { call: "Llamada", email: "Email", meeting: "Reunión", note: "Nota", follow_up: "Seguimiento" };

Object.assign(window, {
  CRMProvider, useCRM, CRMContext,
  formatCRM, formatDateCRM, formatRelative, daysUntil,
  SOURCE_LABELS_CRM, ACTIVITY_ICONS, ACTIVITY_LABELS,
  CRM_SEED_CONTACTS, CRM_SEED_STAGES, CRM_SEED_DEALS, CRM_SEED_ACTIVITIES,
});

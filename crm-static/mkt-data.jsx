// Marketing Data Layer — Brevo-enriched contacts, campaigns, segments
const MKT_CONTACTS = [
  { id: "c1", name: "María García", company: "TechStartup MX", email: "maria@techstartup.mx", phone: "+57 310 123 4567", source: "website", tier: 1, temperature: "hot", score: 85, brevo_cadence: "Onboarding Premium", engagement_status: "hot", email_opens: 8, email_clicks: 3, lead_source_detail: "Blog post CTA", marketing_notes: "Muy activa, abre todos los emails", ready_for_sales: true, passed_to_sales_at: null, industry: "Tecnología", lastActivity: Date.now() - 1*86400000 },
  { id: "c2", name: "Carlos Rodríguez", company: "Inmobiliaria Rodríguez", email: "carlos@inmobiliaria.com", phone: "+57 311 987 6543", source: "referido", tier: 1, temperature: "warm", score: 60, brevo_cadence: "Nurturing B2B", engagement_status: "warm", email_opens: 1, email_clicks: 0, lead_source_detail: "Referido por Juan López", marketing_notes: "Abrió email pero no hizo click", ready_for_sales: false, passed_to_sales_at: null, industry: "Inmobiliaria", lastActivity: Date.now() - 3*86400000 },
  { id: "c3", name: "Ana Martínez", company: "Martínez Consultores", email: "ana@consultoria.mx", phone: "+57 312 555 1234", source: "redes_sociales", tier: 2, temperature: "warm", score: 55, brevo_cadence: "LinkedIn Outreach", engagement_status: "warm", email_opens: 2, email_clicks: 0, lead_source_detail: "LinkedIn DM", marketing_notes: "Respondió en LinkedIn, no en email", ready_for_sales: false, passed_to_sales_at: null, industry: "Consultoría", lastActivity: Date.now() - 2*86400000 },
  { id: "c4", name: "Roberto Sánchez", company: "Tienda en Línea SA", email: "roberto@tienda.com", phone: "+57 313 777 8888", source: "formulario", tier: 3, temperature: "cold", score: 25, brevo_cadence: "Cold Welcome", engagement_status: "cold", email_opens: 0, email_clicks: 0, lead_source_detail: "Formulario web genérico", marketing_notes: "Sin engagement, posible email incorrecto", ready_for_sales: false, passed_to_sales_at: null, industry: "E-commerce", lastActivity: Date.now() - 15*86400000 },
  { id: "c5", name: "Laura Hernández", company: "Agencia Creativa", email: "laura@agencia.mx", phone: "+57 314 444 5555", source: "evento", tier: 1, temperature: "hot", score: 90, brevo_cadence: "Event Follow-up", engagement_status: "hot", email_opens: 12, email_clicks: 5, lead_source_detail: "Networking Bogotá 2026", marketing_notes: "Super engaged, pidió demo", ready_for_sales: true, passed_to_sales_at: null, industry: "Marketing", lastActivity: Date.now() - 0.5*86400000 },
  { id: "c6", name: "Diego Flores", company: "LogiMex", email: "diego@logistica.mx", phone: "+57 315 222 3333", source: "llamada_fria", tier: 3, temperature: "cold", score: 15, brevo_cadence: "Cold Welcome", engagement_status: "dead", email_opens: 0, email_clicks: 0, lead_source_detail: "Lista comprada", marketing_notes: "Bounced — email inválido", ready_for_sales: false, passed_to_sales_at: null, industry: "Logística", lastActivity: Date.now() - 20*86400000 },
  { id: "c7", name: "Sofía Ramírez", company: "Dental Premium", email: "sofia@dental.mx", phone: "+57 316 666 7777", source: "whatsapp", tier: 2, temperature: "warm", score: 45, brevo_cadence: "WhatsApp Nurture", engagement_status: "warm", email_opens: 1, email_clicks: 0, lead_source_detail: "WhatsApp Business", marketing_notes: "Preguntó precios por WA", ready_for_sales: false, passed_to_sales_at: null, industry: "Salud", lastActivity: Date.now() - 5*86400000 },
  { id: "c8", name: "Valentina Torres", company: "FoodTech CO", email: "val@foodtech.co", phone: "+57 317 111 2222", source: "redes_sociales", tier: 1, temperature: "hot", score: 78, brevo_cadence: "LinkedIn Outreach", engagement_status: "hot", email_opens: 6, email_clicks: 2, lead_source_detail: "Instagram Ad", marketing_notes: "Interactuó con 3 posts + abrió emails", ready_for_sales: true, passed_to_sales_at: null, industry: "Alimentos", lastActivity: Date.now() - 1*86400000 },
  { id: "c9", name: "Andrés Mejía", company: "FinPro Solutions", email: "andres@finpro.co", phone: "+57 318 333 4444", source: "website", tier: 2, temperature: "cold", score: 30, brevo_cadence: "Onboarding Premium", engagement_status: "cold", email_opens: 0, email_clicks: 0, lead_source_detail: "Google Ads", marketing_notes: "Registró pero nunca abrió nada", ready_for_sales: false, passed_to_sales_at: null, industry: "Finanzas", lastActivity: Date.now() - 12*86400000 },
  { id: "c10", name: "Camila Restrepo", company: "EduTech Latam", email: "camila@edutech.co", phone: "+57 319 555 6666", source: "evento", tier: 1, temperature: "hot", score: 82, brevo_cadence: "Event Follow-up", engagement_status: "hot", email_opens: 5, email_clicks: 4, lead_source_detail: "Webinar Marzo 2026", marketing_notes: "Asistió al webinar completo, hizo preguntas", ready_for_sales: true, passed_to_sales_at: null, industry: "Educación", lastActivity: Date.now() - 2*86400000 },
  { id: "c11", name: "Felipe Castillo", company: "BuildCO", email: "felipe@buildco.com", phone: "+57 320 888 9999", source: "referido", tier: 2, temperature: "cold", score: 35, brevo_cadence: "Nurturing B2B", engagement_status: "dead", email_opens: 0, email_clicks: 0, lead_source_detail: "Referido por partner", marketing_notes: "Unsubscribed del newsletter", ready_for_sales: false, passed_to_sales_at: null, industry: "Construcción", lastActivity: Date.now() - 25*86400000 },
  { id: "c12", name: "Isabella Vargas", company: "MedPlus", email: "isabella@medplus.co", phone: "+57 321 444 1111", source: "formulario", tier: 2, temperature: "warm", score: 50, brevo_cadence: "Cold Welcome", engagement_status: "warm", email_opens: 2, email_clicks: 0, lead_source_detail: "Landing page salud", marketing_notes: "Abrió 2 emails, no clickeó", ready_for_sales: false, passed_to_sales_at: null, industry: "Salud", lastActivity: Date.now() - 4*86400000 },
];

const MKT_CAMPAIGNS = [
  { id: "camp1", name: "Onboarding Premium Q1", status: "active", startDate: Date.now() - 45*86400000, targetSegment: "Tier 1 - Tecnología", cadenceType: "onboarding", openRate: 42, clickRate: 18, replyRate: 8, totalContacts: 34, conversions: 5, lastSent: Date.now() - 2*86400000 },
  { id: "camp2", name: "LinkedIn Outreach - Latam", status: "active", startDate: Date.now() - 30*86400000, targetSegment: "Tier 1+2 - Todos", cadenceType: "outreach", openRate: 35, clickRate: 12, replyRate: 5, totalContacts: 87, conversions: 8, lastSent: Date.now() - 1*86400000 },
  { id: "camp3", name: "Nurturing B2B - Inmobiliarias", status: "active", startDate: Date.now() - 60*86400000, targetSegment: "Tier 2 - Inmobiliaria", cadenceType: "nurturing", openRate: 22, clickRate: 6, replyRate: 2, totalContacts: 156, conversions: 3, lastSent: Date.now() - 3*86400000 },
  { id: "camp4", name: "Cold Welcome Series", status: "active", startDate: Date.now() - 90*86400000, targetSegment: "Tier 3 - Todos", cadenceType: "welcome", openRate: 11, clickRate: 2, replyRate: 0.5, totalContacts: 412, conversions: 2, lastSent: Date.now() - 1*86400000 },
  { id: "camp5", name: "Event Follow-up Bogotá", status: "completed", startDate: Date.now() - 20*86400000, targetSegment: "Evento - Networking", cadenceType: "event", openRate: 58, clickRate: 28, replyRate: 15, totalContacts: 23, conversions: 7, lastSent: Date.now() - 10*86400000 },
  { id: "camp6", name: "WhatsApp Nurture Pilot", status: "paused", startDate: Date.now() - 15*86400000, targetSegment: "Tier 2 - WhatsApp", cadenceType: "whatsapp", openRate: 65, clickRate: 22, replyRate: 18, totalContacts: 45, conversions: 4, lastSent: Date.now() - 8*86400000 },
  { id: "camp7", name: "Webinar Marzo - Automación", status: "completed", startDate: Date.now() - 25*86400000, targetSegment: "Todos los tiers", cadenceType: "event", openRate: 48, clickRate: 32, replyRate: 12, totalContacts: 67, conversions: 9, lastSent: Date.now() - 15*86400000 },
  { id: "camp8", name: "Re-engagement Q1", status: "active", startDate: Date.now() - 10*86400000, targetSegment: "Cold leads 60+ días", cadenceType: "reengagement", openRate: 8, clickRate: 1, replyRate: 0, totalContacts: 230, conversions: 0, lastSent: Date.now() - 2*86400000 },
];

const MKT_INDUSTRIES = ["Tecnología", "Inmobiliaria", "Consultoría", "E-commerce", "Marketing", "Logística", "Salud", "Alimentos", "Finanzas", "Educación", "Construcción"];
const MKT_TIERS = [1, 2, 3];
const MKT_SOURCES = ["website", "referido", "redes_sociales", "formulario", "evento", "llamada_fria", "whatsapp"];

const MKT_SOURCE_LABELS = {
  website: "Sitio Web", referido: "Referido", redes_sociales: "Redes Sociales",
  formulario: "Formulario", evento: "Evento", llamada_fria: "Llamada Fría", whatsapp: "WhatsApp",
};

// Marketing context
const MarketingContext = React.createContext(null);

function MarketingProvider({ children }) {
  const [contacts, setContacts] = React.useState(MKT_CONTACTS);
  const [campaigns, setCampaigns] = React.useState(MKT_CAMPAIGNS);
  const [notifications, setNotifications] = React.useState([]);

  const updateEngagement = React.useCallback((contactId, status) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, engagement_status: status } : c));
  }, []);

  const passToSales = React.useCallback((contactId) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ready_for_sales: true, passed_to_sales_at: Date.now() } : c));
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setNotifications(prev => [...prev, { id: `n${Date.now()}`, text: `${contact.name} enviado a pipeline de ventas`, time: Date.now() }]);
    }
  }, [contacts]);

  const addContact = React.useCallback((contact) => {
    const newContact = {
      ...contact, id: `c${Date.now()}`, score: contact.tier === 1 ? 60 : contact.tier === 2 ? 35 : 15,
      engagement_status: "cold", email_opens: 0, email_clicks: 0, ready_for_sales: false,
      passed_to_sales_at: null, lastActivity: Date.now(), temperature: "cold",
    };
    setContacts(prev => [newContact, ...prev]);
    return newContact;
  }, []);

  const addCampaign = React.useCallback((campaign) => {
    const newCamp = {
      ...campaign, id: `camp${Date.now()}`, openRate: 0, clickRate: 0, replyRate: 0,
      conversions: 0, lastSent: null,
    };
    setCampaigns(prev => [newCamp, ...prev]);
    return newCamp;
  }, []);

  const value = {
    contacts, campaigns, notifications,
    updateEngagement, passToSales, addContact, addCampaign,
  };

  return React.createElement(MarketingContext.Provider, { value }, children);
}

function useMarketing() {
  return React.useContext(MarketingContext);
}

// Helpers
function mktFormatCOP(val) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);
}

Object.assign(window, {
  MarketingProvider, useMarketing, MarketingContext,
  MKT_CONTACTS, MKT_CAMPAIGNS, MKT_INDUSTRIES, MKT_TIERS, MKT_SOURCES, MKT_SOURCE_LABELS,
  mktFormatCOP,
});

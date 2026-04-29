// Marketing Data Layer — real data from Brevo
const MKT_CONTACTS_SEED = [];
const MKT_CAMPAIGNS_SEED = [];

const MKT_INDUSTRIES = ["Tecnología","Inmobiliaria","Consultoría","E-commerce","Marketing","Logística","Salud","Alimentos","Finanzas","Educación","Construcción","Seguros","SaaS","Otro"];
const MKT_TIERS      = [1, 2, 3];
const MKT_SOURCES    = ["website","referido","redes_sociales","formulario","evento","llamada_fria","whatsapp","email","otro"];
const MKT_SOURCE_LABELS = {
  website:"Sitio Web", referido:"Referido", redes_sociales:"Redes Sociales",
  formulario:"Formulario", evento:"Evento", llamada_fria:"Llamada Fría",
  whatsapp:"WhatsApp", email:"Email", otro:"Otro",
};

function mapBrevoToMktContact(b, index) {
  const attrs = b.attributes || {};
  const name  = [attrs.FIRSTNAME, attrs.LASTNAME].filter(Boolean).join(" ") || b.email.split("@")[0];
  const score = parseInt(attrs.SCORE || "0") || 15;
  return {
    id:               `m${b.id || index}`,
    name,
    email:            b.email || "",
    phone:            attrs.SMS || attrs.PHONE || "",
    company:          attrs.COMPANY || attrs.EMPRESA || "",
    source:           (attrs.SOURCE || "otro").toLowerCase().replace(/ /g,"_"),
    tier:             parseInt(attrs.TIER || "3") || 3,
    temperature:      attrs.TEMPERATURE || "cold",
    score,
    brevo_cadence:    attrs.CADENCE || attrs.CADENCIA || "Cold Welcome",
    engagement_status: score >= 70 ? "hot" : score >= 40 ? "warm" : score >= 15 ? "cold" : "dead",
    email_opens:      parseInt(attrs.EMAIL_OPENS || "0") || 0,
    email_clicks:     parseInt(attrs.EMAIL_CLICKS || "0") || 0,
    lead_source_detail: attrs.SOURCE_DETAIL || "",
    marketing_notes:  attrs.NOTES || attrs.NOTAS || "",
    ready_for_sales:  attrs.READY_FOR_SALES === "true" || false,
    passed_to_sales_at: null,
    industry:         attrs.INDUSTRY || attrs.INDUSTRIA || "Otro",
    lastActivity:     new Date(b.modifiedAt || b.createdAt || Date.now()).getTime(),
  };
}

function detectChannel(campaign) {
  const name = (campaign.name || "").toLowerCase();
  const tags = (campaign.tag || "").toLowerCase();
  if (name.includes("meta") || name.includes("facebook") || name.includes("instagram") || tags.includes("meta")) return "Meta Ads";
  if (name.includes("google") || name.includes("adwords") || tags.includes("google")) return "Google Ads";
  if (name.includes("linkedin") || tags.includes("linkedin")) return "LinkedIn";
  if (name.includes("whatsapp") || tags.includes("whatsapp")) return "WhatsApp";
  if (name.includes("sms") || tags.includes("sms")) return "SMS";
  return "Brevo Email";
}

function mapBrevoToCampaign(c, i) {
  // Brevo individual campaign detail has statistics.globalStats
  const gs = c.statistics?.globalStats || {};
  // campaignStats is an array per list — sum them all
  const cs = (c.statistics?.campaignStats || []).reduce((acc, s) => ({
    sent:          (acc.sent||0)          + (s.sent||0),
    uniqueViews:   (acc.uniqueViews||0)   + (s.uniqueViews||0),
    uniqueClicks:  (acc.uniqueClicks||0)  + (s.uniqueClicks||0),
    unsubscriptions:(acc.unsubscriptions||0)+(s.unsubscriptions||0),
    softBounces:   (acc.softBounces||0)   + (s.softBounces||0),
    hardBounces:   (acc.hardBounces||0)   + (s.hardBounces||0),
  }), {});

  const sent         = gs.sent         || cs.sent         || c.statistics?.campaignStats?.[0]?.sent || 0;
  const opens        = gs.uniqueViews  || cs.uniqueViews  || 0;
  const clicks       = gs.uniqueClicks || cs.uniqueClicks || 0;
  const unsubscribed = gs.unsubscriptions || cs.unsubscriptions || 0;
  const softBounces  = gs.softBounces  || cs.softBounces  || 0;
  const hardBounces  = gs.hardBounces  || cs.hardBounces  || 0;
  const delivered    = sent - softBounces - hardBounces;

  // Brevo calculates open rate against delivered, not sent
  const base = delivered > 0 ? delivered : sent;

  return {
    id:            `camp${c.id || i}`,
    name:          c.name || `Campaña ${i+1}`,
    channel:       detectChannel(c),
    status:        c.status === "sent" ? "completed" : c.status === "scheduled" ? "active" : "draft",
    startDate:     new Date(c.scheduledAt || c.createdAt || Date.now()).getTime(),
    targetSegment: c.recipients?.listIds?.length ? `${c.recipients.listIds.length} lista(s)` : "Todos",
    cadenceType:   "outreach",
    openRate:      base > 0 ? parseFloat(((opens  / base) * 100).toFixed(1)) : 0,
    clickRate:     base > 0 ? parseFloat(((clicks / base) * 100).toFixed(1)) : 0,
    replyRate:     0,
    totalContacts: sent,
    delivered,
    opens,
    clicks,
    unsubscribed,
    softBounces,
    hardBounces,
    lastSent:      c.sentDate ? new Date(c.sentDate).getTime() : null,
    brevoId:       c.id,
    rawStats:      gs,
  };
}

const MarketingContext = React.createContext(null);

function MarketingProvider({ children }) {
  const [contacts,  setContacts]  = React.useState([]);
  const [campaigns, setCampaigns] = React.useState([]);
  const [loading,   setLoading]   = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      fetch("/api/brevo/contacts").then(r=>r.json()).catch(()=>({})),
      fetch("/api/brevo/campaigns").then(r=>r.json()).catch(()=>({})),
    ]).then(([cData, campData]) => {
      if (cData.contacts) setContacts(cData.contacts.map(mapBrevoToMktContact));
      if (campData.campaigns) setCampaigns(campData.campaigns.map(mapBrevoToCampaign));
    }).finally(() => setLoading(false));
  }, []);

  const updateEngagement = React.useCallback((id, status) =>
    setContacts(p=>p.map(c=>c.id===id?{...c,engagement_status:status}:c)), []);

  const passToSales = React.useCallback((id) =>
    setContacts(p=>p.map(c=>c.id===id?{...c,ready_for_sales:true,passed_to_sales_at:Date.now()}:c)), []);

  const addContact = React.useCallback((c) => {
    const n = { ...c, id:`c${Date.now()}`, score:c.tier===1?60:c.tier===2?35:15,
      engagement_status:"cold", email_opens:0, email_clicks:0,
      ready_for_sales:false, passed_to_sales_at:null, lastActivity:Date.now() };
    setContacts(p=>[n,...p]); return n;
  }, []);

  const addCampaign = React.useCallback((c) => {
    const n = { ...c, id:`camp${Date.now()}`, openRate:0, clickRate:0, replyRate:0, conversions:0, lastSent:null };
    setCampaigns(p=>[n,...p]); return n;
  }, []);

  return React.createElement(MarketingContext.Provider,
    { value: { contacts, campaigns, loading, updateEngagement, passToSales, addContact, addCampaign } },
    children
  );
}

function useMarketing() { return React.useContext(MarketingContext); }

function mktFormatCOP(v) {
  return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(v);
}

Object.assign(window, {
  MarketingProvider, useMarketing, MarketingContext,
  MKT_CONTACTS_SEED, MKT_CAMPAIGNS_SEED,
  MKT_INDUSTRIES, MKT_TIERS, MKT_SOURCES, MKT_SOURCE_LABELS,
  mktFormatCOP,
});

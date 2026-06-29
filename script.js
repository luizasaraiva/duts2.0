const services = [
  {
    id: "molde-f1",
    name: "Alongamento Molde F1",
    price: 150,
    duration: 150,
    description: "Alongamento com acabamento elegante e estrutura resistente."
  },
  {
    id: "blindagem",
    name: "Blindagem",
    price: 90,
    duration: 75,
    description: "Proteção para unhas naturais com acabamento delicado."
  },
  {
    id: "hibrido",
    name: "Alongamento Híbrido",
    price: 180,
    duration: 150,
    description: "Técnica completa para unhas sofisticadas e duráveis."
  },
  {
    id: "fibra",
    name: "Alongamento Fibra de Vidro",
    price: 180,
    duration: 150,
    description: "Alongamento resistente com efeito natural e refinado."
  },
  {
    id: "banho-gel",
    name: "Banho de Gel",
    price: 100,
    duration: 100,
    description: "Camada de gel para fortalecer e embelezar as unhas naturais."
  },
  {
    id: "manutencao",
    name: "Manutenção",
    price: 100,
    duration: 120,
    description: "Manutenção do alongamento já aplicado."
  },
  {
    id: "remocao",
    name: "Remoção",
    price: 50,
    duration: 60,
    description: "Remoção segura do produto anterior."
  },
  {
    id: "decoracao",
    name: "Decoração Complexa",
    price: 25,
    duration: 30,
    description: "Decorações detalhadas para duas mãos."
  }
];

const WHATSAPP_NUMBER = "5511966818500";
let selectedSlot = null;

const formatCurrency = value => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function renderServices() {
  const list = document.getElementById("servicesList");
  const select = document.getElementById("serviceSelect");

  list.innerHTML = services.map(service => `
    <article class="service-card">
      <h3>${service.name}</h3>
      <p>${service.description}</p>
      <div class="service-meta">
        <strong>${formatCurrency(service.price)}</strong>
        <span>${Math.floor(service.duration / 60)}h${String(service.duration % 60).padStart(2, "0")}</span>
      </div>
      <button type="button" onclick="selectService('${service.id}')">Agendar este serviço</button>
    </article>
  `).join("");

  select.innerHTML = '<option value="">Selecione o serviço</option>' + services.map(service => `
    <option value="${service.id}">${service.name} — ${formatCurrency(service.price)}</option>
  `).join("");
}

function selectService(serviceId) {
  document.getElementById("serviceSelect").value = serviceId;
  document.getElementById("agendamento").scrollIntoView({ behavior: "smooth" });
}

function setMinDate() {
  const input = document.getElementById("dateSelect");
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  input.min = today.toISOString().split("T")[0];
}

function renderSlots(slots) {
  const container = document.getElementById("slots");
  selectedSlot = null;

  if (!slots || slots.length === 0) {
    container.innerHTML = '<span class="empty-state">Nenhum horário disponível para essa data.</span>';
    return;
  }

  container.innerHTML = slots.map(slot => `
    <button type="button" class="slot" data-start="${slot.start}" data-label="${slot.label}">
      ${slot.label}
    </button>
  `).join("");

  document.querySelectorAll(".slot").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".slot").forEach(item => item.classList.remove("selected"));
      button.classList.add("selected");
      selectedSlot = {
        start: button.dataset.start,
        label: button.dataset.label
      };
    });
  });
}

async function checkAvailability() {
  const serviceId = document.getElementById("serviceSelect").value;
  const date = document.getElementById("dateSelect").value;
  const service = services.find(item => item.id === serviceId);
  const container = document.getElementById("slots");

  if (!service || !date) {
    container.innerHTML = '<span class="empty-state">Selecione serviço e data primeiro.</span>';
    return;
  }

  container.innerHTML = '<span class="empty-state">Buscando horários...</span>';

  try {
    const response = await fetch(`/api/availability?date=${date}&duration=${service.duration}`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Erro ao buscar horários.");

    renderSlots(data.slots);
  } catch (error) {
    const fallbackSlots = generateFallbackSlots(date, service.duration);
    renderSlots(fallbackSlots);
    showMessage("Agenda Google ainda não configurada. Mostrei horários padrão para seguir pelo WhatsApp.", "error");
  }
}

function generateFallbackSlots(date, duration) {
  const starts = ["09:00", "11:45", "14:00", "16:45", "19:00"];
  return starts.map(time => ({
    label: time,
    start: `${date}T${time}:00`
  }));
}

function buildWhatsappMessage(payload) {
  return `Olá, DutsNails! Gostaria de agendar um horário.%0A%0A` +
    `Nome: ${encodeURIComponent(payload.clientName)}%0A` +
    `WhatsApp: ${encodeURIComponent(payload.clientPhone)}%0A` +
    `Instagram: ${encodeURIComponent(payload.clientInstagram || "Não informado")}%0A` +
    `Serviço: ${encodeURIComponent(payload.serviceName)}%0A` +
    `Valor: ${encodeURIComponent(formatCurrency(payload.price))}%0A` +
    `Data/Horário: ${encodeURIComponent(payload.slotLabel)}%0A` +
    `Observações: ${encodeURIComponent(payload.notes || "Sem observações")}%0A%0A` +
    `Aguardo confirmação.`;
}

async function submitBooking(event) {
  event.preventDefault();

  const serviceId = document.getElementById("serviceSelect").value;
  const service = services.find(item => item.id === serviceId);

  if (!service) return showMessage("Selecione um serviço.", "error");
  if (!selectedSlot) return showMessage("Escolha um horário disponível.", "error");

  const payload = {
    clientName: document.getElementById("clientName").value.trim(),
    clientPhone: document.getElementById("clientPhone").value.trim(),
    clientInstagram: document.getElementById("clientInstagram").value.trim(),
    serviceId: service.id,
    serviceName: service.name,
    duration: service.duration,
    price: service.price,
    start: selectedSlot.start,
    slotLabel: selectedSlot.label,
    notes: document.getElementById("notes").value.trim()
  };

  showMessage("Confirmando agendamento...", "");

  try {
    const response = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erro ao criar agendamento.");

    showMessage("Agendamento criado com sucesso na agenda!", "success");
    event.target.reset();
    document.getElementById("slots").innerHTML = '<span class="empty-state">Agendamento enviado. Escolha uma nova data para buscar horários.</span>';
    selectedSlot = null;
  } catch (error) {
    const message = buildWhatsappMessage(payload);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    showMessage("Google Agenda ainda não configurado. Enviei sua solicitação pelo WhatsApp.", "error");
  }
}

function showMessage(text, type) {
  const el = document.getElementById("formMessage");
  el.textContent = text;
  el.className = `form-message ${type || ""}`;
}

document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("nav").classList.toggle("open");
});

document.getElementById("checkAvailability").addEventListener("click", checkAvailability);
document.getElementById("bookingForm").addEventListener("submit", submitBooking);

renderServices();
setMinDate();

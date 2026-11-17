import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CrmData, CrmRecord, ModuleKey, createDemoData } from './data';
import { AutomationKey, getAiSnapshot, scoreLead } from './automation';

const STORAGE_KEY = 'logic-grid-crm-demo-v1';
const keys: ModuleKey[] = ['leads', 'contacts', 'companies', 'deals', 'tasks', 'activities', 'tickets', 'campaigns'];

const readData = (): CrmData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (keys.every((key) => Array.isArray(parsed[key]))) return parsed as CrmData;
    }
  } catch (_error) {
    // A fresh demo is safer than rendering malformed browser storage.
  }
  return createDemoData();
};

const nextId = (key: ModuleKey) => `${key.slice(0, 2).toUpperCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

type CrmStore = {
  data: CrmData;
  add: (key: ModuleKey, item: Omit<CrmRecord, 'id'>) => void;
  update: (key: ModuleKey, id: string, changes: Partial<CrmRecord>) => void;
  remove: (key: ModuleKey, id: string) => void;
  convertLead: (id: string) => void;
  runAutomation: (key: AutomationKey) => void;
  reset: () => void;
};

const Context = createContext<CrmStore | null>(null);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CrmData>(readData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const store = useMemo<CrmStore>(() => ({
    data,
    add: (key, item) => setData((previous) => ({ ...previous, [key]: [{ ...item, id: nextId(key) }, ...previous[key]] })),
    update: (key, id, changes) => setData((previous) => ({
      ...previous,
      [key]: previous[key].map((item) => item.id === id ? { ...item, ...changes, id } : item),
    })),
    remove: (key, id) => setData((previous) => ({ ...previous, [key]: previous[key].filter((item) => item.id !== id) })),
    convertLead: (id) => setData((previous) => {
      const lead = previous.leads.find((item) => item.id === id);
      if (!lead || lead.status === 'Converted') return previous;
      const companyExists = previous.companies.some((item) => item.name.toLowerCase() === lead.company.toLowerCase());
      const today = new Date().toISOString().slice(0, 10);
      return {
        ...previous,
        leads: previous.leads.map((item) => item.id === id ? { ...item, status: 'Converted' } : item),
        companies: companyExists ? previous.companies : [{ id: nextId('companies'), name: lead.company, industry: '', website: '', phone: lead.phone, owner: lead.owner, notes: `Converted from lead ${lead.name}` }, ...previous.companies],
        contacts: [{ id: nextId('contacts'), name: lead.name, company: lead.company, title: '', email: lead.email, phone: lead.phone, owner: lead.owner, notes: lead.notes }, ...previous.contacts],
        deals: [{ id: nextId('deals'), name: `${lead.company} opportunity`, company: lead.company, contact: lead.name, stage: 'Qualification', amount: lead.value || '0', closeDate: '', owner: lead.owner, notes: `Created from lead ${lead.name}` }, ...previous.deals],
        activities: [{ id: nextId('activities'), subject: `Converted ${lead.name} to customer opportunity`, type: 'Note', relatedTo: lead.company, date: today, owner: lead.owner, notes: 'Lead converted into a contact, company, and deal.' }, ...previous.activities],
      };
    }),
    runAutomation: (key) => setData((previous) => {
      const today = new Date();
      const todayText = today.toISOString().slice(0, 10);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowText = tomorrow.toISOString().slice(0, 10);
      const hasTask = (title: string) => previous.tasks.some((task) => task.title === title && task.status !== 'Completed');

      if (key === 'lead-scoring') return {
        ...previous,
        leads: previous.leads.map((lead) => {
          const result = scoreLead(lead);
          return { ...lead, aiScore: String(result.score), aiSignal: result.reason, status: result.score >= 80 && lead.status !== 'Converted' ? 'Qualified' : lead.status };
        }),
      };

      if (key === 'instant-follow-up') {
        const tasks = previous.leads.filter((lead) => lead.status === 'New').map((lead) => ({ id: nextId('tasks'), title: `AI follow-up: ${lead.name}`, relatedTo: lead.company, dueDate: tomorrowText, priority: 'High', status: 'Open', owner: lead.owner, notes: `Personalize outreach using: ${lead.notes || 'new lead context'}` })).filter((task) => !hasTask(task.title));
        return { ...previous, tasks: [...tasks, ...previous.tasks] };
      }

      if (key === 'deal-rescue') {
        const tasks = previous.deals.filter((deal) => ['Proposal', 'Negotiation'].includes(deal.stage)).map((deal) => ({ id: nextId('tasks'), title: `AI deal rescue: ${deal.name}`, relatedTo: deal.company, dueDate: tomorrowText, priority: 'High', status: 'Open', owner: deal.owner, notes: `Confirm blockers and next commitment before ${deal.closeDate || 'the expected close date'}.` })).filter((task) => !hasTask(task.title));
        return { ...previous, tasks: [...tasks, ...previous.tasks] };
      }

      if (key === 'meeting-follow-up') {
        const meeting = [...previous.activities].filter((activity) => activity.type === 'Meeting').sort((a, b) => b.date.localeCompare(a.date))[0];
        if (!meeting) return previous;
        const title = `AI next step: ${meeting.relatedTo}`;
        if (hasTask(title)) return previous;
        return { ...previous, tasks: [{ id: nextId('tasks'), title, relatedTo: meeting.relatedTo, dueDate: tomorrowText, priority: 'Medium', status: 'Open', owner: meeting.owner, notes: `Follow up from “${meeting.subject}”. Context: ${meeting.notes}` }, ...previous.tasks] };
      }

      if (key === 'ticket-triage') return {
        ...previous,
        tickets: previous.tickets.map((ticket) => ticket.status === 'Resolved' ? ticket : { ...ticket, priority: /urgent|blocked|error|down|cannot/i.test(`${ticket.subject} ${ticket.notes}`) ? 'High' : ticket.priority || 'Medium', owner: ticket.owner || 'Support queue', aiTriage: 'Reviewed' }),
      };

      const snapshot = getAiSnapshot(previous);
      const summary = `AI weekly brief: ${snapshot.highIntent.length} high-intent leads, ${snapshot.atRiskDeals.length} late-stage deals, ${snapshot.openTasks.length} open tasks, and ${snapshot.urgentTickets.length} urgent tickets.`;
      if (previous.activities.some((activity) => activity.subject === 'AI weekly sales digest' && activity.date === todayText)) return previous;
      return { ...previous, activities: [{ id: nextId('activities'), subject: 'AI weekly sales digest', type: 'Note', relatedTo: 'Sales workspace', date: todayText, owner: 'AI Copilot', notes: summary }, ...previous.activities] };
    }),
    reset: () => setData(createDemoData()),
  }), [data]);

  return <Context.Provider value={store}>{children}</Context.Provider>;
};

export const useCrm = () => {
  const store = useContext(Context);
  if (!store) throw new Error('CRM provider is missing');
  return store;
};

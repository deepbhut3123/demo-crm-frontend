import { CrmData, CrmRecord } from './data';

export type AutomationKey = 'lead-scoring' | 'instant-follow-up' | 'deal-rescue' | 'meeting-follow-up' | 'ticket-triage' | 'weekly-digest';

export type AutomationRecipe = {
  key: AutomationKey;
  title: string;
  description: string;
  trigger: string;
  outcome: string;
};

export type RankedLead = { id: string; name: string; company: string; status: string; score: number; reason: string; [field: string]: string | number };

export const automationRecipes: AutomationRecipe[] = [
  { key: 'lead-scoring', title: 'Smart lead qualification', description: 'Scores every lead from engagement, source, profile completeness, and potential value.', trigger: 'When a lead is added or updated', outcome: 'Scores leads and qualifies high-intent prospects' },
  { key: 'instant-follow-up', title: 'Instant lead follow-up', description: 'Creates a personalized first-touch task for every new lead.', trigger: 'When lead status becomes New', outcome: 'Creates an owner task due tomorrow' },
  { key: 'deal-rescue', title: 'At-risk deal rescue', description: 'Finds late-stage deals that need attention before their expected close date.', trigger: 'Daily pipeline health check', outcome: 'Creates high-priority deal follow-ups' },
  { key: 'meeting-follow-up', title: 'Meeting follow-up assistant', description: 'Turns recent meeting notes into the next customer action.', trigger: 'After a meeting is logged', outcome: 'Creates a contextual next-step task' },
  { key: 'ticket-triage', title: 'Support ticket triage', description: 'Reads issue context and routes urgent tickets to the right queue.', trigger: 'When a support ticket is opened', outcome: 'Sets priority and assignment automatically' },
  { key: 'weekly-digest', title: 'Weekly sales digest', description: 'Summarizes pipeline, high-intent leads, open work, and support health.', trigger: 'Every Monday at 09:00', outcome: 'Adds an executive summary to activity' },
];

export const scoreLead = (lead: CrmRecord) => {
  let score = 30;
  const reasons: string[] = [];
  const value = Number(lead.value || 0);
  if (value >= 500000) { score += 25; reasons.push('high potential value'); }
  else if (value >= 300000) { score += 15; reasons.push('meaningful deal size'); }
  if (lead.source === 'Referral') { score += 20; reasons.push('trusted referral'); }
  else if (['Website', 'Event'].includes(lead.source)) { score += 12; reasons.push('intent-rich source'); }
  if (lead.email && lead.phone) { score += 10; reasons.push('complete contact profile'); }
  if (lead.status === 'Qualified') score += 15;
  if (lead.status === 'Contacted') score += 7;
  if (lead.status === 'Unqualified') score -= 35;
  if (lead.status === 'Converted') score = 100;
  return { score: Math.max(0, Math.min(100, score)), reason: reasons.slice(0, 2).join(' + ') || 'profile engagement' };
};

export const getAiSnapshot = (data: CrmData) => {
  const rankedLeads = data.leads.map((lead) => ({ ...lead, ...scoreLead(lead) }) as RankedLead).sort((a, b) => b.score - a.score);
  const highIntent = rankedLeads.filter((lead) => lead.score >= 75 && lead.status !== 'Converted');
  const atRiskDeals = data.deals.filter((deal) => ['Proposal', 'Negotiation'].includes(deal.stage));
  const openTasks = data.tasks.filter((task) => task.status !== 'Completed');
  const urgentTickets = data.tickets.filter((ticket) => ticket.status !== 'Resolved' && ticket.priority === 'High');
  return { rankedLeads, highIntent, atRiskDeals, openTasks, urgentTickets };
};

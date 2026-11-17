export type ModuleKey = 'leads' | 'contacts' | 'companies' | 'deals' | 'tasks' | 'activities' | 'tickets' | 'campaigns';

export type CrmRecord = { id: string; [field: string]: string };
export type CrmData = Record<ModuleKey, CrmRecord[]>;

export type Field = { key: string; label: string; required?: boolean; type?: 'email' | 'date' | 'number' | 'url' | 'textarea'; options?: string[] };
export type ModuleDefinition = { key: ModuleKey; title: string; singular: string; description: string; fields: Field[]; columns: string[] };

export const dealStages = ['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
export const leadStages = ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted'];
export const taskStatuses = ['Open', 'In Progress', 'Completed'];

export const modules: ModuleDefinition[] = [
  { key: 'leads', title: 'Leads', singular: 'Lead', description: 'Capture, qualify, and convert potential customers.', columns: ['name', 'company', 'status', 'source', 'owner', 'value'], fields: [
    { key: 'name', label: 'Full name', required: true }, { key: 'company', label: 'Company', required: true },
    { key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Phone' },
    { key: 'source', label: 'Source', options: ['Website', 'Referral', 'LinkedIn', 'Event', 'Outbound'] },
    { key: 'status', label: 'Status', options: leadStages }, { key: 'owner', label: 'Owner' },
    { key: 'value', label: 'Potential value', type: 'number' }, { key: 'notes', label: 'Notes', type: 'textarea' },
  ] },
  { key: 'contacts', title: 'Contacts', singular: 'Contact', description: 'Keep decision makers and customer relationships in one place.', columns: ['name', 'company', 'title', 'email', 'phone', 'owner'], fields: [
    { key: 'name', label: 'Full name', required: true }, { key: 'company', label: 'Company', required: true },
    { key: 'title', label: 'Job title' }, { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone' }, { key: 'owner', label: 'Owner' }, { key: 'notes', label: 'Notes', type: 'textarea' },
  ] },
  { key: 'companies', title: 'Companies', singular: 'Company', description: 'Track organizations, industries, and account ownership.', columns: ['name', 'industry', 'website', 'phone', 'owner'], fields: [
    { key: 'name', label: 'Company name', required: true }, { key: 'industry', label: 'Industry' },
    { key: 'website', label: 'Website', type: 'url' }, { key: 'phone', label: 'Phone' },
    { key: 'owner', label: 'Account owner' }, { key: 'notes', label: 'Notes', type: 'textarea' },
  ] },
  { key: 'deals', title: 'Deals', singular: 'Deal', description: 'Move opportunities through a clear sales pipeline.', columns: ['name', 'company', 'stage', 'amount', 'closeDate', 'owner'], fields: [
    { key: 'name', label: 'Deal name', required: true }, { key: 'company', label: 'Company', required: true },
    { key: 'contact', label: 'Primary contact' }, { key: 'stage', label: 'Stage', options: dealStages },
    { key: 'amount', label: 'Deal amount', type: 'number' }, { key: 'closeDate', label: 'Expected close', type: 'date' },
    { key: 'owner', label: 'Owner' }, { key: 'notes', label: 'Notes', type: 'textarea' },
  ] },
  { key: 'tasks', title: 'Tasks', singular: 'Task', description: 'Plan follow-ups and keep the team on schedule.', columns: ['title', 'relatedTo', 'dueDate', 'priority', 'status', 'owner'], fields: [
    { key: 'title', label: 'Task', required: true }, { key: 'relatedTo', label: 'Related to' },
    { key: 'dueDate', label: 'Due date', type: 'date' }, { key: 'priority', label: 'Priority', options: ['Low', 'Medium', 'High'] },
    { key: 'status', label: 'Status', options: taskStatuses }, { key: 'owner', label: 'Owner' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ] },
  { key: 'activities', title: 'Activities', singular: 'Activity', description: 'Log calls, meetings, emails, and customer touchpoints.', columns: ['subject', 'type', 'relatedTo', 'date', 'owner'], fields: [
    { key: 'subject', label: 'Subject', required: true }, { key: 'type', label: 'Type', options: ['Call', 'Meeting', 'Email', 'Note'] },
    { key: 'relatedTo', label: 'Related to' }, { key: 'date', label: 'Date', type: 'date' },
    { key: 'owner', label: 'Owner' }, { key: 'notes', label: 'Notes', type: 'textarea' },
  ] },
  { key: 'tickets', title: 'Support tickets', singular: 'Ticket', description: 'Track customer issues from opening through resolution.', columns: ['subject', 'company', 'priority', 'status', 'owner'], fields: [
    { key: 'subject', label: 'Issue', required: true }, { key: 'company', label: 'Company', required: true },
    { key: 'priority', label: 'Priority', options: ['Low', 'Medium', 'High'] },
    { key: 'status', label: 'Status', options: ['Open', 'In Progress', 'Resolved'] },
    { key: 'owner', label: 'Owner' }, { key: 'notes', label: 'Description', type: 'textarea' },
  ] },
  { key: 'campaigns', title: 'Campaigns', singular: 'Campaign', description: 'See which marketing efforts create interest.', columns: ['name', 'channel', 'status', 'budget', 'leads', 'owner'], fields: [
    { key: 'name', label: 'Campaign name', required: true }, { key: 'channel', label: 'Channel', options: ['Email', 'Social', 'Webinar', 'Event', 'Paid search'] },
    { key: 'status', label: 'Status', options: ['Planning', 'Active', 'Completed'] },
    { key: 'budget', label: 'Budget', type: 'number' }, { key: 'leads', label: 'Leads generated', type: 'number' },
    { key: 'owner', label: 'Owner' }, { key: 'notes', label: 'Notes', type: 'textarea' },
  ] },
];

const dateFromToday = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const createDemoData = (): CrmData => ({
  leads: [
    { id: 'L-1001', name: 'Aarav Mehta', company: 'Northstar Labs', email: 'aarav@northstarlabs.example', phone: '+91 98765 21001', source: 'Website', status: 'New', owner: 'Priya Shah', value: '450000', notes: 'Requested a product overview.' },
    { id: 'L-1002', name: 'Sana Khan', company: 'Crescent Retail', email: 'sana@crescent.example', phone: '+91 98765 21002', source: 'Referral', status: 'Qualified', owner: 'Rohan Desai', value: '720000', notes: 'Interested in a multi-team rollout.' },
    { id: 'L-1003', name: 'Vikram Rao', company: 'Meridian Health', email: 'vikram@meridian.example', phone: '+91 98765 21003', source: 'LinkedIn', status: 'Contacted', owner: 'Priya Shah', value: '380000', notes: 'Follow up after introductory call.' },
    { id: 'L-1004', name: 'Nisha Patel', company: 'Bluepeak Logistics', email: 'nisha@bluepeak.example', phone: '+91 98765 21004', source: 'Event', status: 'New', owner: 'Amit Verma', value: '560000', notes: 'Met at industry event.' },
  ],
  contacts: [
    { id: 'C-1001', name: 'Ananya Iyer', company: 'Atlas Systems', title: 'Operations Director', email: 'ananya@atlas.example', phone: '+91 98765 31001', owner: 'Priya Shah', notes: 'Main decision maker.' },
    { id: 'C-1002', name: 'Dev Malhotra', company: 'Harbor Tech', title: 'VP, Sales', email: 'dev@harbor.example', phone: '+91 98765 31002', owner: 'Rohan Desai', notes: 'Prefers afternoon calls.' },
    { id: 'C-1003', name: 'Isha Kapoor', company: 'Pioneer Works', title: 'Founder', email: 'isha@pioneer.example', phone: '+91 98765 31003', owner: 'Amit Verma', notes: 'Evaluating proposal.' },
  ],
  companies: [
    { id: 'A-1001', name: 'Atlas Systems', industry: 'Technology', website: 'https://atlas.example', phone: '+91 22 4000 1001', owner: 'Priya Shah', notes: 'Enterprise account.' },
    { id: 'A-1002', name: 'Harbor Tech', industry: 'Software', website: 'https://harbor.example', phone: '+91 22 4000 1002', owner: 'Rohan Desai', notes: 'Growing sales team.' },
    { id: 'A-1003', name: 'Pioneer Works', industry: 'Manufacturing', website: 'https://pioneer.example', phone: '+91 22 4000 1003', owner: 'Amit Verma', notes: 'Expansion opportunity.' },
  ],
  deals: [
    { id: 'D-1001', name: 'Atlas annual contract', company: 'Atlas Systems', contact: 'Ananya Iyer', stage: 'Negotiation', amount: '1250000', closeDate: dateFromToday(14), owner: 'Priya Shah', notes: 'Legal review in progress.' },
    { id: 'D-1002', name: 'Harbor sales rollout', company: 'Harbor Tech', contact: 'Dev Malhotra', stage: 'Proposal', amount: '860000', closeDate: dateFromToday(28), owner: 'Rohan Desai', notes: 'Proposal shared with buying team.' },
    { id: 'D-1003', name: 'Pioneer pilot', company: 'Pioneer Works', contact: 'Isha Kapoor', stage: 'Discovery', amount: '420000', closeDate: dateFromToday(42), owner: 'Amit Verma', notes: 'Discovery workshop booked.' },
    { id: 'D-1004', name: 'Atlas add-on', company: 'Atlas Systems', contact: 'Ananya Iyer', stage: 'Closed Won', amount: '310000', closeDate: dateFromToday(-8), owner: 'Priya Shah', notes: 'Signed and handed to delivery.' },
  ],
  tasks: [
    { id: 'T-1001', title: 'Call Sana about rollout', relatedTo: 'Crescent Retail', dueDate: dateFromToday(1), priority: 'High', status: 'Open', owner: 'Rohan Desai', notes: 'Discuss stakeholder list.' },
    { id: 'T-1002', title: 'Send Atlas contract revision', relatedTo: 'Atlas annual contract', dueDate: dateFromToday(2), priority: 'High', status: 'In Progress', owner: 'Priya Shah', notes: 'Include updated service schedule.' },
    { id: 'T-1003', title: 'Prepare Pioneer discovery agenda', relatedTo: 'Pioneer Works', dueDate: dateFromToday(4), priority: 'Medium', status: 'Open', owner: 'Amit Verma', notes: 'Confirm attendees.' },
    { id: 'T-1004', title: 'Share Harbor proposal', relatedTo: 'Harbor Tech', dueDate: dateFromToday(-2), priority: 'Medium', status: 'Completed', owner: 'Rohan Desai', notes: 'Proposal sent.' },
  ],
  activities: [
    { id: 'AC-1001', subject: 'Discovery call with Harbor', type: 'Call', relatedTo: 'Harbor Tech', date: dateFromToday(-1), owner: 'Rohan Desai', notes: 'Discussed onboarding plan.' },
    { id: 'AC-1002', subject: 'Atlas contract review', type: 'Meeting', relatedTo: 'Atlas annual contract', date: dateFromToday(-2), owner: 'Priya Shah', notes: 'Commercial terms agreed.' },
    { id: 'AC-1003', subject: 'Pioneer introduction', type: 'Email', relatedTo: 'Pioneer Works', date: dateFromToday(-3), owner: 'Amit Verma', notes: 'Sent discovery questions.' },
  ],
  tickets: [
    { id: 'S-1001', subject: 'User access request', company: 'Atlas Systems', priority: 'Medium', status: 'Open', owner: 'Priya Shah', notes: 'New team member needs access.' },
    { id: 'S-1002', subject: 'Report export question', company: 'Harbor Tech', priority: 'Low', status: 'In Progress', owner: 'Rohan Desai', notes: 'Share export instructions.' },
  ],
  campaigns: [
    { id: 'M-1001', name: 'Autumn product webinar', channel: 'Webinar', status: 'Active', budget: '120000', leads: '32', owner: 'Priya Shah', notes: 'Registration campaign.' },
    { id: 'M-1002', name: 'Industry newsletter', channel: 'Email', status: 'Completed', budget: '45000', leads: '18', owner: 'Amit Verma', notes: 'Monthly edition.' },
  ],
});

export const money = (value: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);

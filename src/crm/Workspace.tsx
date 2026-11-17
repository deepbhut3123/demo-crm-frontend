import React, { useState } from 'react';
import { Avatar, Button, Drawer, Empty, Input, Modal, Select, Tooltip, message } from 'antd';
import {
  ApartmentOutlined, BarChartOutlined, CalendarOutlined, CheckCircleOutlined,
  CustomerServiceOutlined, DashboardOutlined, DeleteOutlined, EditOutlined,
  FlagOutlined, FundProjectionScreenOutlined, MenuOutlined, PhoneOutlined,
  PlusOutlined, RobotOutlined, SearchOutlined, TeamOutlined, ThunderboltOutlined, UserOutlined,
} from '@ant-design/icons';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CrmRecord, Field, ModuleDefinition, dealStages, modules, money } from './data';
import { useCrm } from './store';
import { AutomationKey, automationRecipes, getAiSnapshot } from './automation';
import './workspace.css';

const icons: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />, leads: <ThunderboltOutlined />, contacts: <TeamOutlined />,
  companies: <ApartmentOutlined />, deals: <FundProjectionScreenOutlined />, tasks: <CheckCircleOutlined />,
  activities: <CalendarOutlined />, tickets: <CustomerServiceOutlined />, campaigns: <FlagOutlined />,
  reports: <BarChartOutlined />,
  'ai-automations': <RobotOutlined />,
};

const navigation = [
  { label: 'Overview', items: [{ key: 'dashboard', label: 'Dashboard', path: '/' }] },
  { label: 'AI workspace', items: [{ key: 'ai-automations', label: 'AI Automations', path: '/ai-automations' }] },
  { label: 'Sales', items: [
    { key: 'leads', label: 'Leads', path: '/leads' }, { key: 'contacts', label: 'Contacts', path: '/contacts' },
    { key: 'companies', label: 'Companies', path: '/companies' }, { key: 'deals', label: 'Deals', path: '/deals' },
  ] },
  { label: 'Work', items: [
    { key: 'tasks', label: 'Tasks', path: '/tasks' }, { key: 'activities', label: 'Activities', path: '/activities' },
    { key: 'tickets', label: 'Support tickets', path: '/tickets' }, { key: 'campaigns', label: 'Campaigns', path: '/campaigns' },
  ] },
  { label: 'Insights', items: [{ key: 'reports', label: 'Reports', path: '/reports' }] },
];

const statusClass = (value: string) => {
  if (['High', 'Closed Lost', 'Unqualified', 'Open'].includes(value)) return 'alert';
  if (['Medium', 'Contacted', 'Discovery', 'Proposal', 'In Progress', 'Planning'].includes(value)) return 'warm';
  if (['Closed Won', 'Completed', 'Converted', 'Resolved', 'Qualified', 'Active'].includes(value)) return 'success';
  return 'neutral';
};

const displayValue = (key: string, value: string) => {
  if (['value', 'amount', 'budget'].includes(key)) return money(value);
  if (['stage', 'status', 'priority', 'source', 'type', 'channel'].includes(key)) return <span className={`crm-pill ${statusClass(value)}`}>{value || '—'}</span>;
  if (key === 'email' && value) return <a href={`mailto:${value}`}>{value}</a>;
  if (key === 'website' && value) return <a href={value} target="_blank" rel="noreferrer">{value.replace(/^https?:\/\//, '')}</a>;
  return value || '—';
};

const emptyValues = (definition: ModuleDefinition) => Object.fromEntries(definition.fields.map((field) => [field.key, field.options?.[0] || '']));

const RecordModal: React.FC<{
  definition: ModuleDefinition; record: CrmRecord | null; open: boolean; onClose: () => void;
}> = ({ definition, record, open, onClose }) => {
  const { add, update } = useCrm();
  const [values, setValues] = useState<Record<string, string>>({});

  React.useEffect(() => { if (open) setValues(record || emptyValues(definition)); }, [open, record, definition]);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (record) update(definition.key, record.id, values);
    else add(definition.key, values);
    message.success(`${definition.singular} ${record ? 'updated' : 'created'}`);
    onClose();
  };

  const renderField = (field: Field) => {
    const inputProps = { id: `crm-${field.key}`, value: values[field.key] || '', onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValues((previous) => ({ ...previous, [field.key]: event.target.value })), required: field.required };
    if (field.options) return <div className="crm-field-control"><select {...inputProps}>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select><span className="crm-select-arrow">⌄</span></div>;
    if (field.type === 'textarea') return <textarea {...inputProps} rows={4} placeholder={`Add context about this ${definition.singular.toLowerCase()}…`} />;
    return <input {...inputProps} type={field.type || 'text'} min={field.type === 'number' ? '0' : undefined} step={field.type === 'number' ? 'any' : undefined} placeholder={field.type === 'date' ? undefined : `Enter ${field.label.toLowerCase()}`} />;
  };

  return <Modal title={null} open={open} onCancel={onClose} footer={null} width={720} destroyOnClose centered maskClosable={false} className="crm-record-modal">
    <div className="crm-modal-header">
      <span className="crm-modal-icon">{icons[definition.key]}</span>
      <div><div className="crm-modal-eyebrow">{record ? 'UPDATE RECORD' : 'CREATE NEW RECORD'}</div><h2>{record ? `Edit ${definition.singular.toLowerCase()}` : `Add ${definition.singular.toLowerCase()}`}</h2><p>{definition.description}</p></div>
    </div>
    <form className="crm-form" onSubmit={save}>
      <div className="crm-form-intro"><strong>Record details</strong><span><i /> Required information</span></div>
      <div className="crm-form-fields">
        {definition.fields.map((field) => <label key={field.key} htmlFor={`crm-${field.key}`} className={field.type === 'textarea' ? 'crm-form-wide' : ''}>
          <span>{field.label}{field.required && <b>Required</b>}</span>{renderField(field)}
        </label>)}
      </div>
      <div className="crm-form-actions"><div><CheckCircleOutlined /><span>Changes are saved to this demo workspace</span></div><Button onClick={onClose} className="crm-modal-cancel">Cancel</Button><button className="crm-modal-submit" type="submit"><span>{record ? 'Save changes' : `Add ${definition.singular.toLowerCase()}`}</span><span>→</span></button></div>
    </form>
  </Modal>;
};

const Metric: React.FC<{ label: string; value: string | number; detail: string; icon: React.ReactNode }> = ({ label, value, detail, icon }) =>
  <div className="crm-metric"><span className="crm-metric-icon">{icon}</span><div className="crm-metric-label">{label}</div><div className="crm-metric-value">{value}</div><div className="crm-muted">{detail}</div></div>;

const Overview: React.FC = () => {
  const { data } = useCrm();
  const navigate = useNavigate();
  const openDeals = data.deals.filter((deal) => !deal.stage.startsWith('Closed'));
  const pipeline = openDeals.reduce((total, deal) => total + Number(deal.amount || 0), 0);
  const upcoming = data.tasks.filter((task) => task.status !== 'Completed').sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const recent = [...data.activities].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const stages = dealStages.slice(0, 4);
  const ai = getAiSnapshot(data);
  const bestLead = ai.highIntent[0] || ai.rankedLeads[0];

  return <>
    <div className="crm-heading"><div><div className="crm-eyebrow">YOUR SALES WORKSPACE</div><h1>Good to see you</h1><p>Here is what is happening across your customer journey.</p></div><button className="crm-button" onClick={() => navigate('/leads')}><PlusOutlined /> Explore leads</button></div>
    <div className="crm-metrics">
      <Metric label="Open pipeline" value={money(pipeline)} detail={`${openDeals.length} active opportunities`} icon={<FundProjectionScreenOutlined />} />
      <Metric label="New leads" value={data.leads.filter((lead) => lead.status === 'New').length} detail={`${data.leads.length} leads in total`} icon={<ThunderboltOutlined />} />
      <Metric label="Contacts" value={data.contacts.length} detail="People in your CRM" icon={<TeamOutlined />} />
      <Metric label="Tasks to do" value={data.tasks.filter((task) => task.status !== 'Completed').length} detail="Follow-ups to keep moving" icon={<CheckCircleOutlined />} />
    </div>
    <section className="crm-ai-banner">
      <div className="crm-ai-banner-icon"><RobotOutlined /></div>
      <div className="crm-ai-banner-copy"><span>AI SALES COPILOT</span><h2>{bestLead ? `${bestLead.name} is the strongest next opportunity` : 'Your AI workspace is ready'}</h2><p>{bestLead ? `${bestLead.score}/100 intent score based on ${bestLead.reason}. ${ai.atRiskDeals.length} late-stage deals also need attention.` : 'Add leads to receive prioritization and recommended actions.'}</p></div>
      <div className="crm-ai-banner-stats"><strong>{ai.highIntent.length}</strong><span>high-intent leads</span></div>
      <div className="crm-ai-banner-stats"><strong>{ai.atRiskDeals.length}</strong><span>deals to rescue</span></div>
      <button className="crm-ai-button" onClick={() => navigate('/ai-automations')}>Open AI Hub <span>→</span></button>
    </section>
    <div className="crm-grid-two">
      <section className="crm-panel"><div className="crm-panel-head"><div><h2>Sales pipeline</h2><p>Open deals by stage</p></div><button className="crm-text-button" onClick={() => navigate('/deals')}>View deals →</button></div>
        <div className="crm-funnel">{stages.map((stage, index) => { const deals = openDeals.filter((deal) => deal.stage === stage); return <div key={stage} className="crm-funnel-row"><div className="crm-funnel-meta"><span>{stage}</span><strong>{deals.length} · {money(deals.reduce((total, deal) => total + Number(deal.amount || 0), 0))}</strong></div><div className="crm-funnel-track"><div style={{ width: `${Math.max(7, (deals.length / Math.max(1, openDeals.length)) * 100)}%`, opacity: 1 - index * .12 }} /></div></div>; })}</div>
      </section>
      <section className="crm-panel"><div className="crm-panel-head"><div><h2>Upcoming tasks</h2><p>Keep customer conversations on track</p></div><button className="crm-text-button" onClick={() => navigate('/tasks')}>View tasks →</button></div>
        <div className="crm-list">{upcoming.map((task) => <div className="crm-list-row" key={task.id}><span className="crm-list-icon"><CheckCircleOutlined /></span><div><strong>{task.title}</strong><small>{task.relatedTo} · {task.owner}</small></div><span className="crm-date">{task.dueDate || 'No date'}</span></div>)}{!upcoming.length && <Empty description="All caught up" />}</div>
      </section>
    </div>
    <div className="crm-grid-two">
      <section className="crm-panel"><div className="crm-panel-head"><div><h2>Recent activity</h2><p>A shared view of customer touchpoints</p></div><button className="crm-text-button" onClick={() => navigate('/activities')}>Activity log →</button></div><div className="crm-list">{recent.map((activity) => <div className="crm-list-row" key={activity.id}><span className="crm-list-icon"><PhoneOutlined /></span><div><strong>{activity.subject}</strong><small>{activity.type} · {activity.relatedTo}</small></div><span className="crm-date">{activity.date}</span></div>)}</div></section>
      <section className="crm-panel crm-guide"><span className="crm-guide-icon"><ThunderboltOutlined /></span><h2>See the complete CRM flow</h2><p>Start with a lead, qualify it, then convert it. A contact, company, deal, and activity will appear automatically in the related modules.</p><div className="crm-guide-actions"><button className="crm-button" onClick={() => navigate('/leads')}>Try lead conversion</button><button className="crm-outline-button" onClick={() => navigate('/reports')}>Explore reports</button></div></section>
    </div>
  </>;
};

const AiAutomations: React.FC = () => {
  const { data, runAutomation } = useCrm();
  const [running, setRunning] = useState<AutomationKey | null>(null);
  const [enabled, setEnabled] = useState<AutomationKey[]>(() => {
    try { return JSON.parse(localStorage.getItem('logic-grid-ai-automations-v1') || 'null') || automationRecipes.map((recipe) => recipe.key); }
    catch (_error) { return automationRecipes.map((recipe) => recipe.key); }
  });
  const snapshot = getAiSnapshot(data);
  const bestLead = snapshot.highIntent[0] || snapshot.rankedLeads[0];
  const bestDeal = snapshot.atRiskDeals.sort((a, b) => Number(b.amount) - Number(a.amount))[0];
  const hoursSaved = Math.round((data.tasks.filter((task) => task.title.startsWith('AI ')).length + enabled.length * 3) * 1.4);

  const toggle = (key: AutomationKey) => {
    const next = enabled.includes(key) ? enabled.filter((item) => item !== key) : [...enabled, key];
    setEnabled(next); localStorage.setItem('logic-grid-ai-automations-v1', JSON.stringify(next));
  };
  const run = (key: AutomationKey, title: string) => {
    setRunning(key);
    window.setTimeout(() => {
      runAutomation(key); setRunning(null); message.success(`${title} completed on the demo workspace`);
    }, 450);
  };

  return <>
    <div className="crm-ai-hero">
      <div><div className="crm-ai-kicker"><RobotOutlined /> LOGIC GRID AI</div><h1>AI Automation Hub</h1><p>Prioritize revenue, create next steps, and keep every customer workflow moving automatically.</p><div className="crm-ai-hero-actions"><button className="crm-ai-primary" onClick={() => run('lead-scoring', 'Smart lead qualification')} disabled={running !== null}><ThunderboltOutlined /> Score and prioritize now</button><span>Runs safely on this sample workspace</span></div></div>
      <div className="crm-ai-orbit"><RobotOutlined /><i /><i /><i /><span>6 active workflows</span></div>
    </div>

    <div className="crm-metrics crm-ai-metrics">
      <Metric label="Active automations" value={enabled.length} detail="Always-on CRM workflows" icon={<RobotOutlined />} />
      <Metric label="High-intent leads" value={snapshot.highIntent.length} detail="Ready for human follow-up" icon={<ThunderboltOutlined />} />
      <Metric label="Deals needing action" value={snapshot.atRiskDeals.length} detail={money(snapshot.atRiskDeals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0)) + ' at stake'} icon={<FundProjectionScreenOutlined />} />
      <Metric label="Estimated time saved" value={`${hoursSaved}h`} detail="This month in the demo" icon={<CheckCircleOutlined />} />
    </div>

    <div className="crm-ai-insight-grid">
      <section className="crm-ai-insight featured"><div className="crm-ai-insight-label">NEXT BEST LEAD</div><div className="crm-ai-score">{bestLead?.score || 0}<small>/100</small></div><h2>{bestLead?.name || 'No lead available'}</h2><p>{bestLead ? `${bestLead.company} · ${bestLead.reason}` : 'Add a lead to generate an intent score.'}</p><div className="crm-ai-action">Recommended: {bestLead?.status === 'Qualified' ? 'Schedule a discovery call' : 'Send a personalized introduction'}</div></section>
      <section className="crm-ai-insight"><div className="crm-ai-insight-label">DEAL RESCUE</div><span className="crm-ai-small-icon"><FundProjectionScreenOutlined /></span><h2>{bestDeal?.name || 'Pipeline is healthy'}</h2><p>{bestDeal ? `${money(bestDeal.amount)} in ${bestDeal.stage}. Expected close ${bestDeal.closeDate}.` : 'No late-stage opportunity currently needs attention.'}</p><button onClick={() => run('deal-rescue', 'At-risk deal rescue')} disabled={running !== null}>Create rescue tasks →</button></section>
      <section className="crm-ai-insight"><div className="crm-ai-insight-label">SUPPORT HEALTH</div><span className="crm-ai-small-icon"><CustomerServiceOutlined /></span><h2>{snapshot.urgentTickets.length} urgent tickets</h2><p>AI can review issue language, set urgency, and route unassigned work automatically.</p><button onClick={() => run('ticket-triage', 'Support ticket triage')} disabled={running !== null}>Run smart triage →</button></section>
    </div>

    <div className="crm-ai-section-head"><div><div className="crm-eyebrow">AUTOMATION LIBRARY</div><h2>Always-on workflows</h2><p>Each recipe changes the actual sample CRM records, so clients can see the outcome.</p></div><span>{enabled.length} of {automationRecipes.length} enabled</span></div>
    <div className="crm-automation-grid">{automationRecipes.map((recipe, index) => <article className={`crm-automation-card${enabled.includes(recipe.key) ? ' enabled' : ''}`} key={recipe.key}>
      <div className="crm-automation-top"><span className="crm-automation-number">0{index + 1}</span><button className={`crm-toggle${enabled.includes(recipe.key) ? ' on' : ''}`} aria-label={`${enabled.includes(recipe.key) ? 'Disable' : 'Enable'} ${recipe.title}`} onClick={() => toggle(recipe.key)}><i /></button></div>
      <h3>{recipe.title}</h3><p>{recipe.description}</p><dl><div><dt>TRIGGER</dt><dd>{recipe.trigger}</dd></div><div><dt>AI ACTION</dt><dd>{recipe.outcome}</dd></div></dl>
      <button className="crm-run-button" disabled={!enabled.includes(recipe.key) || running !== null} onClick={() => run(recipe.key, recipe.title)}>{running === recipe.key ? 'Running intelligence…' : 'Run now'} <span>→</span></button>
    </article>)}</div>

    <section className="crm-ai-explainer"><RobotOutlined /><div><h2>Human control stays built in</h2><p>Automations prepare scores, summaries, routing, and follow-up work. Your team still owns customer communication and final decisions.</p></div><span>CLIENT DEMO · SAMPLE DATA</span></section>
  </>;
};

const Pipeline: React.FC = () => {
  const { data, update } = useCrm();
  return <div className="crm-pipeline">{dealStages.map((stage) => { const deals = data.deals.filter((deal) => deal.stage === stage); return <section className="crm-pipeline-column" key={stage}><div className="crm-pipeline-title"><strong>{stage}</strong><span>{deals.length}</span></div><div className="crm-muted">{money(deals.reduce((total, deal) => total + Number(deal.amount || 0), 0))}</div>{deals.map((deal) => <div className="crm-deal-card" key={deal.id}><strong>{deal.name}</strong><span>{deal.company}</span><b>{money(deal.amount)}</b><small>{deal.owner}</small><select aria-label={`Stage for ${deal.name}`} value={deal.stage} onChange={(event) => update('deals', deal.id, { stage: event.target.value })}>{dealStages.map((option) => <option key={option}>{option}</option>)}</select></div>)}</section>; })}</div>;
};

const ModulePage: React.FC<{ definition: ModuleDefinition }> = ({ definition }) => {
  const location = useLocation();
  const { data, update, remove, convertLead } = useCrm();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [editing, setEditing] = useState<CrmRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [board, setBoard] = useState(false);
  React.useEffect(() => {
    if (definition.key === 'leads') setSearch(new URLSearchParams(location.search).get('q') || '');
  }, [definition.key, location.search]);
  const records = data[definition.key];
  const filterField = definition.key === 'deals' ? 'stage' : definition.key === 'tasks' || definition.key === 'leads' || definition.key === 'tickets' || definition.key === 'campaigns' ? 'status' : '';
  const choices = filterField ? Array.from(new Set(records.map((item) => item[filterField]).filter(Boolean))) : [];
  const visible = records.filter((item) => (filter === 'All' || item[filterField] === filter) && Object.values(item).some((value) => String(value).toLowerCase().includes(search.toLowerCase())));
  const fields = Object.fromEntries(definition.fields.map((field) => [field.key, field.label]));

  const confirmDelete = (record: CrmRecord) => Modal.confirm({
    title: `Delete ${definition.singular.toLowerCase()}?`, content: `This removes “${record.name || record.title || record.subject}” from this demo.`,
    className: 'crm-confirm-modal crm-danger-modal', centered: true, icon: <DeleteOutlined />, okText: 'Delete record', cancelText: 'Keep record', okButtonProps: { danger: true }, onOk: () => { remove(definition.key, record.id); message.success(`${definition.singular} deleted`); },
  });

  return <>
    <div className="crm-heading"><div><div className="crm-eyebrow">{definition.key === 'tickets' ? 'CUSTOMER SUCCESS' : definition.key === 'campaigns' ? 'MARKETING' : 'CRM WORKSPACE'}</div><h1>{definition.title}</h1><p>{definition.description}</p></div><button className="crm-button" onClick={() => { setEditing(null); setModalOpen(true); }}><PlusOutlined /> Add {definition.singular.toLowerCase()}</button></div>
    <div className="crm-module-summary"><span><strong>{records.length}</strong> total {definition.title.toLowerCase()}</span><span>Changes are saved in this browser</span></div>
    <section className="crm-panel crm-table-panel"><div className="crm-toolbar"><Input prefix={<SearchOutlined />} placeholder={`Search ${definition.title.toLowerCase()}`} value={search} onChange={(event) => setSearch(event.target.value)} allowClear className="crm-search" />
      {filterField && <Select value={filter} onChange={setFilter} options={['All', ...choices].map((value) => ({ label: value === 'All' ? 'All stages / statuses' : value, value }))} className="crm-filter" />}
      {definition.key === 'deals' && <div className="crm-view-switch"><button className={!board ? 'active' : ''} onClick={() => setBoard(false)}>Table</button><button className={board ? 'active' : ''} onClick={() => setBoard(true)}>Pipeline</button></div>}
    </div>
      {definition.key === 'deals' && board ? <Pipeline /> : <div className="crm-table-scroll"><table className="crm-table"><thead><tr>{definition.columns.map((column) => <th key={column}>{fields[column] || column}</th>)}<th className="crm-actions-col">Actions</th></tr></thead><tbody>{visible.map((record) => <tr key={record.id}>{definition.columns.map((column, index) => <td key={column}>{index === 0 ? <strong>{displayValue(column, record[column])}</strong> : displayValue(column, record[column])}</td>)}<td className="crm-row-actions">
        {definition.key === 'leads' && record.status !== 'Converted' && <Tooltip title="Create contact, company, and deal"><button onClick={() => { convertLead(record.id); message.success('Lead converted to contact, company, and deal'); }}>Convert</button></Tooltip>}
        {definition.key === 'tasks' && record.status !== 'Completed' && <button onClick={() => update('tasks', record.id, { status: 'Completed' })}>Complete</button>}
        <Tooltip title="Edit"><button aria-label={`Edit ${record.name || record.title || record.subject}`} onClick={() => { setEditing(record); setModalOpen(true); }}><EditOutlined /></button></Tooltip>
        <Tooltip title="Delete"><button aria-label={`Delete ${record.name || record.title || record.subject}`} onClick={() => confirmDelete(record)}><DeleteOutlined /></button></Tooltip>
      </td></tr>)}</tbody></table>{!visible.length && <div className="crm-empty"><Empty description="No matching records" /></div>}</div>}
      <div className="crm-table-footer">Showing {visible.length} of {records.length} records</div>
    </section>
    <RecordModal definition={definition} record={editing} open={modalOpen} onClose={() => setModalOpen(false)} />
  </>;
};

const Reports: React.FC = () => {
  const { data } = useCrm();
  const won = data.deals.filter((deal) => deal.stage === 'Closed Won');
  const wonValue = won.reduce((total, deal) => total + Number(deal.amount || 0), 0);
  const open = data.deals.filter((deal) => !deal.stage.startsWith('Closed'));
  const pipeline = open.reduce((total, deal) => total + Number(deal.amount || 0), 0);
  const sources = ['Website', 'Referral', 'LinkedIn', 'Event', 'Outbound'].map((source) => ({ source, count: data.leads.filter((lead) => lead.source === source).length }));
  const owners = Array.from(new Set([...data.deals.map((deal) => deal.owner), ...data.leads.map((lead) => lead.owner)])).filter(Boolean);
  return <><div className="crm-heading"><div><div className="crm-eyebrow">PERFORMANCE</div><h1>Reports</h1><p>Understand your pipeline, lead sources, and team activity.</p></div></div>
    <div className="crm-metrics"><Metric label="Open pipeline" value={money(pipeline)} detail={`${open.length} open deals`} icon={<FundProjectionScreenOutlined />} /><Metric label="Won revenue" value={money(wonValue)} detail={`${won.length} won deals`} icon={<CheckCircleOutlined />} /><Metric label="Lead conversion" value={`${data.leads.length ? Math.round(data.leads.filter((lead) => lead.status === 'Converted').length / data.leads.length * 100) : 0}%`} detail="Leads converted" icon={<ThunderboltOutlined />} /><Metric label="Tasks completed" value={`${data.tasks.length ? Math.round(data.tasks.filter((task) => task.status === 'Completed').length / data.tasks.length * 100) : 0}%`} detail="Of all assigned tasks" icon={<CheckCircleOutlined />} /></div>
    <div className="crm-grid-two"><section className="crm-panel"><div className="crm-panel-head"><div><h2>Pipeline by stage</h2><p>Value of all opportunities</p></div></div><div className="crm-funnel">{dealStages.map((stage) => { const value = data.deals.filter((deal) => deal.stage === stage).reduce((total, deal) => total + Number(deal.amount || 0), 0); const max = Math.max(...dealStages.map((item) => data.deals.filter((deal) => deal.stage === item).reduce((total, deal) => total + Number(deal.amount || 0), 0)), 1); return <div key={stage} className="crm-funnel-row"><div className="crm-funnel-meta"><span>{stage}</span><strong>{money(value)}</strong></div><div className="crm-funnel-track"><div style={{ width: `${value / max * 100}%` }} /></div></div>; })}</div></section>
      <section className="crm-panel"><div className="crm-panel-head"><div><h2>Lead sources</h2><p>Where interest starts</p></div></div><div className="crm-funnel">{sources.map(({ source, count }) => <div key={source} className="crm-funnel-row"><div className="crm-funnel-meta"><span>{source}</span><strong>{count} leads</strong></div><div className="crm-funnel-track"><div style={{ width: `${count / Math.max(data.leads.length, 1) * 100}%` }} /></div></div>)}</div></section></div>
    <section className="crm-panel"><div className="crm-panel-head"><div><h2>Team snapshot</h2><p>Ownership across the sales cycle</p></div></div><div className="crm-table-scroll"><table className="crm-table"><thead><tr><th>Owner</th><th>Leads</th><th>Open deals</th><th>Open pipeline</th><th>Tasks to do</th></tr></thead><tbody>{owners.map((owner) => <tr key={owner}><td><strong>{owner}</strong></td><td>{data.leads.filter((lead) => lead.owner === owner).length}</td><td>{open.filter((deal) => deal.owner === owner).length}</td><td>{money(open.filter((deal) => deal.owner === owner).reduce((total, deal) => total + Number(deal.amount || 0), 0))}</td><td>{data.tasks.filter((task) => task.owner === owner && task.status !== 'Completed').length}</td></tr>)}</tbody></table></div></section>
  </>;
};

export const Workspace: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reset } = useCrm();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const segment = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const definition = modules.find((item) => item.key === segment);
  const title = segment === 'dashboard' ? 'Dashboard' : segment === 'reports' ? 'Reports' : segment === 'ai-automations' ? 'AI Automations' : definition?.title || 'Dashboard';
  React.useEffect(() => { document.title = `${title} | Logic Grid CRM`; setMobileOpen(false); }, [location.pathname, title]);

  const sidebar = <><div className="crm-brand" onClick={() => navigate('/')} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') navigate('/'); }}><img src={`${process.env.PUBLIC_URL}/Logic-Grid Logo.svg`} alt="Logic Grid" className="crm-logo-img" /><small>CRM DEMO</small></div><div className="crm-nav">{navigation.map((group) => <div key={group.label}><div className="crm-nav-label">{group.label}</div>{group.items.map((item) => <NavLink key={item.key} to={item.path} end={item.path === '/'} className={({ isActive }) => `crm-nav-item${isActive ? ' active' : ''}`}>{icons[item.key]}<span>{item.label}</span></NavLink>)}</div>)}</div><div className="crm-sidebar-footer"><span className="crm-demo-dot" /> Sample workspace <small>Explore freely · changes stay on this device</small></div></>;

  const handleGlobalSearch = (event: React.FormEvent) => { event.preventDefault(); if (globalSearch.trim()) navigate(`/leads?q=${encodeURIComponent(globalSearch.trim())}`); };
  const resetDemo = () => Modal.confirm({ title: 'Reset sample data?', content: 'This restores the original demo records and removes changes made in this browser.', className: 'crm-confirm-modal', centered: true, icon: <ThunderboltOutlined />, okText: 'Reset workspace', cancelText: 'Cancel', onOk: () => { reset(); message.success('Sample data restored'); navigate('/'); } });

  return <div className="crm-shell"><aside className="crm-sidebar">{sidebar}</aside><Drawer placement="left" open={mobileOpen} onClose={() => setMobileOpen(false)} width={260} className="crm-mobile-drawer" styles={{ body: { padding: 0, background: '#041B39' }, header: { background: '#041B39', color: 'white' } }}>{sidebar}</Drawer>
    <div className="crm-main"><header className="crm-topbar"><button className="crm-mobile-menu" aria-label="Open menu" onClick={() => setMobileOpen(true)}><MenuOutlined /></button><div className="crm-breadcrumb">Workspace <span>/</span> <strong>{title}</strong></div><div className="crm-top-actions"><form onSubmit={handleGlobalSearch} className="crm-global-search"><SearchOutlined /><input aria-label="Search leads" value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Search leads" /></form><button className="crm-reset" onClick={resetDemo}>Reset demo</button><Avatar style={{ background: '#0067E8' }} icon={<UserOutlined />} /></div></header>
      <main className="crm-content">{segment === 'dashboard' ? <Overview /> : segment === 'reports' ? <Reports /> : segment === 'ai-automations' ? <AiAutomations /> : definition ? <ModulePage key={definition.key} definition={definition} /> : <Overview />}</main>
    </div>
  </div>;
};

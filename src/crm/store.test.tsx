import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CrmProvider, useCrm } from './store';

const LeadConversionProbe: React.FC = () => {
  const { data, convertLead, runAutomation } = useCrm();
  return <>
    <span data-testid="counts">{data.contacts.length}/{data.companies.length}/{data.deals.length}/{data.activities.length}</span>
    <span data-testid="lead-status">{data.leads[0].status}</span>
    <button onClick={() => convertLead(data.leads[0].id)}>Convert lead</button>
    <button onClick={() => runAutomation('instant-follow-up')}>Run follow-up</button>
    <span data-testid="ai-tasks">{data.tasks.filter((task) => task.title.startsWith('AI follow-up:')).length}</span>
  </>;
};

beforeEach(() => localStorage.clear());

test('converting a lead creates related CRM records only once', () => {
  render(<CrmProvider><LeadConversionProbe /></CrmProvider>);
  expect(screen.getByTestId('counts').textContent).toBe('3/3/4/3');

  fireEvent.click(screen.getByRole('button', { name: 'Convert lead' }));
  expect(screen.getByTestId('counts').textContent).toBe('4/4/5/4');
  expect(screen.getByTestId('lead-status').textContent).toBe('Converted');

  fireEvent.click(screen.getByRole('button', { name: 'Convert lead' }));
  expect(screen.getByTestId('counts').textContent).toBe('4/4/5/4');
  expect(JSON.parse(localStorage.getItem('logic-grid-crm-demo-v1') || '{}').leads[0].status).toBe('Converted');
});

test('AI follow-up creates tasks once for new leads', () => {
  render(<CrmProvider><LeadConversionProbe /></CrmProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Run follow-up' }));
  expect(screen.getByTestId('ai-tasks').textContent).toBe('2');
  fireEvent.click(screen.getByRole('button', { name: 'Run follow-up' }));
  expect(screen.getByTestId('ai-tasks').textContent).toBe('2');
});

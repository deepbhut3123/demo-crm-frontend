# Logic Grid CRM client demo

Run `npm.cmd start` from this directory and open `http://localhost:3000`.

The app opens without a login. It contains sample data for leads, contacts, companies, deals, tasks, activities, support tickets, and campaigns. The dashboard and reports use the same records as the modules.

AI automation is the featured experience. Open **AI Automations** to score and qualify leads, create instant follow-ups, rescue late-stage deals, turn meetings into next steps, triage tickets, and generate a weekly sales digest. These workflows update the same browser-local demo records, so every run has a visible result in the related CRM module.

Try converting a lead to create a contact, company, deal, and activity. On Deals, switch between table and pipeline views and change a deal's stage. Add, edit, delete, search, and filter records to demonstrate everyday CRM work. Changes stay in this browser's local storage; **Reset demo** restores the original sample records.

This is a presentation demo. Its AI behavior is deterministic and runs locally against sample data; it does not call an external AI model, connect to the legacy ERP API, send emails, or sync data across users or devices.

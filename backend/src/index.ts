import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:4200').split(',').map((x) => x.trim()).filter(Boolean);
app.use(helmet());
app.use(cors({ origin: (origin, callback) => !origin || allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error('Origin is not allowed by CORS')) }));
app.use(express.json({ limit: '200kb' }));

const inputSchema = z.object({
  projectName: z.string().trim().min(1).max(100),
  technology: z.string().trim().min(1).max(300),
  description: z.string().trim().min(10).max(5000),
  dependencies: z.array(z.string().trim().min(1).max(150)).max(100).default([])
});
type Analysis = { summary: string; modernization: string[]; security: string[]; migration: string[]; nextSteps: string[]; caveat: string };

function demoAnalysis(input: z.infer<typeof inputSchema>): Analysis {
  const inventory = [input.technology, input.description, ...input.dependencies].join(' ').toLowerCase();
  const modernization: string[] = [];
  const security: string[] = [];
  const migration: string[] = [];
  if (/angular\s*(1[0-8])|angularjs|backbone|aurelia|struts|jsp/.test(inventory)) modernization.push('Inventory framework and runtime versions, map critical user journeys, and plan incremental modernization behind stable API contracts.');
  if (/java\s*(8|9|1[0-7])/.test(inventory)) modernization.push('Assess a supported Java LTS target and validate library, build-plugin, runtime-image and TLS compatibility before upgrading.');
  if (/redis|valkey/.test(inventory)) migration.push('Document cache topology, eviction and persistence expectations, TLS/authentication, failover behavior and latency budgets.');
  if (/db2/.test(inventory)) migration.push('Validate DB2 driver compatibility, connection pooling, transaction semantics, network latency, backup and recovery requirements.');
  if (/openshift|kubernetes/.test(inventory)) migration.push('Review probes, resource requests/limits, routes/ingress, secrets, network policies, pod security and rollout strategy.');
  if (/azure/.test(inventory)) migration.push('Map identity, network boundaries, managed services, observability, cost controls and recovery objectives to the target Azure landing zone.');
  modernization.push('Add characterization tests around high-value workflows before refactoring; define measurable acceptance criteria.');
  if (input.dependencies.length) security.push('Generate an SBOM from real lockfiles and run an approved SCA scanner; this demo does not query vulnerability databases or verify CVEs.');
  security.push('Scan repositories and deployment configuration for exposed secrets; rotate credentials that may have been committed.');
  security.push('Define least-privilege service identities, TLS requirements, audit events and data-retention boundaries.');
  security.push('Add SAST, dependency, container-image and infrastructure-as-code checks to CI.');
  migration.push('Build a dependency map and sequence migration waves by business criticality, coupling, operational risk and rollback complexity.');
  return {
    summary: input.projectName + ' is described as ' + input.technology + '. This first-pass assessment is based only on supplied text and dependency names; it has not inspected source code or runtime environments.',
    modernization, security, migration,
    nextSteps: ['Confirm the inventory with application owners and record unknowns as assumptions.', 'Choose one low-risk workflow for a time-boxed proof of concept.', 'Baseline reliability, performance and delivery metrics before changing the system.'],
    caveat: 'Illustrative heuristic output. This is not a vulnerability scan, code audit, architecture discovery or migration approval. Validate recommendations with engineers and approved tools.'
  };
}

async function azureAnalysis(input: z.infer<typeof inputSchema>): Promise<Analysis> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT!.replace(/\/$/, '');
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;
  const version = process.env.AZURE_OPENAI_API_VERSION ?? '2024-10-21';
  const response = await fetch(endpoint + '/openai/deployments/' + deployment + '/chat/completions?api-version=' + version, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': process.env.AZURE_OPENAI_API_KEY! },
    body: JSON.stringify({ temperature: 0.2, response_format: { type: 'json_object' }, messages: [
      { role: 'system', content: 'You are an enterprise modernization advisor. Return JSON with summary, modernization[], security[], migration[], nextSteps[], caveat. Use only supplied facts. Never claim to verify vulnerabilities or inspect code. State uncertainty. Do not recommend destructive actions.' },
      { role: 'user', content: JSON.stringify(input) }
    ] })
  });
  if (!response.ok) throw new Error('Azure OpenAI request failed (' + response.status + ')');
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Azure OpenAI returned an empty response');
  const parsed = JSON.parse(raw) as Partial<Analysis>;
  return { summary: String(parsed.summary ?? 'No summary returned.'), modernization: Array.isArray(parsed.modernization) ? parsed.modernization.map(String) : [], security: Array.isArray(parsed.security) ? parsed.security.map(String) : [], migration: Array.isArray(parsed.migration) ? parsed.migration.map(String) : [], nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps.map(String) : [], caveat: String(parsed.caveat ?? 'AI-generated guidance requires human validation.') };
}

app.get('/health', (_req, res) => res.json({ status: 'ok', mode: process.env.AZURE_OPENAI_API_KEY ? 'azure-openai' : 'demo' }));
app.post('/api/analyze', async (req, res) => {
  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  try {
    const configured = Boolean(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_DEPLOYMENT);
    const analysis = configured ? await azureAnalysis(parsed.data) : demoAnalysis(parsed.data);
    return res.json({ project: parsed.data.projectName, mode: configured ? 'azure-openai' : 'demo', generatedAt: new Date().toISOString(), analysis });
  } catch (error) {
    console.error('Analysis provider failed:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(502).json({ error: 'Analysis provider failed. Check server configuration and logs.' });
  }
});
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log('Modernization Assistant API listening on port ' + port));

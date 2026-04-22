
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /ai/chat - AI chat endpoint
router.post('/chat', authMiddleware, async (req, res) => {
  const { projectId, message, conversationHistory } = req.body;

  if (!projectId || !message) {
    throw new Error('projectId and message are required');
  }

  // Gather project context for the AI
  const scaffolds = await pb.collection('scaffold_requests').getList(1, 10, {
    filter: `projectId = "${projectId}"`,
    sort: '-created'
  });
  
  const diaryEntries = await pb.collection('diary_entries').getList(1, 5, {
    filter: `project_id = "${projectId}"`,
    sort: '-date'
  });
  
  const deliveries = await pb.collection('material_deliveries').getList(1, 5, {
    filter: `project_id = "${projectId}"`,
    sort: '-delivery_date'
  });

  const alerts = await pb.collection('alerts').getList(1, 5, {
    filter: `project_id = "${projectId}" && is_read = false`,
    sort: '-created'
  });

  const context = {
    recentScaffolds: scaffolds.items.map(s => ({ location: s.location, status: s.status, type: s.type })),
    recentDiaryEntries: diaryEntries.items.map(d => ({ date: d.date, weather: d.weather, workers: d.personnel_count })),
    recentDeliveries: deliveries.items.map(d => ({ date: d.delivery_date, status: d.status, lkw: d.lkw_id })),
    activeAlerts: alerts.items.map(a => ({ type: a.type, severity: a.severity, title: a.title }))
  };

  const systemPrompt = `You are an expert AI assistant for a scaffolding management platform called TrackMyScaffolding. 
You help project coordinators and subcontractors manage their sites.
Here is the current context for the project they are asking about:
${JSON.stringify(context, null, 2)}

Answer the user's question accurately based on this context. Be concise, professional, and helpful. 
If the user asks something outside the context, politely explain what information you have access to.`;

  // Call OpenAI API
  const apiKey = process.env.OPENAI_API_KEY;
  let responseText = '';
  
  if (!apiKey) {
    logger.warn('OPENAI_API_KEY not found. Using fallback mock response.');
    responseText = `I am operating in fallback mode because the OpenAI API key is missing. However, I can see you have ${context.activeAlerts.length} active alerts and ${context.recentScaffolds.length} recent scaffold requests. How else can I help?`;
  } else {
    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(conversationHistory || []).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!openAiRes.ok) {
      const errorData = await openAiRes.json();
      throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiData = await openAiRes.json();
    responseText = aiData.choices[0].message.content;
  }

  // Generate contextual suggestions
  const suggestions = [
    "What are my active alerts?",
    "Summarize recent scaffold requests.",
    "Were there any material deliveries today?"
  ];

  res.json({ response: responseText, suggestions });
});

// GET /ai/alerts - Get AI-generated alerts
router.get('/alerts', authMiddleware, async (req, res) => {
  const { project_id } = req.query;

  if (!project_id) {
    throw new Error('project_id is required');
  }

  const alerts = [];

  // Get scaffolds with no activity >7 days
  const scaffolds = await pb.collection('scaffold_requests').getFullList({
    filter: `projectId = "${project_id}"`,
  });

  for (const scaffold of scaffolds) {
    const lastUpdate = new Date(scaffold.updated);
    const daysSinceUpdate = Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate > 7) {
      alerts.push({
        type: 'no_activity',
        message: `Scaffold at ${scaffold.location} has no activity for ${daysSinceUpdate} days`,
        related_item_id: scaffold.id,
        priority: 'medium',
      });
    }
  }

  // Check for pending requests >48h
  const pendingScaffolds = scaffolds.filter(s => s.status === 'pending');
  for (const scaffold of pendingScaffolds) {
    const createdDate = new Date(scaffold.created);
    const hoursSinceCreation = Math.floor((Date.now() - createdDate) / (1000 * 60 * 60));

    if (hoursSinceCreation > 48) {
      alerts.push({
        type: 'pending_request',
        message: `Scaffold request at ${scaffold.location} pending for ${hoursSinceCreation} hours`,
        related_item_id: scaffold.id,
        priority: 'medium',
      });
    }
  }

  // Check for missing diary entries
  const diaryEntries = await pb.collection('diary_entries').getFullList({
    filter: `project_id = "${project_id}"`,
  });

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = diaryEntries.find(d => d.date.startsWith(today));

  if (!todayEntry) {
    alerts.push({
      type: 'missing_diary',
      message: 'No diary entry for today',
      related_item_id: project_id,
      priority: 'low',
    });
  }

  res.json(alerts);
});

// POST /ai/draft-diary-entry - Generate natural language diary entry draft
router.post('/draft-diary-entry', authMiddleware, async (req, res) => {
  const { projectId, date } = req.body;

  if (!projectId || !date) {
    throw new Error('projectId and date are required');
  }

  const targetDate = new Date(date);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  const dateStr = targetDate.toISOString().split('T')[0];
  const nextDayStr = nextDay.toISOString().split('T')[0];

  const scaffolds = await pb.collection('scaffold_requests').getFullList({
    filter: `projectId = "${projectId}" && requestedDate >= "${dateStr}" && requestedDate < "${nextDayStr}"`,
  });

  const deliveries = await pb.collection('material_deliveries').getFullList({
    filter: `project_id = "${projectId}" && delivery_date >= "${dateStr}" && delivery_date < "${nextDayStr}"`,
  });

  let draftText = `Site activities for ${dateStr}:\n\n`;
  let hasActivity = false;

  if (scaffolds.length > 0) {
    hasActivity = true;
    draftText += `Scaffolding Operations:\n`;
    scaffolds.forEach(s => {
      draftText += `- Erected ${s.type.toLowerCase()} scaffold at ${s.location}. Status: ${s.status}.\n`;
    });
    draftText += `\n`;
  }

  if (deliveries.length > 0) {
    hasActivity = true;
    draftText += `Material Deliveries:\n`;
    deliveries.forEach(d => {
      draftText += `- Received delivery from ${d.driver_name || 'driver'} (LKW: ${d.lkw_id}).\n`;
    });
    draftText += `\n`;
  }

  if (!hasActivity) {
    draftText += "No specific scaffolding or material delivery activities were recorded in the system for today. General site work and maintenance continued as planned.";
  } else {
    draftText += "All operations proceeded according to safety guidelines.";
  }

  res.json({ draftText });
});

// POST /ai/prefill - Get prefill suggestions
router.post('/prefill', authMiddleware, async (req, res) => {
  const { project_id, contractor_id } = req.body;

  if (!project_id || !contractor_id) {
    throw new Error('project_id and contractor_id are required');
  }

  const previousRequests = await pb.collection('scaffold_requests').getFullList({
    filter: `createdBy = "${contractor_id}"`,
    sort: '-created',
    limit: 5,
  });

  const locations = previousRequests.map(r => r.location);
  const suggestedLocation = locations.length > 0 ? locations[0] : '';

  res.json({
    suggested_location: suggestedLocation,
    suggested_level: '', 
  });
});

export default router;

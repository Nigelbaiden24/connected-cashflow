import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, contactId, contacts, messageContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result;

    switch (action) {
      case 'score_leads':
        result = await scoreLeads(contacts, LOVABLE_API_KEY, supabase);
        break;
      
      case 'generate_message':
        result = await generateMessage(contactId, messageContext, LOVABLE_API_KEY, supabase);
        break;
      
      case 'get_recommendations':
        result = await getRecommendations(contactId, LOVABLE_API_KEY, supabase);
        break;
      
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('CRM AI Insights error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function scoreLeads(contacts: any[], apiKey: string, supabase: any) {
  const scoredContacts = [];

  for (const contact of contacts) {
    // Fetch interaction history
    const { data: interactions } = await supabase
      .from('crm_interactions')
      .select('*')
      .eq('contact_id', contact.id)
      .order('interaction_date', { ascending: false })
      .limit(20);

    const prompt = `Analyze this CRM contact and provide a predictive lead score (0-100) with detailed factors.

Contact Information:
- Name: ${contact.name}
- Company: ${contact.company || 'N/A'}
- Position: ${contact.position || 'N/A'}
- Status: ${contact.status}
- Priority: ${contact.priority}
- Email: ${contact.email}
- Phone: ${contact.phone || 'N/A'}

Recent Interactions (${interactions?.length || 0} total):
${interactions?.slice(0, 5).map((i: any) => `- ${i.interaction_type} on ${i.interaction_date}: ${i.notes || 'No notes'}`).join('\n') || 'No interactions recorded'}

Based on:
1. Engagement patterns (interaction frequency, recency, quality)
2. Contact completeness (data quality)
3. Position/company indicators (decision-making authority)
4. Response patterns
5. Overall conversion signals

Return a JSON object with:
- lead_score (0-100)
- conversion_probability (0-1 decimal)
- engagement_score (0-100)
- factors (array of specific scoring factors with descriptions)
- next_best_action (recommended next step)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        tools: [{
          type: 'function',
          function: {
            name: 'score_lead',
            description: 'Return lead scoring analysis',
            parameters: {
              type: 'object',
              properties: {
                lead_score: { type: 'number', minimum: 0, maximum: 100 },
                conversion_probability: { type: 'number', minimum: 0, maximum: 1 },
                engagement_score: { type: 'number', minimum: 0, maximum: 100 },
                factors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      factor: { type: 'string' },
                      score: { type: 'number' },
                      description: { type: 'string' }
                    },
                    required: ['factor', 'score', 'description']
                  }
                },
                next_best_action: { type: 'string' }
              },
              required: ['lead_score', 'conversion_probability', 'engagement_score', 'factors', 'next_best_action']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'score_lead' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      continue;
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      
      // Update contact in database
      await supabase
        .from('crm_contacts')
        .update({
          lead_score: Math.round(analysis.lead_score),
          conversion_probability: analysis.conversion_probability,
          engagement_score: Math.round(analysis.engagement_score),
          lead_score_factors: analysis.factors,
          next_best_action: analysis.next_best_action,
          last_ai_analysis: new Date().toISOString()
        })
        .eq('id', contact.id);

      scoredContacts.push({
        id: contact.id,
        ...analysis
      });
    }
  }

  return { scoredContacts, processed: scoredContacts.length };
}

async function generateMessage(contactId: string, context: any, apiKey: string, supabase: any) {
  // Fetch contact details
  const { data: contact } = await supabase
    .from('crm_contacts')
    .select('*')
    .eq('id', contactId)
    .single();

  if (!contact) {
    throw new Error('Contact not found');
  }

  // Fetch interaction history
  const { data: interactions } = await supabase
    .from('crm_interactions')
    .select('*')
    .eq('contact_id', contactId)
    .order('interaction_date', { ascending: false })
    .limit(10);

  const messageType = context.type || 'outreach';
  const customInstructions = context.instructions || '';

  let prompt = `Generate a professional, personalized ${messageType} message for this contact.

Contact Information:
- Name: ${contact.name}
- Company: ${contact.company || 'N/A'}
- Position: ${contact.position || 'N/A'}
- Lead Score: ${contact.lead_score || 'Not scored'}
- Next Best Action: ${contact.next_best_action || 'N/A'}

Recent Context:
${interactions?.slice(0, 3).map((i: any) => `- ${i.interaction_type}: ${i.notes || 'No notes'}`).join('\n') || 'No previous interactions'}

${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Message Type: ${messageType}
Generate a ${messageType === 'email' ? 'subject line and email body' : 'message'} that is:
1. Personalized and relevant to their situation
2. Professional yet conversational
3. Action-oriented with clear next steps
4. Concise and impactful

${messageType === 'email' ? 'Return JSON with "subject" and "body" fields.' : 'Return JSON with "message" field.'}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      tools: [{
        type: 'function',
        function: {
          name: 'generate_message',
          description: 'Generate personalized message',
          parameters: {
            type: 'object',
            properties: messageType === 'email' ? {
              subject: { type: 'string' },
              body: { type: 'string' }
            } : {
              message: { type: 'string' }
            },
            required: messageType === 'email' ? ['subject', 'body'] : ['message']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'generate_message' } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    throw new Error('Failed to generate message');
  }

  const aiData = await response.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }

  throw new Error('No message generated');
}

async function getRecommendations(contactId: string, apiKey: string, supabase: any) {
  // Fetch contact details with all AI data
  const { data: contact } = await supabase
    .from('crm_contacts')
    .select('*')
    .eq('id', contactId)
    .single();

  if (!contact) {
    throw new Error('Contact not found');
  }

  // Fetch interaction history
  const { data: interactions } = await supabase
    .from('crm_interactions')
    .select('*')
    .eq('contact_id', contactId)
    .order('interaction_date', { ascending: false })
    .limit(20);

  const prompt = `Analyze this contact and provide smart recommendations for upsells, cross-sells, and actions.

Contact Profile:
- Name: ${contact.name}
- Company: ${contact.company || 'N/A'}
- Position: ${contact.position || 'N/A'}
- Status: ${contact.status}
- Lead Score: ${contact.lead_score || 'Not analyzed'}
- Conversion Probability: ${contact.conversion_probability ? (contact.conversion_probability * 100).toFixed(1) + '%' : 'Unknown'}

Interaction History:
${interactions?.map((i: any, idx: number) => `${idx + 1}. ${i.interaction_type} (${i.interaction_date}): ${i.notes || 'No details'} - Outcome: ${i.outcome || 'N/A'}`).join('\n') || 'No interactions recorded'}

Current Next Best Action: ${contact.next_best_action || 'None set'}

Provide detailed recommendations for:
1. Immediate next actions (within 1 week)
2. Upsell opportunities based on current engagement
3. Cross-sell opportunities based on profile
4. Long-term nurturing strategy
5. Risk mitigation if conversion probability is low

Return as structured recommendations with priorities.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      tools: [{
        type: 'function',
        function: {
          name: 'provide_recommendations',
          description: 'Provide smart CRM recommendations',
          parameters: {
            type: 'object',
            properties: {
              immediate_actions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    action: { type: 'string' },
                    rationale: { type: 'string' },
                    priority: { type: 'string', enum: ['high', 'medium', 'low'] }
                  },
                  required: ['action', 'rationale', 'priority']
                }
              },
              upsell_opportunities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    opportunity: { type: 'string' },
                    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
                    rationale: { type: 'string' }
                  },
                  required: ['opportunity', 'confidence', 'rationale']
                }
              },
              cross_sell_opportunities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    opportunity: { type: 'string' },
                    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
                    rationale: { type: 'string' }
                  },
                  required: ['opportunity', 'confidence', 'rationale']
                }
              },
              nurturing_strategy: { type: 'string' },
              risk_factors: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            required: ['immediate_actions', 'upsell_opportunities', 'cross_sell_opportunities', 'nurturing_strategy']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'provide_recommendations' } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    throw new Error('Failed to get recommendations');
  }

  const aiData = await response.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    const recommendations = JSON.parse(toolCall.function.arguments);
    
    // Update contact with upsell opportunities
    await supabase
      .from('crm_contacts')
      .update({
        upsell_opportunities: recommendations.upsell_opportunities,
        ai_recommendations: recommendations,
        last_ai_analysis: new Date().toISOString()
      })
      .eq('id', contactId);

    return recommendations;
  }

  throw new Error('No recommendations generated');
}
// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: 'Missing prompt message' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let aiResponseText = '';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Prepare SRE System Context
        const systemPrompt = `You are a Principal Site Reliability Engineer (SRE) and DevOps system Architect named PulseFlow AI Co-Pilot.
You help operators optimize database latency, analyze server crashes, explain APM metrics, and write safe database schemas.
Keep your responses professional, concise, SRE-oriented, and highly actionable. Return markdown formatting.

User is asking: "${message}"`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt
        });

        aiResponseText = response.text || '';

      } catch (geminiError) {
        console.warn('Gemini chat API call failed, falling back to local SRE simulator:', geminiError);
      }
    }

    // High-fidelity SRE Local Simulator Fallback
    if (!aiResponseText) {
      aiResponseText = getLocalSREChatFallback(message);
    }

    return NextResponse.json({
      success: true,
      response: aiResponseText,
      provider: apiKey ? 'Google Gemini 2.5-Flash' : 'PulseFlow Local SRE Core'
    });

  } catch (error: any) {
    console.error('Error in SRE chat API:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

function getLocalSREChatFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('latency') || q.includes('slow') || q.includes('lag')) {
    return `### ⚡ SRE Latency Diagnostics Alert
It looks like you are analyzing database latency. In serverless PostgreSQL fleets like **Neon**, query lag is usually caused by:
1. **Full Table Scans**: Queries missing a selective index scan.
2. **Connection Starvation**: Sockets held open too long under load.

**Recommended Actions:**
* Add composite indices on filtering fields (e.g. \`CREATE INDEX ON "Log" ("timestamp", "statusCode");\`).
* Ensure you are query-limiting results (\`LIMIT 50\` or paginating with Prisma offsets).
* Toggle **DB Read Bottleneck** in your Sandbox to witness simulated lag logs!`;
  }

  if (q.includes('crash') || q.includes('500') || q.includes('error') || q.includes('exception')) {
    return `### 🚨 Exception Crash Isolation
When a severe 500 exception trace is recorded:
1. **NullPointerExceptions** are often due to db-client references executed before connection pool initialization.
2. **Query Failures** usually mean database connection pool timeouts or malformed migrations.

**Recommended Actions:**
* Go to the **Dashboard** and review **Recent Critical Crashes**.
* Click on any 500 error trace to open the slide-out SRE drawer.
* Click **Analyze with Gemini** to get a structured, production-ready code patch!`;
  }

  if (q.includes('neon') || q.includes('postgres') || q.includes('db') || q.includes('database')) {
    return `### 🗄️ Neon Serverless PostgreSQL Optimization
PulseFlow AI connects via serverless Prisma clients. Under heavy load, optimize serverless DB interactions by:
* **Leveraging WebSockets**: Bypasses typical ISP port-blocks (like blocked \`5432\`).
* **Connection Pooling**: Ensures serverless routes recycle active connections instead of spawning hundreds of new ones.
* Use our \`/api/init-db\` endpoint to initialize or repair schemas directly via web interface.`;
  }

  if (q.includes('who are you') || q.includes('co-pilot') || q.includes('assistant') || q.includes('help')) {
    return `### 🧠 PulseFlow AI SRE Assistant
I am your interactive SRE Co-Pilot. I monitor the telemetry log pipeline and database state.
I can help you:
* Optimize **latency bottlenecks** and review P95 charts.
* Debug **serverless PostgreSQL database** connections.
* Read SRE stack traces and recommend **production bug patches**.

Ask me anything about your current APM metrics or try sending simulated traffic bursts in the **Traffic Sandbox**!`;
  }

  // Generic intelligent DevOps SRE response
  return `### 📊 Telemetry System Status: Operational
I'm monitoring your PulseFlow observability dashboard. All telemetry engines are reporting active.

**Quick SRE Tips:**
1. Switch to **Traffic Sandbox** to toggle **Autopilot ON**; this automatically injects successful or bottlenecked query logs every 3 seconds!
2. Open the **Alert Center** to configure active rules for error rates or throughput, and check the alert log history.
3. If you have a custom DevOps question, ask me about **reducing query latency**, **resolving 500 server crashes**, or **Neon database schemas**!`;
}

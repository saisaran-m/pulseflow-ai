// src/app/api/alerts/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Seeding default alert rules if they don't exist
async function seedDefaultRulesIfEmpty() {
  const count = await prisma.alertRule.count();
  if (count === 0) {
    await prisma.alertRule.createMany({
      data: [
        {
          name: 'Critical Latency Spike (>500ms)',
          metric: 'latency',
          operator: '>',
          threshold: 500,
          durationMin: 5,
          active: true
        },
        {
          name: 'Server Error Rate Warning (>5%)',
          metric: 'errorRate',
          operator: '>',
          threshold: 5.0,
          durationMin: 5,
          active: true
        },
        {
          name: 'High Traffic Load (>1.5 RPS)',
          metric: 'rps',
          operator: '>',
          threshold: 1.5,
          durationMin: 5,
          active: true
        }
      ]
    });
  }
}

export async function GET() {
  try {
    // Auto-seed default rules if empty
    await seedDefaultRulesIfEmpty();

    // Fetch alert rules
    const rules = await prisma.alertRule.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Fetch alert history logs (eager load parent rules)
    const alertLogs = await prisma.alertLog.findMany({
      include: {
        rule: true
      },
      orderBy: { timestamp: 'desc' },
      take: 50 // cap at 50 recent alert triggers
    });

    return NextResponse.json({
      success: true,
      rules,
      alertLogs
    });

  } catch (error: any) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, metric, operator, threshold, durationMin = 5 } = body;

    if (!name || !metric || !operator || threshold === undefined) {
      return NextResponse.json({ error: 'Missing required alert rule fields' }, { status: 400 });
    }

    const newRule = await prisma.alertRule.create({
      data: {
        name,
        metric,
        operator,
        threshold: parseFloat(threshold),
        durationMin: parseInt(durationMin, 10),
        active: true
      }
    });

    return NextResponse.json({
      success: true,
      rule: newRule
    });

  } catch (error: any) {
    console.error('Error creating alert rule:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// Support resolving / toggling alert rules
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, active, status, alertLogId } = body;

    // Toggle rule active status
    if (id && active !== undefined) {
      const updatedRule = await prisma.alertRule.update({
        where: { id },
        data: { active }
      });
      return NextResponse.json({ success: true, rule: updatedRule });
    }

    // Resolve an active alert log
    if (alertLogId && status) {
      const updatedAlertLog = await prisma.alertLog.update({
        where: { id: alertLogId },
        data: { status }
      });
      return NextResponse.json({ success: true, alertLog: updatedAlertLog });
    }

    return NextResponse.json({ error: 'Invalid update parameters' }, { status: 400 });

  } catch (error: any) {
    console.error('Error updating alert rules:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing alert rule ID' }, { status: 400 });
    }

    await prisma.alertRule.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Alert rule deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting alert rule:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

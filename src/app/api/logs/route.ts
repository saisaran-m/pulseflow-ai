// src/app/api/logs/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const path = searchParams.get('path') || undefined;
    const method = searchParams.get('method') || undefined;
    const statusClass = searchParams.get('statusClass') || 'all'; // all, 2xx, 3xx, 4xx, 5xx
    const timeRange = searchParams.get('timeRange') || '24h'; // 1h, 24h, 7d

    const offset = (page - 1) * limit;

    // Define time threshold
    let timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000); // default 24h
    let bucketIntervalMs = 60 * 60 * 1000; // 1 hour bucket for 24h
    let rpsDivisor = 24 * 60 * 60; // 86400 seconds

    if (timeRange === '1h') {
      timeLimit = new Date(Date.now() - 60 * 60 * 1000);
      bucketIntervalMs = 5 * 60 * 1000; // 5 minute bucket for 1h
      rpsDivisor = 60 * 60; // 3600 seconds
    } else if (timeRange === '7d') {
      timeLimit = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      bucketIntervalMs = 12 * 60 * 60 * 1000; // 12 hour bucket for 7d
      rpsDivisor = 7 * 24 * 60 * 60;
    }

    // Build SQLite query filters
    const whereClause: any = {
      timestamp: { gte: timeLimit }
    };

    if (path) whereClause.path = path;
    if (method) whereClause.method = method;

    // Handle status classification filters
    if (statusClass === '2xx') {
      whereClause.statusCode = { gte: 200, lte: 299 };
    } else if (statusClass === '3xx') {
      whereClause.statusCode = { gte: 300, lte: 399 };
    } else if (statusClass === '4xx') {
      whereClause.statusCode = { gte: 400, lte: 499 };
    } else if (statusClass === '5xx') {
      whereClause.statusCode = { gte: 500, lte: 599 };
    }

    // 1. Fetch paginated logs matching the current filters
    const logs = await prisma.log.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      skip: offset,
      take: limit
    });

    const totalLogs = await prisma.log.count({ where: whereClause });
    const totalPages = Math.max(1, Math.ceil(totalLogs / limit));

    // 2. Fetch ALL logs in this timerange to compute core dashboard metrics
    // We omit path/method/statusClass filters here for overall system stats, or apply them depending on the spec. 
    // Usually, dashboard filters apply to the entire metrics set. Let's compute metrics based on the applied filters!
    const allRecentLogs = await prisma.log.findMany({
      where: whereClause,
      select: {
        statusCode: true,
        duration: true,
        timestamp: true
      }
    });

    const totalCount = allRecentLogs.length;

    // Compute metrics
    let averageLatency = 0;
    let p95Latency = 0;
    let errorRate = 0;
    let rps = 0;

    if (totalCount > 0) {
      // Average Latency
      const sumLatency = allRecentLogs.reduce((sum, log) => sum + log.duration, 0);
      averageLatency = sumLatency / totalCount;

      // P95 Latency Calculation
      const sortedDurations = allRecentLogs.map(l => l.duration).sort((a, b) => a - b);
      const p95Index = Math.floor(sortedDurations.length * 0.95);
      p95Latency = sortedDurations[p95Index];

      // Error Rate (StatusCodes >= 400)
      const errorCount = allRecentLogs.filter(l => l.statusCode >= 400).length;
      errorRate = (errorCount / totalCount) * 100;

      // Throughput (Requests Per Second)
      rps = totalCount / rpsDivisor;
    }

    // 3. Bucket data for Recharts time-series visualization
    const chartData = generateChartBuckets(allRecentLogs, timeLimit, bucketIntervalMs, timeRange);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total: totalLogs,
        totalPages
      },
      metrics: {
        totalRequests: totalCount,
        averageLatency,
        p95Latency,
        errorRate,
        rps
      },
      chartData
    });

  } catch (error: any) {
    console.error('Error fetching logs and metrics:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// Generate time-series buckets to aggregate requests, errors, and average latency
function generateChartBuckets(logs: any[], startTime: Date, intervalMs: number, timeRange: string) {
  const buckets: { [key: string]: { timestamp: string; requests: number; errors: number; totalDuration: number; latency: number } } = {};
  const endTime = new Date();

  // 1. Initialize all buckets chronologically to prevent gaps in charts
  let currentBucketTime = new Date(startTime.getTime());
  while (currentBucketTime <= endTime) {
    const bucketKey = getBucketKey(currentBucketTime, timeRange);
    buckets[bucketKey] = {
      timestamp: bucketKey,
      requests: 0,
      errors: 0,
      totalDuration: 0,
      latency: 0
    };
    currentBucketTime = new Date(currentBucketTime.getTime() + intervalMs);
  }

  // Ensure current time has a bucket
  const endKey = getBucketKey(endTime, timeRange);
  if (!buckets[endKey]) {
    buckets[endKey] = { timestamp: endKey, requests: 0, errors: 0, totalDuration: 0, latency: 0 };
  }

  // 2. Aggregate logs into buckets
  for (const log of logs) {
    const logTime = new Date(log.timestamp);
    const bucketKey = getBucketKey(logTime, timeRange);

    if (buckets[bucketKey]) {
      buckets[bucketKey].requests++;
      if (log.statusCode >= 400) {
        buckets[bucketKey].errors++;
      }
      buckets[bucketKey].totalDuration += log.duration;
    }
  }

  // 3. Calculate average latency per bucket and format to array
  return Object.values(buckets).map(b => {
    b.latency = b.requests > 0 ? Math.round(b.totalDuration / b.requests) : 0;
    // Remove temporary totalDuration accumulator from final JSON payload
    const { totalDuration, ...cleaned } = b as any;
    return cleaned;
  });
}

// Format bucket keys based on timeRange scale
function getBucketKey(date: Date, timeRange: string): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  if (timeRange === '1h') {
    // Bucket by 5-minute mark (e.g. 10:05, 10:10)
    const minutesMark = (Math.floor(date.getMinutes() / 5) * 5).toString().padStart(2, '0');
    return `${hours}:${minutesMark}`;
  } 
  
  if (timeRange === '7d') {
    // Bucket by Day and AM/PM or hour
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `${dayName} ${hours}:00`;
  }

  // Default: 24h - bucket by hour (e.g. 14:00)
  return `${hours}:00`;
}

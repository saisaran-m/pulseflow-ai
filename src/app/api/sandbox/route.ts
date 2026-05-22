// src/app/api/sandbox/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const MOCK_IPS = [
  '192.168.1.105', '198.51.100.42', '203.0.113.195', '185.190.140.2', 
  '93.184.216.34', '142.250.190.46', '104.244.42.1', '69.171.230.68'
];

const MOCK_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'PulseFlowObserver/2.4.0 (Observability Daemon)',
  'PostmanRuntime/7.35.0'
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenario, method = 'GET', path = '/api/users' } = body;

    let statusCode = 200;
    let duration = 50; // ms
    let responseBody = '';
    let errorMessage: string | null = null;
    let stackTrace: string | null = null;
    let requestPayload: string | null = null;

    // Generate simulated user info
    const randomIp = MOCK_IPS[Math.floor(Math.random() * MOCK_IPS.length)];
    const randomUserAgent = MOCK_USER_AGENTS[Math.floor(Math.random() * MOCK_USER_AGENTS.length)];

    // Generate request payloads for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
      if (path === '/api/payment') {
        requestPayload = JSON.stringify({ amount: 99.99, currency: 'USD', token: 'tok_pulse_8892' });
      } else if (path === '/api/users') {
        requestPayload = JSON.stringify({ name: 'Jane Doe', email: 'jane.doe@example.com', role: 'developer' });
      } else {
        requestPayload = JSON.stringify({ key: 'value', updated: true });
      }
    }

    // Process scenarios
    switch (scenario) {
      case 'success':
        statusCode = method === 'POST' ? 201 : 200;
        duration = Math.floor(Math.random() * 120) + 30; // 30 - 150ms
        responseBody = JSON.stringify({
          status: 'success',
          timestamp: new Date().toISOString(),
          data: path === '/api/users' 
            ? [{ id: 1, name: 'John Doe', email: 'john@example.com' }, { id: 2, name: 'Jane Doe', email: 'jane@example.com' }]
            : path === '/api/payment' 
              ? { transactionId: 'tx_98231', status: 'approved', fee: 2.99 }
              : { ok: true, data: { itemsCount: 42 } }
        });
        break;

      case 'database_lag':
        statusCode = 200;
        // Simulate heavy SQL bottleneck (e.g. unindexed join)
        duration = Math.floor(Math.random() * 1200) + 1400; // 1400 - 2600ms
        responseBody = JSON.stringify({
          status: 'success',
          cached: false,
          executionTimeMs: duration,
          warning: 'Unindexed query detected in database planner',
          data: Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `Record_${i + 1}`, value: Math.random() * 100 }))
        });
        break;

      case 'auth_failure':
        statusCode = 401;
        duration = Math.floor(Math.random() * 30) + 5; // 5 - 35ms
        errorMessage = 'Invalid authorization API key header provided';
        responseBody = JSON.stringify({
          error: 'Unauthorized',
          code: 401,
          message: 'The API key provided is invalid or has expired. Obtain a new key from the dashboard settings.',
          documentation: 'https://docs.pulseflow.ai/errors/unauthorized'
        });
        break;

      case 'server_error':
        statusCode = 500;
        duration = Math.floor(Math.random() * 500) + 200; // 200 - 700ms
        errorMessage = 'NullReferenceException: Cannot invoke "com.pulseflow.database.ClientConnection.executeQuery(String)" because "this.dbClient" is null';
        stackTrace = `java.lang.NullPointerException: Cannot invoke "com.pulseflow.database.ClientConnection.executeQuery(String)" because "this.dbClient" is null
    at com.pulseflow.api.UserController.getUserProfile(UserController.java:42)
    at com.pulseflow.api.UserController$$FastClassBySpringCGLIB$$b89ac911.invoke(<generated>)
    at org.springframework.cglib.proxy.MethodProxy.invoke(MethodProxy.java:218)
    at org.springframework.aop.framework.CglibAopProxy$CglibMethodInvocation.invokeJoinpoint(CglibAopProxy.java:779)
    at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:163)
    at org.springframework.aop.framework.CglibAopProxy$DynamicAdvisedInterceptor.intercept(CglibAopProxy.java:691)
    at com.pulseflow.api.UserController$$EnhancerBySpringCGLIB$$8d0a3d42.getUserProfile(<generated>)
    at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
    at java.base/java.lang.reflect.Method.invoke(Method.java:580)
    at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:205)
    at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:150)
    at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:118)
    at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:893)`;
        
        responseBody = JSON.stringify({
          error: 'Internal Server Error',
          code: 500,
          traceId: 'trace-a7b2-c981-d1f0',
          message: 'An unexpected crash occurred in the backend application engine. System operators have been notified.'
        });
        break;

      case 'rate_limit':
        statusCode = 429;
        duration = Math.floor(Math.random() * 15) + 3; // 3 - 18ms
        errorMessage = `RateLimitExceeded: Client IP ${randomIp} crossed threshold of 60 req/min`;
        responseBody = JSON.stringify({
          error: 'Too Many Requests',
          code: 429,
          retryAfterSeconds: 15,
          message: 'API rate limits exceeded. You are limited to 60 calls per minute. Standard plans can upgrade threshold.'
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid scenario provided' }, { status: 400 });
    }

    // Insert the generated log into SQLite
    const createdLog = await prisma.log.create({
      data: {
        method,
        path,
        statusCode,
        duration,
        ip: randomIp,
        userAgent: randomUserAgent,
        requestPayload,
        responseBody,
        errorMessage,
        stackTrace
      }
    });

    // Evaluate all active Alert Rules in the database
    const alertEvaluationResult = await evaluateAlertRules();

    return NextResponse.json({
      status: 'success',
      log: createdLog,
      alertsEvaluated: alertEvaluationResult.count,
      alertsTriggered: alertEvaluationResult.triggered
    });

  } catch (error: any) {
    console.error('Error generating sandbox traffic:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// Check alert rules based on metrics from the last 5 minutes of telemetry
async function evaluateAlertRules() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  // Fetch active alert rules
  const activeRules = await prisma.alertRule.findMany({
    where: { active: true }
  });

  if (activeRules.length === 0) {
    return { count: 0, triggered: 0 };
  }

  // Get total telemetry stats over the last 5 minutes to evaluate rules
  const recentLogs = await prisma.log.findMany({
    where: {
      timestamp: { gte: fiveMinutesAgo }
    }
  });

  const totalLogsCount = recentLogs.length;
  if (totalLogsCount === 0) {
    return { count: activeRules.length, triggered: 0 };
  }

  let triggeredCount = 0;

  for (const rule of activeRules) {
    let currentValue = 0;
    let isViolated = false;
    let message = '';

    if (rule.metric === 'latency') {
      // Calculate average latency
      const totalLatency = recentLogs.reduce((sum, l) => sum + l.duration, 0);
      currentValue = totalLatency / totalLogsCount;
      isViolated = rule.operator === '>' ? currentValue > rule.threshold : currentValue < rule.threshold;
      message = `Average latency is ${currentValue.toFixed(1)}ms, which exceeds rule threshold of ${rule.threshold}ms (evaluated over 5m).`;
    } 
    else if (rule.metric === 'errorRate') {
      // Calculate percentage of logs with 4xx or 5xx
      const errorLogs = recentLogs.filter(l => l.statusCode >= 400).length;
      currentValue = (errorLogs / totalLogsCount) * 100;
      isViolated = rule.operator === '>' ? currentValue > rule.threshold : currentValue < rule.threshold;
      message = `Telemetry error rate is ${currentValue.toFixed(1)}%, which exceeds threshold of ${rule.threshold}% (evaluated over 5m).`;
    } 
    else if (rule.metric === 'rps') {
      // Calculate RPS (Requests per second over the last 5 minutes)
      // 5 minutes = 300 seconds
      currentValue = totalLogsCount / 300;
      isViolated = rule.operator === '>' ? currentValue > rule.threshold : currentValue < rule.threshold;
      message = `System throughput is ${currentValue.toFixed(2)} RPS, which crosses rule threshold of ${rule.threshold} RPS.`;
    }

    if (isViolated) {
      triggeredCount++;

      // Check if we already have an active alert log for this rule in the last 2 minutes to prevent spamming
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const existingAlert = await prisma.alertLog.findFirst({
        where: {
          ruleId: rule.id,
          timestamp: { gte: twoMinutesAgo },
          status: 'ACTIVE'
        }
      });

      if (!existingAlert) {
        await prisma.alertLog.create({
          data: {
            ruleId: rule.id,
            value: currentValue,
            message,
            status: 'ACTIVE'
          }
        });
      }
    }
  }

  return { count: activeRules.length, triggered: triggeredCount };
}

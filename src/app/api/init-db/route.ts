// src/app/api/init-db/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    console.log("Starting cloud database tables initialization...");

    // 1. Create Schema
    await prisma.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS "public";');

    // 2. Create Log Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Log" (
        "id" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "method" TEXT NOT NULL,
        "path" TEXT NOT NULL,
        "statusCode" INTEGER NOT NULL,
        "duration" INTEGER NOT NULL,
        "ip" TEXT NOT NULL,
        "userAgent" TEXT NOT NULL,
        "requestPayload" TEXT,
        "responseBody" TEXT,
        "errorMessage" TEXT,
        "stackTrace" TEXT,

        CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
      );
    `);

    // 3. Create AlertRule Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AlertRule" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "metric" TEXT NOT NULL,
        "operator" TEXT NOT NULL,
        "threshold" DOUBLE PRECISION NOT NULL,
        "durationMin" INTEGER NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
      );
    `);

    // 4. Create AlertLog Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AlertLog" (
        "id" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "ruleId" TEXT NOT NULL,
        "value" DOUBLE PRECISION NOT NULL,
        "message" TEXT NOT NULL,
        "status" TEXT NOT NULL,

        CONSTRAINT "AlertLog_pkey" PRIMARY KEY ("id")
      );
    `);

    // 5. Create Indexes for telemetry optimization
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Log_timestamp_idx" ON "Log"("timestamp");');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Log_path_idx" ON "Log"("path");');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Log_statusCode_idx" ON "Log"("statusCode");');

    // 6. Add Foreign Key relation
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "AlertLog" 
        ADD CONSTRAINT "AlertLog_ruleId_fkey" 
        FOREIGN KEY ("ruleId") REFERENCES "AlertRule"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log("Foreign key constraint applied successfully.");
    } catch (e: any) {
      // Ignore if constraint already exists
      console.log("Foreign key constraint might already exist (ignored):", e.message);
    }

    console.log("Database tables initialization completed successfully!");

    return NextResponse.json({ 
      success: true, 
      message: "PulseFlow AI database tables and indexes created successfully in your Neon PostgreSQL database!",
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Database initialization failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to initialize database tables.", 
      details: error.message || error 
    }, { status: 500 });
  }
}

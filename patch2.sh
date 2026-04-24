#!/usr/bin/env bash
perl -pi -e 's/import\.meta\.env\?\.PROD/process.env.NODE_ENV === "production"/' src/lib/logger.ts
perl -pi -e 's/import\.meta\.env\?\.PROD/process.env.NODE_ENV === "production"/' src/lib/profiler.ts

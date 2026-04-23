sed -i 's/import\.meta\.env\?.PROD/process.env.NODE_ENV === "production"/' src/lib/logger.ts
sed -i 's/import\.meta\.env\?.PROD/process.env.NODE_ENV === "production"/' src/lib/profiler.ts

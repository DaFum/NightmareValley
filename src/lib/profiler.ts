type ProfilerHandle = { start: number };

export function startProfiler(name = 'profile'): ProfilerHandle | null {
	if (process.env.NODE_ENV === 'production') return null;
	return { start: Date.now() };
}

export function stopProfiler(handle: ProfilerHandle | null, name = 'profile') {
	if (!handle) return;
	const ms = Date.now() - handle.start;
	// eslint-disable-next-line no-console
	console.info(`Profiler(${name}): ${ms}ms`);
}



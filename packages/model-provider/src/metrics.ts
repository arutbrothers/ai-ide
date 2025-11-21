export interface ModelMetrics {
    provider: string;
    model: string;
    totalRequests: number;
    totalTokens: number;
    avgLatency: number; // ms
    successRate: number; // %
    cost: number; // $ (0 for local)
}

export interface MetricRecord {
    provider: string;
    model: string;
    tokens: number;
    latency: number;
    success: boolean;
    error?: string;
    timestamp: Date;
}

export class MetricsCollector {
    private records: MetricRecord[] = [];

    async track(provider: string, model: string, tokens: number, latency: number, success: boolean, error?: string): Promise<void> {
        this.records.push({
            provider,
            model,
            tokens,
            latency,
            success,
            error,
            timestamp: new Date(),
        });
    }

    async getMetrics(provider?: string): Promise<ModelMetrics[]> {
        const filtered = provider
            ? this.records.filter(r => r.provider === provider)
            : this.records;

        const groups = new Map<string, MetricRecord[]>();

        for (const record of filtered) {
            const key = `${record.provider}:${record.model}`;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(record);
        }

        const metrics: ModelMetrics[] = [];

        for (const [key, records] of groups.entries()) {
            const [prov, mod] = key.split(':');
            const totalRequests = records.length;
            const successCount = records.filter(r => r.success).length;
            const totalTokens = records.reduce((sum, r) => sum + r.tokens, 0);
            const totalLatency = records.reduce((sum, r) => sum + r.latency, 0);

            metrics.push({
                provider: prov,
                model: mod,
                totalRequests,
                totalTokens,
                avgLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
                successRate: totalRequests > 0 ? (successCount / totalRequests) * 100 : 0,
                cost: 0 // logic to calculate cost based on provider/model prices could go here
            });
        }

        return metrics;
    }
}

export const metricsCollector = new MetricsCollector();

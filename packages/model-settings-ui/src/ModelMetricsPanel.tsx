import React, { useState, useEffect } from 'react';
import { ModelMetrics, MetricsCollector } from '@ai-ide/model-provider';

interface Props {
    collector: MetricsCollector;
}

export const ModelMetricsPanel: React.FC<Props> = ({ collector }) => {
    const [metrics, setMetrics] = useState<ModelMetrics[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await collector.getMetrics();
            setMetrics(data);
        };
        load();
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, [collector]);

    return (
        <div className="metrics-panel">
            <h3>Model Performance</h3>
            <table>
                <thead>
                    <tr>
                        <th>Provider</th>
                        <th>Model</th>
                        <th>Requests</th>
                        <th>Avg Latency</th>
                        <th>Success Rate</th>
                        <th>Cost</th>
                    </tr>
                </thead>
                <tbody>
                    {metrics.map((m, i) => (
                        <tr key={`${m.provider}-${m.model}-${i}`}>
                            <td>{m.provider}</td>
                            <td>{m.model}</td>
                            <td>{m.totalRequests}</td>
                            <td>{m.avgLatency.toFixed(0)}ms</td>
                            <td>{m.successRate.toFixed(1)}%</td>
                            <td>${m.cost.toFixed(4)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

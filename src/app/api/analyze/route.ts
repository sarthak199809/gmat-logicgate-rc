import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { fullText } = await request.json();

        const n8nWebhookUrl = process.env.N8N_ANALYZE_URL;

        if (!n8nWebhookUrl) {
            console.warn('N8N_ANALYZE_URL not defined. Using mock analysis logic.');

            // Mock splitting by double newlines
            const paragraphs = fullText.split('\n\n').filter(Boolean).map((text: string, i: number) => {
                const roles = ['Context', 'Historical Viewpoint', 'Counter-point', 'Supporting Evidence', 'Conclusion'];
                return {
                    text,
                    role: roles[i] || 'Evidence',
                    summary: `Summary of paragraph ${i + 1}: ${text.substring(0, 50)}...`,
                    pivots: text.match(/\b(While|However|Furthermore|Ultimately|But|Yet|Despite)\b/gi) || []
                };
            });

            return NextResponse.json({ paragraphs });
        }

        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fullText }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch analysis from n8n');
        }

        const result = await response.json();

        // n8n Agent nodes can return deeply nested arrays/objects
        // Extract paragraphs from result[0].output[0].output.paragraphs or similar
        let data = result;
        if (Array.isArray(data)) data = data[0];
        if (data && data.output) {
            if (Array.isArray(data.output)) data = data.output[0];
            else data = data.output;
        }
        if (data && data.output) data = data.output; // Some agents nest output twice

        const finalData = data || {};
        return NextResponse.json(finalData);
    } catch (error: any) {
        console.error('Error in /api/analyze:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

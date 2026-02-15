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

        const resultText = await response.text();
        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            console.error('Failed to parse n8n response as JSON. Raw body:', resultText);
            throw new Error(`Invalid JSON response from n8n: ${resultText.substring(0, 100)}`);
        }

        // n8n Agent nodes can return deeply nested arrays/objects
        let data = result;
        if (Array.isArray(data)) data = data[0];
        if (data && data.output) {
            if (Array.isArray(data.output)) data = data.output[0];
            else data = data.output;
        }
        if (data && data.output) data = data.output;

        if (!data || !data.paragraphs) {
            console.error('N8N response missing paragraphs:', data);
            throw new Error('Analysis response structure invalid');
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error in /api/analyze:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

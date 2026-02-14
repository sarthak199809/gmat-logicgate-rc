import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { user_summary, expert_summary, role_selected, expert_role } = body;

        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

        if (!n8nWebhookUrl) {
            console.warn('N8N_WEBHOOK_URL not defined. Using mock evaluation logic.');
            // Mock validation logic
            const isValid = user_summary.length > 20 && role_selected === expert_role;
            const hint = isValid ? '' : 'Try to capture more detail and ensure you identify the correct functional role.';

            return NextResponse.json({ isValid, hint });
        }

        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch from n8n');
        }

        const result = await response.json();

        // handle potential n8n nested structure
        let data = result;
        if (Array.isArray(data)) data = data[0];
        if (data && data.output) {
            if (Array.isArray(data.output)) data = data.output[0];
            else data = data.output;
        }
        if (data && data.output) data = data.output;

        const finalData = data || { isValid: false, hint: 'Analysis failed to return result' };
        return NextResponse.json(finalData);
    } catch (error: any) {
        console.error('Error in /api/evaluate:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

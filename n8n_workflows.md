# n8n Workflow JSONs

Copy and paste these JSON blocks directly into your n8n workspace (CMD/CTRL + V).

## 1. Passage Analysis Workflow
This workflow receives the full text, splits it into paragraphs, and identifies roles/summaries.

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "analyze-passage",
        "options": {}
      },
      "id": "webhook-analyze",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [400, 300]
    },
    {
      "parameters": {
          "promptType": "define",
          "text": "={{ $json.body.fullText }}",
          "options": {
            "systemMessage": "You are a GMAT Reading Comprehension Expert specializing in 'Structural Logic'. Analyze the passage and break it into structured JSON.\n\nInstructions:\n1. Split the passage into natural paragraphs.\n2. Assign a Functional Role to each: Context, Background, Historical Viewpoint, Current Strategy, Counter-point, Alternative Hypothesis, Rebuttal, Evidence, Supporting Evidence, Supporting Detail, Hypothesis, Limitation, Conclusion.\n3. Write a concise, one-sentence Expert Summary for each.\n4. Identify Logical Pivots (however, moreover, despite, etc.).\n\nReturn ONLY strict JSON:\n{\n  \"paragraphs\": [\n    {\n      \"text\": \"...\",\n      \"role\": \"...\",\n      \"summary\": \"...\",\n      \"pivots\": [\"...\"]\n    }\n  ]\n}"
          }
      },
      "id": "agent-analyze",
      "name": "AI Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1,
      "position": [620, 300]
    },
    {
      "parameters": {
        "options": {}
      },
      "id": "respond-analyze",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [840, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "AI Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI Agent": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 2. Summary Evaluation Workflow
This workflow compares the user summary and role against the expert version.

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "evaluate-summary",
        "options": {}
      },
      "id": "webhook-evaluate",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [400, 500]
    },
    {
      "parameters": {
          "promptType": "define",
          "text": "=User Summary: {{ $json.body.user_summary }}\nUser Role: {{ $json.body.role_selected }}\nExpert Summary: {{ $json.body.expert_summary }}\nExpert Role: {{ $json.body.expert_role }}",
          "options": {
            "systemMessage": "You are a GMAT Verbal Tutor. Determine if the student captured the logical intent of the paragraph.\n\nEvaluation Rules:\n1. Role Match: If role_selected doesn't align with expert_role, isValid is false.\n2. Intent Match: Capture the structural purpose (e.g., if it's a Rebuttal, they must mention the counter-argument).\n3. Feedback: If invalid, provide a structural hint without giving the answer.\n\nReturn ONLY strict JSON:\n{\n  \"isValid\": true/false,\n  \"hint\": \"...\"\n}"
          }
      },
      "id": "agent-evaluate",
      "name": "AI Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1,
      "position": [620, 500]
    },
    {
      "parameters": {
        "options": {}
      },
      "id": "respond-evaluate",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [840, 500]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "AI Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI Agent": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

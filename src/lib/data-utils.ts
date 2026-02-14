import Papa from 'papaparse';

export type Paragraph = {
    text: string;
    role: string;
    summary: string;
    pivots: string[];
};

export type Passage = {
    id: string;
    title: string;
    difficulty: 'Very Easy' | 'Easy' | 'Medium' | 'Medium-Hard' | 'Hard';
    fullText: string;
    paragraphs?: Paragraph[]; // Optional because it's populated by AI
};

export async function fetchPassages(): Promise<Passage[]> {
    const response = await fetch('data/passages.csv');
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                const passages: Passage[] = data.map((row) => ({
                    id: row.id,
                    title: row.title,
                    difficulty: row.difficulty,
                    fullText: row.full_text || '',
                }));
                resolve(passages);
            },
            error: (error: any) => {
                reject(error);
            },
        });
    });
}

export function getRandomPassageByDifficulty(passages: Passage[], difficulty: string): Passage | null {
    const filtered = passages.filter((p) => p.difficulty === difficulty);
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
}

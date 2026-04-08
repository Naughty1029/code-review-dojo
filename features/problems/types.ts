export interface Problem {
    id: string;
    title: string;
    description: string;
    context: Context;
    code_before: string | null;
    code_after: string;
    code_diff: string | null;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    expected_issues: Record<string, unknown>; // FIXME: 「AIが採点に使うデータ」で構造がまだ固まっていないので、現状はとりあえずRecord<string, unknown>で表現する。必要に応じて適宜型を定義していくこと。
    is_published: boolean;
    created_at: string;
}

export interface Context {
    project_overview: string;
    tech_stack: string;
    pr_description: string;
}
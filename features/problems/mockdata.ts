
import { Problem } from './types';

export const mockProblems: Pick<Problem, "id" | "title" | "difficulty" | "category" | "description">[] = [
  {
    id: "1",
    title: "useEffectの依存配列不足によるデータ不整合",
    difficulty: "easy",
    category: "React Patterns",
    description: "propsが変更された際に副作用が再実行されない不具合を修正し、リンターの警告を適切に処理してください。"
  },
  {
    id: "2",
    title: "型安全性を損なうany型の乱用",
    difficulty: "easy",
    category: "TypeScript",
    description: "APIレスポンスの型定義がanyになっており、ランタイムエラーのリスクがあります。適切なInterfaceまたはTypeを定義してください。"
  },
  {
    id: "3",
    title: "不要なレンダリングを引き起こす関数の定義",
    difficulty: "medium",
    category: "パフォーマンス",
    description: "子コンポーネントへ渡すコールバック関数が、親のリレンダー毎に再生成されています。メモ化による最適化を検討してください。"
  },
  {
    id: "4",
    title: "dangerouslySetInnerHTMLによるXSS脆弱性",
    difficulty: "medium",
    category: "セキュリティ",
    description: "外部ソースからのHTMLを直接レンダリングしています。サニタイズ処理、または代替の実装方法を提案してください。"
  },
  {
    id: "5",
    title: "マジックナンバーと曖昧な命名の改善",
    difficulty: "easy",
    category: "可読性・命名",
    description: "コード内の数値や変数名が文脈を持っていないため、第三者が理解しにくい状態です。定数化と適切な命名への修正を行ってください。"
  }
];


export const mockProblemDetail: Problem[] = [
  {
    id: "1",
    title: "useEffectの依存配列が空になっているReactコンポーネント",
    description: "useEffectの依存配列に問題があるコンポーネントをレビューしてください。",
    context: {
      project_overview: "中規模ECサイトの商品検索機能。ユーザーがキーワードを入力すると商品一覧がリアルタイムで更新される。",
      tech_stack: "Next.js 14, TypeScript, React 18, Tailwind CSS",
      pr_description: "商品検索コンポーネントを新規作成。キーワードが変わるたびにAPIを呼び出して検索結果を表示する。",
    },
    code_before: null,
    code_after: `
    import { useState, useEffect } from 'react';
  
    type Product = {
      id: string;
      name: string;
      price: number;
    };
  
    type Props = {
      keyword: string;
      categoryId: string;
    };
  
    export function ProductSearch({ keyword, categoryId }: Props) {
      const [products, setProducts] = useState<Product[]>([]);
      const [isLoading, setIsLoading] = useState(false);
  
      useEffect(() => {
        setIsLoading(true);
        fetch(\`/api/products?q=\${keyword}&category=\${categoryId}\`)
          .then((res) => res.json())
          .then((data) => {
            setProducts(data);
            setIsLoading(false);
          });
      }, []); // 問題箇所
  
      if (isLoading) return <p>読み込み中...</p>;
  
      return (
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              {p.name} - {p.price.toLocaleString()}円
            </li>
          ))}
        </ul>
      );
    }
    `.trim(),
    expected_issues: {
      issues: [
        {
          severity: "critical",
          point: "useEffectの依存配列が空（[]）になっているため、keywordが変わってもAPIが再実行されない。",
          suggestion: "依存配列に keyword を追加する。",
          guideline: "機能・正確性",
        },
        {
          severity: "minor",
          point: "fetchのエラーハンドリングがない。ネットワークエラー時にユーザーへの通知がない。",
          suggestion: "try/catch またはcatch()でエラー状態をstateに持ち、エラー表示を追加する。",
          guideline: "可読性・堅牢性",
        },
        {
          severity: "minor",
          point: "ローディング状態がない。API呼び出し中は空リストが表示されUXが悪い。",
          suggestion: "isLoadingのstateを追加してローディング表示を出す。",
          guideline: "可読性・UX",
        },
      ],
    },
    code_diff:  null,
    difficulty: "easy",
    category: "React Patterns",
    is_published: true,
    created_at: "2024-01-01T00:00:00Z",
}
]

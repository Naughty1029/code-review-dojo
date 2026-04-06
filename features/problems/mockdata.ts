
import { ProblemListItem } from './types';

export const mockProblems: ProblemListItem[] = [
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
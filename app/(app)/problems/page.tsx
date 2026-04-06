import { mockProblems } from '@/features/problems/mockdata';

export default function ProblemsPage() {
  return (
    <ul className='w-6/12 m-auto'>
        {mockProblems.map((problem) => (
            <li key={problem.id} className='pb-2 mb-2 border-b'>
                <h2>タイトル：{problem.title}</h2>
                <div>難易度：{problem.difficulty}</div>
                <div>カテゴリ：{problem.category}</div>
                <div>概要：{problem.description}</div>
            </li>
        ))}
    </ul>
  )
}

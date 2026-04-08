import { mockProblemDetail } from "@/features/problems/mockdata";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { codeToHtml } from "shiki";

export default async function ProblemPage(
    {
        params
    } :  { 
        params: Promise<{id:string}>
    }) {
    const { id } = await params;
    const problem = mockProblemDetail.find((p) => p.id === id);
    if (!problem) {
        return <div>問題が見つかりませんでした。</div>
    }
    const beforeHtml = await codeToHtml(problem.code_before ? problem.code_before : "", {
        lang: "typescript",
        theme: "github-dark",
    })
    const afterHtml = await codeToHtml(problem.code_after ? problem.code_after : "", {
        lang: "typescript",
        theme: "github-dark",
    })
  return (
    <div>
        <Card>
            <CardHeader className="border-b">
                <CardTitle>コンテキストカード</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <dl>
                    <dt>プロジェクト概要</dt>
                    <dd>{problem.context.project_overview}</dd>
                </dl>
                <dl>
                    <dt>技術スタック</dt>
                    <dd>{problem.context.tech_stack}</dd>
                </dl>
                <dl>
                    <dt>PR説明</dt>
                    <dd>{problem.context.pr_description}</dd>
                </dl>
            </CardContent>
            <CardFooter className="border-t flex gap-2">
                <Badge>{problem.difficulty}</Badge>
                <Badge>{problem.category}</Badge>
            </CardFooter>
        </Card>
        <div className="flex gap-2">
            {problem.code_before ? (
                <div className="mt-4 w-1/2 overflow-x-auto" dangerouslySetInnerHTML={{ __html: beforeHtml }} />
            ) : (
                <div className="mt-4 w-1/2 overflow-x-auto flex justify-center items-center ">変更前コードはありません</div>
            )}
            <div className="mt-4 w-1/2 overflow-x-auto" dangerouslySetInnerHTML={{ __html: afterHtml }} />
        </div>
    </div>
  )
}

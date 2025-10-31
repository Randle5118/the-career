"use client";

import { useRouter } from "next/navigation";
import { Heading } from "@/components/catalyst/heading";
import { FileText, Briefcase, TestTube2, ArrowRight } from "lucide-react";

type TestType = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  status: "available" | "coming-soon";
};

export default function TestPage() {
  const router = useRouter();
  
  const testTypes: TestType[] = [
    {
      id: "job-posting-analysis",
      title: "求人票分析テスト",
      description: "求人票PDFをアップロードしてAI分析をテストします",
      icon: <Briefcase className="w-8 h-8" />,
      path: "/dashboard/test/job-posting",
      status: "available"
    },
    {
      id: "simple-pdf-extract",
      title: "簡単PDF文字抽出",
      description: "PDFから文字を抽出して表示します（基本テスト）",
      icon: <FileText className="w-8 h-8" />,
      path: "/dashboard/test/simple-pdf-extract",
      status: "available"
    },
    {
      id: "pdf-text-extract",
      title: "PDF文字抽出テスト (批次)",
      description: "複数PDFから文字を抽出してWebhookに送信します",
      icon: <FileText className="w-8 h-8" />,
      path: "/dashboard/test/pdf-text-extract",
      status: "available"
    },
  ];
  
  const handleSelectTest = (test: TestType) => {
    if (test.status === "available") {
      router.push(test.path);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
          <div>
            <Heading>AI Test Lab</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              AI分析機能のテストと検証を行います
            </p>
          </div>
        </div>

        {/* Test Type Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {testTypes.map((test) => (
            <button
              key={test.id}
              onClick={() => handleSelectTest(test)}
              disabled={test.status === "coming-soon"}
              className={`
                relative bg-base-100 border-2 rounded-lg p-6 text-left transition-all
                ${test.status === "available" 
                  ? "border-base-300 hover:border-primary hover:shadow-lg cursor-pointer" 
                  : "border-base-300 opacity-50 cursor-not-allowed"
                }
              `}
            >
              {/* Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className={`
                  p-3 rounded-lg
                  ${test.status === "available" 
                    ? "bg-primary/10 text-primary" 
                    : "bg-base-200 text-base-content/50"
                  }
                `}>
                  {test.icon}
                </div>
                
                {test.status === "available" && (
                  <ArrowRight className="w-5 h-5 text-base-content/40" />
                )}
                
                {test.status === "coming-soon" && (
                  <span className="badge badge-sm badge-ghost">Coming Soon</span>
                )}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-base-content mb-2">
                {test.title}
              </h3>
              <p className="text-sm text-base-content/70 leading-relaxed">
                {test.description}
              </p>
            </button>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-info/10 border border-info/30 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <TestTube2 className="w-5 h-5 text-info mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-info mb-2">Test Lab について</h3>
              <p className="text-sm text-base-content/80 leading-relaxed">
                このセクションでは、AI機能の動作確認やパフォーマンステストを行うことができます。
                各テストモジュールでは、実際のn8nワークフローと連携してPDF解析やAI分析の動作を検証できます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

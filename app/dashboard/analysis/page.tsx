"use client";

import { useState } from "react";
import { Heading } from "@/components/catalyst/heading";
import { TrendingUp, Building2, DollarSign, MapPin, Users, Clock } from "lucide-react";

/**
 * 応募分析ページ
 * 
 * 目的：応募予定の企業を分析し、より良い意思決定をサポート
 * 
 * 予定機能：
 * - 企業情報の収集・整理
 * - 給与・福利厚生の比較
 * - 企業文化・評判の分析
 * - 面接準備のチェックリスト
 * - キャリアパスの可視化
 */
export default function AnalysisPage() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  return (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-4 py-8 md:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-4 dark:border-white/10 mb-8">
          <div>
            <Heading>応募分析</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              応募予定の企業を詳しく分析し、より良いキャリア選択をサポートします
            </p>
          </div>
          <button className="btn btn-primary">
            ＋ 企業を追加
          </button>
        </div>

        {/* Coming Soon State */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold text-base-content mb-3">
            応募分析機能 - 開発中
          </h2>
          
          <p className="text-base-content/60 text-center max-w-md mb-8">
            企業分析機能を準備中です。<br />
            近日中にリリース予定です。お楽しみに！
          </p>

          {/* 予定機能のプレビュー */}
          <div className="w-full max-w-4xl mt-8">
            <h3 className="text-lg font-semibold text-base-content mb-4 text-center">
              予定されている機能
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 企業情報 */}
              <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-base-content">企業情報</h4>
                </div>
                <p className="text-sm text-base-content/60">
                  企業の基本情報、事業内容、成長性などを一元管理
                </p>
              </div>

              {/* 給与分析 */}
              <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-base-content">給与比較</h4>
                </div>
                <p className="text-sm text-base-content/60">
                  給与・福利厚生を複数企業で比較分析
                </p>
              </div>

              {/* 勤務地分析 */}
              <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-base-content">勤務環境</h4>
                </div>
                <p className="text-sm text-base-content/60">
                  勤務地、リモート可否、通勤時間などを分析
                </p>
              </div>

              {/* 企業文化 */}
              <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-base-content">企業文化</h4>
                </div>
                <p className="text-sm text-base-content/60">
                  社風、働きやすさ、口コミ情報を整理
                </p>
              </div>

              {/* キャリアパス */}
              <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-base-content">成長機会</h4>
                </div>
                <p className="text-sm text-base-content/60">
                  キャリアパス、スキル開発の機会を分析
                </p>
              </div>

              {/* 面接準備 */}
              <div className="bg-base-100 border border-base-300 rounded-lg p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-pink-600" />
                  </div>
                  <h4 className="font-semibold text-base-content">面接準備</h4>
                </div>
                <p className="text-sm text-base-content/60">
                  面接対策、よくある質問、チェックリスト
                </p>
              </div>
            </div>
          </div>

          {/* 開発予定の注意書き */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl">
            <p className="text-sm text-blue-800 text-center">
              💡 <strong>開発予定</strong>: この機能は現在開発中です。リリースまでしばらくお待ちください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




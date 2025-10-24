/**
 * Applications Mock 數據
 * 
 * 代表未來的 applications 資料表
 * 包含所有應募相關的完整數據結構
 */

import type { Application } from "@/types/application";

export const MOCK_APPLICATIONS_FULL: Application[] = [
  {
    id: "app-001",
    userId: "user-001",
    companyName: "株式会社サンプル",
    companyUrl: "https://www.example.com",
    position: "フロントエンドエンジニア",
    status: "interview",
    employmentType: "full_time",
    applicationMethod: {
      type: "job_site",
      siteName: "LinkedIn",
      siteUrl: "https://www.linkedin.com/jobs/123",
      scoutType: "recruiter",
      recruiterName: "田中太郎",
      recruiterCompany: "株式会社リクルート",
      scoutName: "田中太郎",
      scoutCompany: "株式会社リクルート",
      scoutEmail: "tanaka@recruit.com",
      memo: "リクルーター経由でスカウトされた"
    },
    postedSalary: {
      minAnnualSalary: 600,
      maxAnnualSalary: 800,
      notes: "経験・スキルに応じて優遇",
    },
    desiredSalary: 750,
    offerSalary: undefined,
    tags: ["リモート可", "React", "TypeScript", "在宅勤務可能", "フルリモート可"],
    notes: "リモート勤務可能。技術スタックはReact, TypeScript。",
    schedule: {
      nextEvent: "カジュアル面談",
      deadline: "2025-10-15T14:00:00+09:00",
      interviewMethod: {
        type: "online",
        url: "https://meet.google.com/abc-defg-hij",
      },
    },
    createdAt: "2025-09-28T10:00:00Z",
    updatedAt: "2025-10-05T15:30:00Z",
  },
  {
    id: "app-002",
    userId: "user-001",
    companyName: "テック株式会社",
    companyUrl: "https://tech-company.jp",
    position: "バックエンドエンジニア",
    status: "applied",
    employmentType: "contract",
    applicationMethod: {
      type: "job_site",
      siteName: "Wantedly",
      siteUrl: "https://www.wantedly.com/companies/tech-company",
      scoutType: "direct",
      scoutName: "採用担当 鈴木",
      scoutCompany: "テック株式会社",
      scoutEmail: "suzuki@tech-company.jp",
      memo: "企業から直接スカウトされた"
    },
    postedSalary: {
      minAnnualSalary: 700,
      maxAnnualSalary: 1100,
      notes: "スタートアップ、成長企業"
    },
    desiredSalary: 800,
    tags: ["Go", "Docker", "スタートアップ"],
    notes: "新しい技術に挑戦したい",
    schedule: {
      nextEvent: "書類選考",
      deadline: "2025-10-20T15:00:00+09:00"
    },
    createdAt: "2025-09-15T09:00:00Z",
    updatedAt: "2025-10-01T14:45:00Z",
  },
  {
    id: "app-003",
    userId: "user-001",
    companyName: "リモートファースト企業",
    position: "フルリモートエンジニア",
    status: "bookmarked",
    employmentType: "full_time",
    applicationMethod: {
      type: "referral",
      referrerName: "佐藤健",
      personFrom: "元同僚",
      referrerEmail: "sato.ken@example.com",
      siteUrl: "https://remote-first.co.jp/careers",
      memo: "元同僚からの紹介、社風が良いらしい"
    },
    postedSalary: {
      minAnnualSalary: 850,
      maxAnnualSalary: 1000,
      notes: "グローバル、英語"
    },
    desiredSalary: 850,
    tags: ["フルリモート", "グローバル", "英語"],
    notes: "完全リモート、時間柔軟",
    schedule: undefined,
    createdAt: "2025-09-10T11:30:00Z",
    updatedAt: "2025-09-25T16:20:00Z",
  },
  {
    id: "app-004",
    userId: "user-001",
    companyName: "スタートアップXYZ",
    position: "CTO",
    status: "offer",
    employmentType: "full_time",
    applicationMethod: {
      type: "direct",
      siteUrl: "https://startup-xyz.com/careers",
      contactPerson: "CEO 山田さん",
      contactEmail: "yamada@startup-xyz.com",
      memo: "CEO直接連絡、ストックオプションあり"
    },
    postedSalary: undefined,
    desiredSalary: 1100,
    offerSalary: {
      currency: "JPY",
      salaryBreakdown: [
        { salaryType: "基本給", salary: 800 },
        { salaryType: "役職手当", salary: 200 },
        { salaryType: "業績賞与", salary: 100 }
      ],
      notes: "ストックオプション別"
    },
    tags: ["スタートアップ", "エグゼクティブ"],
    notes: "興味深いプロジェクト、後で詳細を確認する。",
    schedule: {
      nextEvent: "最終面接",
      deadline: "2025-10-18T15:00:00+09:00",
      interviewMethod: {
        type: "online",
        url: "https://meet.google.com/xyz-123-456"
      }
    },
    createdAt: "2025-09-20T13:45:00Z",
    updatedAt: "2025-10-05T17:15:00Z",
  },
  {
    id: "app-005",
    userId: "user-001",
    companyName: "IQVIA Solutions Japan G.K.",
    companyUrl: "https://www.iqvia.com/ja-jp/locations/japan/about-iqvia-japan",
    position: "Project Manager (Data Science Related Projects)",
    status: "bookmarked",
    employmentType: "full_time",
    applicationMethod: {
      type: "job_site",
      siteName: "LinkedIn",
      siteUrl: "https://www.linkedin.com/jobs/view/123456789",
      memo: "AI解析でPDFから自動抽出"
    },
    postedSalary: undefined,
    desiredSalary: undefined,
    offerSalary: undefined,
    tags: [
      "Project Management",
      "Data Science",
      "Healthcare",
      "BI",
      "AI",
      "Data Platform",
      "Global Team"
    ],
    notes: "このポジションは、大手外資系ヘルスケアサービス企業であるIQVIA Solutions JapanでのProject Manager職です。データ基盤・BI構築のソリューション提案、Data Services（ワンタイムレポート、カスタムデータ提供、KPIトラッキング）、SaaSソリューション、DWH/BI/AIソリューションの導入・運用におけるPM業務を担います。Globalチームとの連携も多く、ヘルスケア業界でのデータ分析・モデル構築の機会もあります。必須要件は、3名以上のシステム導入PM経験1年以上、提案書作成・プレゼン経験、高い論理的思考能力とコミュニケーションスキルです。日本語は流暢、英語は読み書きレベルが求められます。AIまたはデータ基盤に関する要件定義・実装経験、ヘルスケア業界経験は尚可です。",
    schedule: undefined,
    createdAt: "2025-10-23T07:42:24.958Z",
    updatedAt: "2025-10-23T07:42:24.958Z",
  },
  {
    id: "app-006",
    userId: "user-001",
    companyName: "株式会社Matchbox Technologies",
    companyUrl: "https://www.matchboxtech.co.jp/",
    position: "カスタマーサクセス 【自社プロダクト／日本の労働力不足に貢献】",
    status: "bookmarked",
    employmentType: "full_time",
    applicationMethod: {
      type: "job_site",
      siteName: "求人サイト",
      siteUrl: "https://www.matchboxtech.co.jp/careers",
      memo: "AI解析でPDFから自動抽出 (v2)"
    },
    postedSalary: {
      minAnnualSalary: 511,
      maxAnnualSalary: 712,
      notes: "月給制（基本給300000円〜）に加え固定残業代（月28時間分として65000円以上）支給。固定残業時間を超える時間外労働分は別途追加支給。ご経験やスキルに応じて決定。"
    },
    desiredSalary: undefined,
    offerSalary: undefined,
    tags: [
      "リモートワークOK",
      "完全週休2日制",
      "土日祝休み",
      "年間休日120日以上",
      "転勤なし",
      "カスタマーサクセス",
      "自社プロダクト",
      "法人営業経験歓迎",
      "コンサルティング経験歓迎",
      "社会貢献",
      "ワークライフバランス",
      "残業少なめ"
    ],
    notes: "matchboxの導入検討から契約中のお客様に対するカスタマーサクセス業務。労務課題の発見と解決支援を通じてお客様に成功体験を提供。自身のアイデアが実行に移される環境で、業務改善や生産性向上といった成果を実感できる。",
    schedule: {
      nextEvent: "書類選考",
      deadline: undefined,
      interviewMethod: {
        type: "in_person",
        address: "面接2回（1次：アンケート提出、2次：課題提出）"
      }
    },
    createdAt: "2025-10-24T02:08:50.434Z",
    updatedAt: "2025-10-24T02:08:50.434Z",
  },
  {
    id: "app-007",
    userId: "user-001",
    companyName: "株式会社ギークリー",
    companyUrl: "https://www.geekly.co.jp/corporate/about/outline/",
    position: "WEBディレクター（マネージャー）",
    status: "applied",
    employmentType: "full_time",
    applicationMethod: {
      type: "job_site",
      siteName: "株式会社ギークリー",
      siteUrl: "https://www.geekly.co.jp/corporate/about/outline/",
      memo: "AI解析でPDFから自動抽出 (v3)"
    },
    postedSalary: {
      minAnnualSalary: 600,
      maxAnnualSalary: 700,
      notes: "月給制（基本給300,000円〜）。上記基本給に加え、固定残業代（月45時間分として105,040円以上）支給。超過分は別途追加支給。固定深夜勤務手当24,000円。通勤手当（上限20,000円）。賞与年2回、昇給年2回。"
    },
    desiredSalary: undefined,
    offerSalary: undefined,
    tags: [
      "Webディレクター",
      "マネージャー",
      "IT業界",
      "人材紹介",
      "土日祝休み",
      "年間休日120日以上",
      "転勤なし",
      "副業可",
      "育休取得実績有",
      "書籍購入手当",
      "育児応援リモートワーク"
    ],
    notes: "IT業界に特化した人材紹介事業を展開し、急成長中の企業。マネージャーは裁量権が大きく、スピーディーな意思決定が可能。オウンドメディアなど新規事業も積極展開しており、業界内での競争力が高い。書籍購入手当、保育料補助、育児リモートワークなど福利厚生が充実しており、年間休日125日、育休復帰率100%と働きやすい環境が整っている。",
    schedule: undefined,
    createdAt: "2023-10-27T10:00:00Z",
    updatedAt: "2023-10-27T10:00:00Z",
  }
];

/**
 * 資料庫設計參考 - Applications 表
 * 
 * Table: applications
 * ├─ id (uuid, primary key)
 * ├─ user_id (uuid, foreign key -> auth.users)
 * ├─ company_name (text, not null)
 * ├─ company_url (text, nullable)
 * ├─ position (text, not null)
 * ├─ status (text, not null) -- 'bookmarked' | 'applied' | 'first_interview' | etc.
 * ├─ employment_type (text, not null)
 * ├─ application_method (jsonb, not null) -- { type, ...fields }
 * ├─ posted_salary (jsonb, nullable) -- { type, minAnnualSalary, maxAnnualSalary, notes }
 * ├─ desired_salary (numeric, nullable) -- 万円単位
 * ├─ offer_salary (jsonb, nullable) -- { currency, salaryBreakdown, notes }
 * ├─ tags (text[], nullable)
 * ├─ notes (text, nullable)
 * ├─ schedule (jsonb, nullable) -- { nextEvent, deadline, interviewMethod }
 * ├─ created_at (timestamptz, not null, default: now())
 * └─ updated_at (timestamptz, not null, default: now())
 * 
 * === Indexes 建議 ===
 * - applications(user_id, status) -- 查詢用戶的應募狀態
 * - applications(user_id, created_at DESC) -- 依時間排序
 * - applications(status, created_at DESC) -- 依狀態和時間排序
 * 
 * === RLS Policies 建議 ===
 * - SELECT: user_id = auth.uid()
 * - INSERT: user_id = auth.uid()
 * - UPDATE: user_id = auth.uid()
 * - DELETE: user_id = auth.uid()
 */

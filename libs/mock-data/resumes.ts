/**
 * Mock Resume Data
 * 
 * 這是履歷書的 mock 數據，用於開發和測試
 * 基於用戶提供的實際履歷資料
 * 
 * Mock User UUID: 550e8400-e29b-41d4-a716-446655440000
 * (與 Applications/Careers 使用同一測試用戶)
 */

import type { Resume } from "@/types/resume";

// Mock User ID (與其他 mock data 統一)
export const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

export const MOCK_RESUME: Resume = {
  id: 1,
  user_id: MOCK_USER_ID,
  resume_name: "履歴書_2025",
  is_primary: true,
  is_public: true,
  public_url_slug: "hsiao-paichun",
  completeness: 95,
  
  name_kanji: "蕭 百鈞",
  name_kana: "ショウ ヒャクキン",
  name_romaji: "Pai-Chun Hsiao",
  birth_date: "1989-07-19",
  age: 36,
  gender: "男性",
  photo_url: "https://picsum.photos/400/400",
  
  phone: "08049470719",
  email: "496e0094@gmail.com",
  postal_code: "150-0001",
  prefecture: "東京都",
  city: "渋谷区",
  address_line: "神宮前1-1-1",
  building: "サンプルマンション101",
  
  linkedin_url: "https://linkedin.com/in/paichun-hsiao",
  github_url: "https://github.com/paichun",
  portfolio_url: "https://paichun-portfolio.com",
  other_url: "https://twitter.com/paichun",
  
  career_summary: "2011年に大学卒業後、陸軍での1年間の兵役を経て、ワーキングホリデーで来日。投資不動産のアドバイザーと日本の大手量販店で法人営業を経験し、国内外での営業スキルを磨く。その後、IT業界への転身を決意し、独学でプログラミングを習得。エンジニア、Webディレクター、PM、PdMと多様な職種を経験し、ビジネスと技術の両面からプロダクト開発を推進するキャリアを築いている。現在はMaaS関連のスタートアップでプロダクトマネージャーとして、年間200億円規模のチケッティングプラットフォームを統括。",
  
  self_pr: "営業、エンジニア、ディレクター、PM、PdMと多様な職種を経験し、ビジネスと技術の両面からプロダクト開発を推進する力を培いました。好奇心と行動力を武器に、新しい知識を積極的に吸収し、チームを率いて具体的な成果を生み出すことが私の強みです。\n\n現在、リンクティビティ株式会社でメインプロダクトマネージャーとして、年間200億円規模のチケッティングプラットフォームを統括。月間1億円を超える決済処理を実現し、オンライン直販、現地販売、外販（国内・海外）の全販売チャンネル統合を完成させました。",
  
  education: [
    {
      date: "2011-06",
      school_name: "南台科技大学",
      major: "日本語学科",
      degree: "卒業"
    },
    {
      date: "2007-06",
      school_name: "私立新民高級中学",
      major: "電子学科",
      degree: "卒業"
    }
  ],
  
  work_experience: [
    {
      company_name: "リンクティビティ株式会社",
      industry: "MaaS / チケッティング",
      start_date: "2023-02",
      end_date: null,
      is_current: true,
      positions: [
        {
          start_date: "2023-02",
          end_date: null,
          is_current: true,
          department: "Manager Group",
          title: "Product Manager",
          employment_type: "正社員",
          description: "年間200億円規模のB2B/B2B2C/B2Cチケッティングプラットフォームのメインプロダクトマネージャーとして、戦略立案から開発最適化まで全工程を統括。市場分析とユーザーニーズ調査に基づいたプロダクトロードマップの策定、データドリブンな意思決定による継続的なプロダクト改善を実行。",
          responsibilities: [
            "プラットフォーム全体統括（年間200億円規模のシステム全体を統括）",
            "新規ハードウェアプロダクト立ち上げ（0→1開発）",
            "システム統合・連携開発（ハードウェア・ソフトウェアのシームレスな連携）",
            "統合プラットフォーム戦略（オンライン直販、現地販売、外販の全チャンネル統合）",
            "チームマネジメント（社内外約10名の開発チームをリード）",
            "ステークホルダー折衝（クライアント、開発チーム、経営陣との連携）"
          ],
          achievements: [
            "月間1億円超の決済処理を実現",
            "オンライン直販、現地販売、外販（国内・海外）の全販売チャンネル統合を完成",
            "運用チームの商品管理業務時間を1/3削減",
            "月間8,000万円の販売額処理システムを構築",
            "月間2,000万円の決済処理を実現（O2Oソリューション）"
          ]
        }
      ]
    },
    {
      company_name: "株式会社パルコデジタルマーケティング",
      industry: "デジタルマーケティング",
      start_date: "2021-02",
      end_date: "2022-10",
      is_current: false,
      positions: [
        {
          start_date: "2021-02",
          end_date: "2022-10",
          is_current: false,
          department: "ディレクター室",
          title: "PM / Webディレクター",
          employment_type: "正社員",
          description: "プロジェクトマネージャー兼ウェブディレクターとして、ショッピングセンター特化のCMSの開発をリード。京王線沿線施設のリニューアルや新設施開業のWeb制作やスタッフ管理システムの開発など、複数の大型プロジェクトの要件定義、制作ディレクション、構成製作を担当。",
          responsibilities: [
            "プロジェクト管理",
            "制作進行の管理",
            "CMS機能設計",
            "ワイヤーフレーム・デザイン設計",
            "要件定義・制作ディレクション",
            "クライアント折衝"
          ],
          achievements: [
            "ショッピングセンター特化のCMSを開発し、複数の商業施設でシステムを展開",
            "2021年度 社内MVP受賞",
            "2022年度 社内MVP受賞（2年連続）"
          ]
        }
      ]
    },
    {
      company_name: "株式会社サプライド",
      industry: "IT（SES）",
      start_date: "2019-05",
      end_date: "2020-12",
      is_current: false,
      positions: [
        {
          start_date: "2019-05",
          end_date: "2020-12",
          is_current: false,
          department: "各社常駐",
          title: "PM、Webプロデューサー、Webディレクター",
          employment_type: "正社員",
          description: "大手広告代理店、スタートアップ企業、地方創生会社で3社ほどSESの常住型派遣として勤務。Webディレクター・プロデューサーとして、新規開発または既存の技術の導入による問題解決を実施。",
          responsibilities: [
            "ワイヤーフレーム・デザイン設計",
            "スタッフマネジメント",
            "コンテンツ・プロジェクト企画及び進行管理",
            "クライアント折衝"
          ],
          achievements: []
        }
      ]
    },
    {
      company_name: "株式会社シンク",
      industry: "Web制作",
      start_date: "2018-09",
      end_date: "2019-03",
      is_current: false,
      positions: [
        {
          start_date: "2018-09",
          end_date: "2019-03",
          is_current: false,
          department: "クリエティブグループ",
          title: "Webディレクター",
          employment_type: "正社員",
          description: "中小規模の開発案件を中心に制作と開発を管理。主にコーポレートサイト、キャンペーンサイトを担当。",
          responsibilities: [
            "コンテンツ企画",
            "プロジェクト・企画等の進行管理",
            "クライアント折衝",
            "サイトデザイン設計"
          ],
          achievements: [
            "明治安田生命 アニマル診断などキャンペーンサイト複数制作",
            "NETFLIXイベント特設サイト制作"
          ]
        }
      ]
    },
    {
      company_name: "株式会社エイトシステムズ",
      industry: "システム開発",
      start_date: "2018-03",
      end_date: "2018-09",
      is_current: false,
      positions: [
        {
          start_date: "2018-03",
          end_date: "2018-09",
          is_current: false,
          department: "開発部",
          title: "エンジニア",
          employment_type: "契約社員",
          description: "前職在職中に独学でプログラミングを学び、IT業界へ転身。JavaScript(React)、PHP(CakePHP)などの技術を中心にシステム開発を実施。",
          responsibilities: [
            "マッチングサイト画面修正",
            "検索機能改修",
            "予約システム修正"
          ],
          achievements: []
        }
      ]
    },
    {
      company_name: "オーロラジャパン株式会社",
      industry: "商社",
      start_date: "2015-04",
      end_date: "2018-03",
      is_current: false,
      positions: [
        {
          start_date: "2015-04",
          end_date: "2018-03",
          is_current: false,
          department: "営業部",
          title: "法人営業",
          employment_type: "正社員",
          description: "日本国内の大手ホームセンター・スーパー・量販店・問屋などを中心に営業活動。各シーズに合わせてキャンペーン企画・競合分析など企画構築とコンサル営業を実施。",
          responsibilities: [
            "新規顧客開拓（電話でのアポイント獲得、訪問、ヒアリング）",
            "既存顧客フォロー（現状の確認、スポット企画の提案）",
            "企画立案、提案、プレゼンテーション"
          ],
          achievements: [
            "2016年 年間売上3.3億円達成（年間目標達成）",
            "2017年 年間売上2.7億円達成（年間目標達成）"
          ]
        }
      ]
    },
    {
      company_name: "株式会社プレミアムバリューバンク",
      industry: "不動産",
      start_date: "2013-03",
      end_date: "2015-03",
      is_current: false,
      positions: [
        {
          start_date: "2013-03",
          end_date: "2015-03",
          is_current: false,
          department: "営業部",
          title: "台湾地域担当",
          employment_type: "正社員",
          description: "投資用不動産を中心とした不動産会社で、国内・海外の個人投資家に向けの不動産の販売及び販売後の管理を担当。",
          responsibilities: [
            "資産形成の分析",
            "投資アドバイザー",
            "新規物件探し",
            "物件管理"
          ],
          achievements: [
            "初年度（2013年）台湾事務所の立ち上げ",
            "2014年度 一棟物件を約6億円で販売",
            "2014年度 中古タワーマンションを8,000万円で販売"
          ]
        }
      ]
    }
  ],
  
  certifications: [
    {
      date: "2010-12",
      name: "日本語能力検定N1"
    },
    {
      date: "2010-12",
      name: "普通自動車免許"
    },
    {
      date: "2017-05",
      name: "小型船舶免許1級"
    }
  ],
  
  awards: [
    {
      date: "2022",
      title: "社内MVP",
      organization: "株式会社パルコデジタルマーケティング"
    },
    {
      date: "2021",
      title: "社内MVP",
      organization: "株式会社パルコデジタルマーケティング"
    }
  ],
  
  languages: [
    {
      name: "日本語",
      level: "ネイティブ"
    },
    {
      name: "北京語",
      level: "ネイティブ"
    },
    {
      name: "台湾語",
      level: "ネイティブ"
    },
    {
      name: "英語",
      level: "日常会話"
    }
  ],
  
  skills: [
    {
      category: "マネジメント",
      items: [
        "プロジェクトマネジメント",
        "プロダクトマネジメント",
        "チームマネジメント",
        "ステークホルダー折衝",
        "アジャイル開発"
      ]
    },
    {
      category: "企画・戦略",
      items: [
        "新規プロダクト立ち上げ",
        "システム構成・定義",
        "Platform開発企画",
        "要件定義",
        "プロダクトロードマップ策定"
      ]
    },
    {
      category: "営業・ビジネス",
      items: [
        "法人営業",
        "新規顧客開拓",
        "コンサルティング営業",
        "提案・プレゼンテーション"
      ]
    },
    {
      category: "開発・技術",
      items: [
        "React",
        "TypeScript",
        "Next.js",
        "Go",
        "Java",
        "Kotlin",
        "SQL"
      ]
    },
    {
      category: "ツール",
      items: [
        "Figma",
        "Adobe XD",
        "Jira",
        "GitHub",
        "Slack"
      ]
    },
    {
      category: "最新技術",
      items: [
        "AI",
        "n8n",
        "MCP",
        "RAG"
      ]
    }
  ],
  
  preferences: {
    job_types: [
      "プロダクトマネージャー",
      "シニアプロダクトマネージャー",
      "PdM"
    ],
    locations: [
      "東京",
      "リモート"
    ],
    employment_types: [
      "正社員",
      "契約社員"
    ],
    work_styles: [
      "リモート",
      "ハイブリッド",
      "出社"
    ]
  },
  
  source_type: "manual",
  source_file_url: null,
  
  created_at: "2025-09-04T00:00:00Z",
  updated_at: "2025-09-04T12:00:00Z"
};


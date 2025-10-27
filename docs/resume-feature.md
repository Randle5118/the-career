# 履歴書管理機能

## 概要

履歴書の作成、編集、表示機能を提供します。ユーザーは自分の履歴書を管理し、完成度を確認できます。

## 機能一覧

### 1. 履歴書表示ページ (`/dashboard/resume`)

**機能:**
- 6つのタブで情報を整理して表示
  - 基本資料：氏名、連絡先、SNSリンク、自己PR
  - 学歴：教育背景
  - 職務経歴：会社・職位・職務内容・実績
  - スキル・資格：技能と資格
  - 言語・受賞歴：言語能力と受賞記録
  - 希望条件：希望職種・勤務地・雇用形態
- 完成度の可視化（プログレスバー）
- 編集ページへの遷移

### 2. 履歴書編集ページ (`/dashboard/resume/edit`)

**機能:**
- 全ての情報を編集可能
- 配列データ（学歴、職務経歴など）の追加・削除
- フォームバリデーション
- 保存・キャンセル機能
- モバイル対応（固定保存ボタン）

### 3. 完成度計算

自動計算される項目:
- 基本資料: 30%
- 学歴: 10%
- 職務経歴: 25%
- 自己紹介: 15%
- スキル: 10%
- 言語: 5%
- 希望条件: 5%

## データ構造

### Resume型

```typescript
interface Resume {
  id: number;
  user_id: string;
  resume_name: string;
  completeness: number;
  
  // 基本情報
  name_kanji: string;
  name_kana: string;
  birth_date: string;
  age: number;
  gender: string;
  
  // 連絡先
  email: string;
  phone: string;
  prefecture: string;
  city: string;
  
  // 配列データ
  education: Education[];
  work_experience: WorkExperience[];
  certifications: Certification[];
  awards: Award[];
  languages: Language[];
  skills: Skill[];
  preferences: Preferences;
}
```

## ファイル構成

### TypeScript型定義
- `types/resume.ts` - 全ての型定義

### Mock データ
- `libs/mock-data/resumes.ts` - サンプルデータ
- `libs/mock-data/index.ts` - エクスポート

### データ管理
- `libs/hooks/useResume.ts` - 履歴書データ管理Hook

### 表示コンポーネント (`components/resume/`)
- `ResumeBasicInfo.tsx` - 基本資料
- `ResumeEducation.tsx` - 学歴
- `ResumeWorkExperience.tsx` - 職務経歴
- `ResumeSkills.tsx` - スキル・資格
- `ResumeLanguagesAwards.tsx` - 言語・受賞歴
- `ResumePreferences.tsx` - 希望条件

### フォームコンポーネント (`components/resume/forms/`)
- `ResumeBasicInfoForm.tsx` - 基本資料フォーム
- `ResumeEducationForm.tsx` - 学歴フォーム
- `ResumeWorkExperienceForm.tsx` - 職務経歴フォーム
- `ResumeSkillsForm.tsx` - スキル・資格フォーム
- `ResumeLanguagesAwardsForm.tsx` - 言語・受賞歴フォーム
- `ResumePreferencesForm.tsx` - 希望条件フォーム

### ページ
- `app/dashboard/resume/page.tsx` - 表示ページ
- `app/dashboard/resume/edit/page.tsx` - 編集ページ

### ナビゲーション
- `components/layout/DashboardNav.tsx` - 「履歴書」メニュー追加

## Supabase設定

### データベース作成

`.supabase-resume-migration.sql` ファイルを Supabase Dashboard の SQL Editor で実行してください。

**主な機能:**
- `user_resumes` テーブル作成
- JSONB列で配列データを格納
- RLS（Row Level Security）ポリシー設定
- 自動 `updated_at` 更新

### RLSポリシー

- ユーザーは自分の履歴書のみ閲覧・編集可能
- `auth.uid()` でユーザー認証

## 現在の制限事項

1. **一人一履歴書**: 現在は各ユーザー1つの履歴書のみ
2. **Mock データ**: Supabase統合は未実装（構造は準備済み）
3. **公開機能**: `is_public` と `public_url_slug` は将来の機能
4. **職務経歴の詳細編集**: 職位の詳細編集は簡易版（基本情報のみ）

## 今後の拡張

1. **Supabase統合**
   - `useResume` HookにSupabase API呼び出しを追加
   - リアルタイム更新

2. **複数履歴書対応**
   - 履歴書一覧ページ
   - 履歴書の切り替え機能

3. **公開履歴書**
   - `/resume/[slug]` 公開ページ
   - プライバシー設定

4. **PDF出力**
   - 履歴書をPDF形式でダウンロード
   - 複数のテンプレート

5. **AI機能**
   - 職務経歴の自動生成
   - 自己PRの改善提案

## 使用方法

### 開発環境

```bash
# 開発サーバー起動
npm run dev

# 履歴書ページにアクセス
http://localhost:3000/dashboard/resume
```

### テスト

1. ダッシュボードのナビゲーションから「履歴書」をクリック
2. Mock データが表示される
3. 「編集する」ボタンで編集ページへ
4. 各タブで情報を編集
5. 「保存」で変更を保存

## トラブルシューティング

### 履歴書が表示されない

- Mock データが正しく読み込まれているか確認
- `libs/mock-data/resumes.ts` が存在するか確認
- ブラウザコンソールでエラーを確認

### 編集が保存されない

- `useResume` Hook の `updateResume` 関数を確認
- Toast通知が表示されるか確認
- 現在はMock実装なので、リロードすると元に戻る

### Supabase統合

1. `.supabase-resume-migration.sql` を実行
2. `useResume.ts` でSupabase APIを呼び出すように変更
3. 認証済みユーザーの `user_id` を使用

## 参考

- TypeScript Standards: `.cursor/rules/typescript-standards.mdc`
- Next.js Patterns: `.cursor/rules/nextjs-patterns.mdc`
- UI Components: `.cursor/rules/ui-components.mdc`


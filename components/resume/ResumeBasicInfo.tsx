/**
 * 履歷書基本資料展示組件
 */

import type { Resume } from "@/types/resume";
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Twitter } from "lucide-react";
import Image from "next/image";

interface ResumeBasicInfoProps {
  resume: Resume;
}

export default function ResumeBasicInfo({ resume }: ResumeBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* 基本資訊卡片 */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 照片 */}
          {resume.photo_url && (
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <Image
                  src={resume.photo_url}
                  alt={resume.name_kanji}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
          
          {/* 基本資訊 */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-base-content">{resume.name_kanji}</h3>
              <p className="text-base-content/70 mt-1">{resume.name_kana}</p>
              <p className="text-base-content/60 text-sm">{resume.name_romaji}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-base-content/50" />
                <span>{resume.gender}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-base-content/50">生年月日:</span>
                <span>{resume.birth_date} ({resume.age}歳)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 連絡先 */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-base-content mb-4">連絡先</h4>
        
        <div className="space-y-3">
          {resume.email?.trim() && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-base-content/50" />
              <a href={`mailto:${resume.email}`} className="hover:text-primary">
                {resume.email}
              </a>
            </div>
          )}
          
          {resume.phone?.trim() && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-base-content/50" />
              <a href={`tel:${resume.phone}`} className="hover:text-primary">
                {resume.phone}
              </a>
            </div>
          )}
          
          {(resume.prefecture?.trim() || resume.city?.trim()) && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-base-content/50 mt-0.5" />
              <div>
                {resume.postal_code?.trim() && <p>〒{resume.postal_code}</p>}
                <p>
                  {resume.prefecture}{resume.city}{resume.address_line}
                  {resume.building?.trim() && <span className="ml-1">{resume.building}</span>}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* SNS・ポートフォリオ */}
      {(resume.linkedin_url?.trim() || resume.github_url?.trim() || resume.portfolio_url?.trim() || resume.other_url?.trim()) && (
        <div className="bg-base-100 border border-base-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-base-content mb-4">SNS・ポートフォリオ</h4>
          
          <div className="space-y-3">
            {resume.linkedin_url?.trim() && (
              <div className="flex items-center gap-3 text-sm">
                <Linkedin className="w-4 h-4 text-base-content/50" />
                <a 
                  href={resume.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  LinkedIn
                </a>
              </div>
            )}
            
            {resume.github_url?.trim() && (
              <div className="flex items-center gap-3 text-sm">
                <Github className="w-4 h-4 text-base-content/50" />
                <a 
                  href={resume.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  GitHub
                </a>
              </div>
            )}
            
            {resume.portfolio_url?.trim() && (
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-base-content/50" />
                <a 
                  href={resume.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  ポートフォリオ
                </a>
              </div>
            )}
            
            {resume.other_url?.trim() && (
              <div className="flex items-center gap-3 text-sm">
                <Twitter className="w-4 h-4 text-base-content/50" />
                <a 
                  href={resume.other_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  その他
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 自己PR・キャリアサマリー */}
      {(resume.career_summary?.trim() || resume.self_pr?.trim()) && (
        <div className="bg-base-100 border border-base-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-base-content mb-4">自己PR・キャリアサマリー</h4>
          
          {resume.career_summary?.trim() && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-base-content/70 mb-2">キャリアサマリー</h5>
              <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
                {resume.career_summary}
              </p>
            </div>
          )}
          
          {resume.self_pr?.trim() && (
            <div>
              <h5 className="text-sm font-medium text-base-content/70 mb-2">自己PR</h5>
              <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
                {resume.self_pr}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/**
 * 履歴書基本情報表示コンポーネント
 */

import type { Resume } from "@/types/resume";
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Twitter, GraduationCap, Briefcase } from "lucide-react";
import Image from "next/image";

interface ResumeBasicInfoProps {
  resume: Resume;
}

export default function ResumeBasicInfo({ resume }: ResumeBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* 基本情報カード */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 写真 */}
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
          
          {/* 基本情報 */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-base-content">{resume.name_kanji}</h3>
              <p className="text-base-content/70 mt-1">{resume.name_kana}</p>
              <p className="text-base-content/60 text-sm">{resume.name_romaji}</p>
              
              {/* SNS Links */}
              <div className="flex items-center gap-2 mt-3">
                <a 
                  href={resume.linkedin_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`p-1.5 rounded-lg transition-colors ${
                    resume.linkedin_url?.trim() 
                      ? 'hover:bg-base-200 text-base-content' 
                      : 'text-base-content/20 pointer-events-none'
                  }`}
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                
                <a 
                  href={resume.github_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`p-1.5 rounded-lg transition-colors ${
                    resume.github_url?.trim() 
                      ? 'hover:bg-base-200 text-base-content' 
                      : 'text-base-content/20 pointer-events-none'
                  }`}
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                
                <a 
                  href={resume.portfolio_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`p-1.5 rounded-lg transition-colors ${
                    resume.portfolio_url?.trim() 
                      ? 'hover:bg-base-200 text-base-content' 
                      : 'text-base-content/20 pointer-events-none'
                  }`}
                  aria-label="Portfolio"
                >
                  <Globe className="w-4 h-4" />
                </a>
                
                <a 
                  href={resume.other_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`p-1.5 rounded-lg transition-colors ${
                    resume.other_url?.trim() 
                      ? 'hover:bg-base-200 text-base-content' 
                      : 'text-base-content/20 pointer-events-none'
                  }`}
                  aria-label="Other"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-base-content/50" />
                <span>{resume.gender}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-base-content/50">年齢:</span>
                <span>{resume.age}歳</span>
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
      
      {/* 学歴・職務経歴の概要 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 学歴 */}
        {resume.education && resume.education.length > 0 && (
          <div className="bg-base-100 border border-base-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-semibold text-base-content">学歴</h4>
            </div>
            
            <div className="space-y-3">
              {resume.education.slice(0, 3).map((edu, index) => (
                <div key={index} className="flex gap-3">
                  <div className="text-xs text-base-content/60 whitespace-nowrap pt-0.5 min-w-[60px]">
                    {edu.date}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-base-content">{edu.school_name}</p>
                    <p className="text-xs text-base-content/60">{edu.major} {edu.degree}</p>
                  </div>
                </div>
              ))}
              {resume.education.length > 3 && (
                <p className="text-xs text-base-content/50 text-center pt-2">
                  他 {resume.education.length - 3} 件
                </p>
              )}
            </div>
          </div>
        )}

        {/* 職務経歴 */}
        {resume.work_experience && resume.work_experience.length > 0 && (
          <div className="bg-base-100 border border-base-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-semibold text-base-content">職務経歴</h4>
            </div>
            
            <div className="space-y-3">
              {resume.work_experience.slice(0, 3).map((exp, index) => (
                <div key={index} className="flex gap-3">
                  <div className="text-xs text-base-content/60 whitespace-nowrap pt-0.5 min-w-[60px]">
                    {exp.start_date}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-base-content">{exp.company_name}</p>
                    <p className="text-xs text-base-content/60">
                      {exp.industry}
                      {exp.positions && exp.positions.length > 0 && ` · ${exp.positions[exp.positions.length - 1].title}`}
                    </p>
                  </div>
                </div>
              ))}
              {resume.work_experience.length > 3 && (
                <p className="text-xs text-base-content/50 text-center pt-2">
                  他 {resume.work_experience.length - 3} 件
                </p>
              )}
            </div>
          </div>
        )}
      </div>

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


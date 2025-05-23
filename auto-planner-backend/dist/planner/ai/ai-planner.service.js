"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiPlannerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const user_preference_service_1 = require("../../user-preference/user-preference.service");
const exam_service_1 = require("../../exam/exam.service");
const axios_1 = require("axios");
const date_fns_1 = require("date-fns");
let AiPlannerService = class AiPlannerService {
    configService;
    userPreferenceService;
    examService;
    constructor(configService, userPreferenceService, examService) {
        this.configService = configService;
        this.userPreferenceService = userPreferenceService;
        this.examService = examService;
    }
    async generateStudyPlanByUserId(userId) {
        const preference = await this.userPreferenceService.findByUserId(userId);
        const { exams } = await this.examService.findByUser(userId);
        if (!preference || !exams || exams.length === 0) {
            throw new common_1.InternalServerErrorException('필수 정보가 부족합니다.');
        }
        const mergedSubjects = this.mergeSubjects(exams);
        const prompt = this.createPrompt(mergedSubjects, preference);
        const HF_API_URL = 'http://localhost:8000/v1/completions';
        const response = await axios_1.default.post(HF_API_URL, {
            model: 'openchat',
            prompt: prompt,
            max_tokens: 1024,
            temperature: 0.7,
        });
        const rawText = response.data?.[0]?.generated_text ?? response.data;
        const jsonMatch = rawText.match(/\[\s*{[\s\S]*?}\s*\]/);
        if (!jsonMatch) {
            console.error('❌ JSON 파싱 실패:', rawText);
            throw new common_1.InternalServerErrorException('AI 응답이 올바른 JSON 배열 형식이 아닙니다.');
        }
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
    }
    mergeSubjects(exams) {
        const grouped = {};
        for (const exam of exams) {
            const key = exam.subject;
            if (!grouped[key]) {
                grouped[key] = {
                    subject: exam.subject,
                    startDate: exam.startDate,
                    endDate: exam.endDate,
                    chapters: [...exam.chapters],
                };
            }
            else {
                if ((0, date_fns_1.isBefore)(new Date(exam.startDate), new Date(grouped[key].startDate))) {
                    grouped[key].startDate = exam.startDate;
                }
                if (new Date(exam.endDate) > new Date(grouped[key].endDate)) {
                    grouped[key].endDate = exam.endDate;
                }
                grouped[key].chapters.push(...exam.chapters);
            }
        }
        return Object.values(grouped);
    }
    createPrompt(subjects, pref) {
        const lines = [
            'You are an AI that returns ONLY a JSON array in the following format:',
            '[{"subject": "과목명", "startDate": "yyyy-MM-dd", "endDate": "yyyy-MM-dd", "dailyPlan": ["6/1: 과목명 - 챕터명"]}]',
            '',
            'DO NOT add any explanation, headers, or notes.',
            '',
            `User Preferences:`,
            `- Style: ${pref.style === 'focus' ? 'Focused' : 'Multi'}`,
            `- Study Days: ${pref.studyDays.join(', ')}`,
            `- Sessions per Day: ${pref.sessionsPerDay}`,
            '',
            'Exams:',
        ];
        for (const subj of subjects) {
            const chapters = subj.chapters.map((ch, i) => `Chapter ${i + 1}: ${ch.chapterTitle}`).join(', ');
            lines.push(`- Subject: ${subj.subject}`, `  Period: ${new Date(subj.startDate).toDateString()} ~ ${new Date(subj.endDate).toDateString()}`, `  Chapters: ${chapters}`, '');
        }
        lines.push('Only return the JSON array.');
        return lines.join('\n');
    }
};
exports.AiPlannerService = AiPlannerService;
exports.AiPlannerService = AiPlannerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        user_preference_service_1.UserPreferenceService,
        exam_service_1.ExamService])
], AiPlannerService);
//# sourceMappingURL=ai-planner.service.js.map
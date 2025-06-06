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
var NotionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@notionhq/client");
const date_fns_1 = require("date-fns");
const notion_token_store_1 = require("../auth/notion-token.store");
let NotionService = NotionService_1 = class NotionService {
    configService;
    logger = new common_1.Logger(NotionService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    getClientForUser(userId) {
        const token = (0, notion_token_store_1.getToken)(userId);
        console.log('🔐 실제 사용될 토큰:', token);
        this.logger.log(`🔑 Loaded token for user ${userId}: ${token}`);
        if (!token) {
            throw new Error(`❌ Notion token not found for user: ${userId}`);
        }
        return new client_1.Client({ auth: token });
    }
    async addPlanEntry(data) {
        const notion = this.getClientForUser(data.userId);
        return await notion.pages.create({
            parent: { database_id: data.databaseId },
            properties: {
                Subject: {
                    title: [{ text: { content: data.subject } }],
                },
                Date: {
                    date: { start: data.date },
                },
                Content: {
                    rich_text: [{ text: { content: data.content } }],
                },
            },
        });
    }
    async syncToNotion(dto) {
        const grouped = new Map();
        for (const entry of dto.dailyPlan) {
            const colonIndex = entry.indexOf(':');
            const dateRaw = entry.slice(0, colonIndex).trim();
            const content = entry.slice(colonIndex + 1).trim();
            const formattedDate = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw)
                ? dateRaw
                : (0, date_fns_1.format)((0, date_fns_1.parse)(dateRaw, 'M/d', new Date(dto.startDate)), 'yyyy-MM-dd');
            const key = `${dto.subject}_${formattedDate}`;
            if (!grouped.has(key)) {
                grouped.set(key, { date: formattedDate, contentList: [] });
            }
            grouped.get(key).contentList.push(content);
        }
        for (const { date, contentList } of grouped.values()) {
            await this.addPlanEntry({
                userId: dto.userId,
                subject: dto.subject,
                date,
                content: contentList.join(', '),
                databaseId: dto.databaseId,
            });
        }
        return {
            message: '📌 Notion 연동 완료',
            count: grouped.size,
        };
    }
    async saveFeedbackToNotion(userId, title, content) {
        const notion = this.getClientForUser(userId);
        const databaseId = this.configService.get('DATABASE_ID');
        if (!databaseId)
            throw new Error('❌ DATABASE_ID 누락');
        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Subject: {
                    title: [{ text: { content: title } }],
                },
                Date: {
                    date: { start: new Date().toISOString().split('T')[0] },
                },
                Content: {
                    rich_text: [{ text: { content } }],
                },
            },
        });
    }
};
exports.NotionService = NotionService;
exports.NotionService = NotionService = NotionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotionService);
//# sourceMappingURL=notion.service.js.map
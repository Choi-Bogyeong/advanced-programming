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
exports.SyncToNotionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SyncToNotionDto {
    userId;
    subject;
    startDate;
    endDate;
    dailyPlan;
    databaseId;
}
exports.SyncToNotionDto = SyncToNotionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user123', description: '사용자 고유 ID' }),
    __metadata("design:type", String)
], SyncToNotionDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '수학', description: '과목명' }),
    __metadata("design:type", String)
], SyncToNotionDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-06-01', description: '학습 시작일 (yyyy-MM-dd)' }),
    __metadata("design:type", String)
], SyncToNotionDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-06-15', description: '학습 종료일 (yyyy-MM-dd)' }),
    __metadata("design:type", String)
], SyncToNotionDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['6/1: 수열의 개념', '6/2: 등차수열'],
        description: '날짜별 학습 계획 목록 ("M/d: 내용") 형식의 문자열 배열'
    }),
    __metadata("design:type", Array)
], SyncToNotionDto.prototype, "dailyPlan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'notion-db-id-abc123', description: 'Notion 데이터베이스 ID' }),
    __metadata("design:type", String)
], SyncToNotionDto.prototype, "databaseId", void 0);
//# sourceMappingURL=sync-to-notion.dto.js.map
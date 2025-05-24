
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Client } from '@notionhq/client';
// import { SyncToNotionDto } from './dto/sync-to-notion.dto';
// import { getToken } from 'src/auth/notion-token.store';
// import { parse, format } from 'date-fns';

// @Injectable()
// export class NotionService {
//   private readonly defaultDatabaseId: string;

//   constructor(private readonly configService: ConfigService) {
//     this.defaultDatabaseId = this.configService.get<string>('DATABASE_ID') ?? 'default-id';
//   }

//   // private getClientForUser(userId: string): Client {
//   //   const userToken = getToken(userId);
//   //   if (!userToken) {
//   //     throw new Error(`❌ Notion token not found for user ${userId}`);
//   //   }
//   //   return new Client({ auth: userToken });
//   // }

//   async addPlanEntry(data: {
//     // userId: string;
//     subject: string;
//     date: string;
//     content: string;
//     databaseId: string;
//   }) {
//     // const notion = this.getClientForUser(data.userId); 아래 수정된 코드
//     const notion = new Client({
//   auth: this.configService.get<string>('NOTION_TOKEN'), // .env에 고정된 토큰 사용
// });


//     return await notion.pages.create({
//       parent: { database_id: data.databaseId },
//       properties: {
//         Subject: {
//           title: [{ text: { content: data.subject } }],
//         },
//         // 'User ID': {
//         //   rich_text: [{ text: { content: data.userId } }],
//         // },
//         Date: {
//           date: { start: data.date },
//         },
//         Content: {
//           rich_text: [{ text: { content: data.content } }],
//         },
//       },
//     });
//   }

 

//   async syncToNotion(dto: SyncToNotionDto) {
//     for (const entry of dto.dailyPlan) {
//       const [date, content] = entry.split(':').map((v) => v.trim());
//       // dto.startDate의 연도에서 가져옴.
//       const parsed = parse(date, 'M/d', new Date(dto.startDate));
//       const formattedDate = format(parsed, 'yyyy-MM-dd');

//       await this.addPlanEntry({
//         // userId: dto.userId,
//         subject: dto.subject,
//         date: formattedDate,
//         content,
//         databaseId: dto.databaseId,
//       });
//     }

//     return {
//       message: '📌 노션 연동 완료',
//       count: dto.dailyPlan.length,
//     };
//   }
// }


// // import { Injectable } from '@nestjs/common';
// // import { ConfigService } from '@nestjs/config'; // ✅ 추가
// // import { Client } from '@notionhq/client';
// // import { SyncToNotionDto } from './dto/sync-to-notion.dto';
// // import { format } from 'date-fns';
// // import { getToken } from 'src/auth/notion-token.store';

// // @Injectable()
// // export class NotionService {
// //   private notion: Client;
// //   private databaseId: string;

// //   constructor(private configService: ConfigService) {
// //     this.notion = new Client({
// //       auth: this.configService.get<string>('NOTION_TOKEN'), // ✅ .env에서 토큰 불러오기
// //     });

// //     this.databaseId = this.configService.get<string>('DATABASE_ID') ?? 'default-id';
// //   }

// //   async addPlanEntry(data: {
// //     userId: string;
// //     subject: string;
// //     date: string;
// //     content: string;
// //   }) {
// //     return await this.notion.pages.create({
// //       parent: { database_id: this.databaseId },
// //       properties: {
// //         Subject: {
// //           title: [{ text: { content: data.subject } }],
// //         },
// //         'User ID': {
// //           rich_text: [{ text: { content: data.userId } }],
// //         },
// //         Date: {
// //           date: { start: data.date },
// //         },
// //         Content: {
// //           rich_text: [{ text: { content: data.content } }],
// //         },
// //       },
// //     });
// //   }

// //   async syncToNotion(dto: SyncToNotionDto) {
// //     for (const entry of dto.dailyPlan) {
// //       const [date, content] = entry.split(':').map((v) => v.trim());
// //       await this.addPlanEntry({
// //         userId: dto.userId,
// //         subject: dto.subject,
// //         date: `2025-${date.replace('/', '-')}`,
// //         content,
// //       });
// //     }

// //     return { message: '노션 연동 완료', count: dto.dailyPlan.length };
// //   }

// //   async saveScheduleToNotion(userId: string, schedule: any[]) {
// //     const calendarId = this.configService.get<string>('NOTION_CALENDAR_ID');
// //     if (!calendarId) throw new Error('Notion 캘린더 ID가 설정되지 않았습니다.');

// //     for (const entry of schedule) {
// //       await this.notion.pages.create({
// //         parent: { database_id: calendarId },
// //         properties: {
// //           Name: {
// //             title: [
// //               {
// //                 text: {
// //                   content: `Day ${entry.day} 학습`,
// //                 },
// //               },
// //             ],
// //           },
// //           Date: {
// //             date: {
// //               start: entry.date,
// //             },
// //           },
// //           Tasks: {
// //             rich_text: [
// //               {
// //                 text: {
// //                   content: entry.tasks.join(', '),
// //                 },
// //               },
// //             ],
// //           },
// //           User: {
// //             rich_text: [
// //               {
// //                 text: {
// //                   content: userId,
// //                 },
// //               },
// //             ],
// //           },
// //         },
// //       });
// //     }

// //     return { message: 'Notion 일정 등록 완료' };
// //   }
// // }


import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@notionhq/client';
import { parse, format } from 'date-fns';
import { getToken } from 'src/auth/notion-token.store';
import { SyncToNotionDto } from './dto/sync-to-notion.dto';



@Injectable()
export class NotionService {
  private readonly logger = new Logger(NotionService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * 사용자 access_token 기반 Notion 클라이언트 생성
   */
  private getClientForUser(userId: string): Client {
    const token = getToken(userId);
    // ✅ DEBUG 로그 (출력 안 되는 경우, getToken 자체 확인 필요)
    console.log('🔐 실제 사용될 토큰:', token);
    this.logger.log(`🔑 Loaded token for user ${userId}: ${token}`);

    if (!token) {
      throw new Error(`❌ Notion token not found for user: ${userId}`);
    }
    return new Client({ auth: token });
  }

  /**
   * 계획 하나를 Notion에 추가
   */
  async addPlanEntry(data: {
    userId: string;
    subject: string;
    date: string;
    content: string;
    databaseId: string;
  }) {
    const notion = this.getClientForUser(data.userId);
    // const userToken = getToken(data.userId);
    // if (!userToken) {
    //   throw new Error(`[❌ Notion 토큰 없음] userId: ${data.userId}`);
    // }

    // const notion = new Client({ auth: userToken });


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

  /**
   * 전체 일정을 Notion에 동기화
   */
  async syncToNotion(dto: SyncToNotionDto) {
    for (const entry of dto.dailyPlan) {
      const [date, content] = entry.split(':').map((v) => v.trim());

      // 예: '6/1' => '2025-06-01'
      const parsed = parse(date, 'M/d', new Date(dto.startDate));
      const formattedDate = format(parsed, 'yyyy-MM-dd');

      await this.addPlanEntry({
        userId: dto.userId,
        subject: dto.subject,
        date: formattedDate,
        content: content,
        databaseId: dto.databaseId,
      });
    }

    return {
      message: '📌 Notion 연동 완료',
      count: dto.dailyPlan.length,
    };
  }
}
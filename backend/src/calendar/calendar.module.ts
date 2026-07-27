import { Module } from "@nestjs/common";
import { CalendarController } from "./calendar.controller";
import { CalendarService } from "./calendar.service";

import { DiaryModule } from "../diary/diary.module";
import { IntentionModule } from "../intention/intention.module";
import { RemindersModule } from "../reminders/reminders.module";

@Module({
  imports: [DiaryModule, IntentionModule, RemindersModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}

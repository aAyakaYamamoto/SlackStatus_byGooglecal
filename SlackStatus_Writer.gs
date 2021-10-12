/**
Googleカレンダーから取得した現在の予定をSlackステータス用に整形して返却する。
**/
function createStatusText(event) {
// 整形した開始時刻・終了時刻
var start = event.getStartTime().getHours() + ":" + ("00" + event.getStartTime().getMinutes()).slice(-2);
var end = event.getEndTime().getHours() + ":" + ("00" + event.getEndTime().getMinutes()).slice(-2);
// ステータステキスト
var text = event.getTitle() + "(" + start + "〜" + end + ")";
 
// イベントがある時のステータス
var event_status = {
"profile": JSON.stringify({
"status_text": text,
"status_emoji": ":google_calender:"
})
};
 
return event_status;
 
}
 
/**
作成したステータスをSlack Web API経由でプロフィールに反映させる。
**/
function postSlackStatus(status) {
// アクセス情報
const TOKEN = "取得したトークンはここ";
const URL = "https://slack.com/api/users.profile.set";
 
// HTTPヘッダー
const headers = {
"Authorization" : "Bearer " + TOKEN
};
 
//POSTデータ
var option = {
"Content-Type": "application/json",
"headers": headers,
"method": "POST",
"payload": status
};
 
var fetch = UrlFetchApp.fetch(URL, option);
 
}
 
/**
カレンダーから今日の予定を取得し、必要であればSlackステータスを更新する。
**/
function main() {
// カレンダーID
const ID = "連携するカレンダーIDはここ";
// 今日の日付
var date = new Date();
// カレンダーから今日の予定を取得
var calendar = CalendarApp.getCalendarById(ID);
var events = calendar.getEventsForDay(date);
 
// 今日のイベントがない場合は何もしない
if (events.length !== 0) {
 
// イベントがないときのステータス
var set_status = {
"profile": JSON.stringify({
"status_text": "Free time!",
"status_emoji": ":dancer:"
})
};
 
// 今日の予定をすべて調査
for (var i in events){
// 終日の予定の場合はスルー
if (events[i].isAllDayEvent()) {
continue;
}
// 今が予定の開始時刻以降で終了時刻以前なら今はその予定の最中 -> ステータス変更
if (events[i].getStartTime() <= date && events[i].getEndTime() >= date) {
set_status = createStatusText(events[i]);
break;
}
}
 
postSlackStatus(set_status);
 
}
}

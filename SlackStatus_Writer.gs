/*******************************************
 その1：Googleカレンダー予定 → Slackステータス用に整形し返す
*******************************************/
function createStatusText(event) {
  // 整形した開始時刻・終了時刻
  var start = event.getStartTime().getHours() + ":" + ("00" + event.getStartTime().getMinutes()).slice(-2);
  var end = event.getEndTime().getHours() + ":" + ("00" + event.getEndTime().getMinutes()).slice(-2);
  // ステータステキスト
  var text = event.getTitle() + " (" + start + "〜" + end + ")";

  // イベントがある時のステータス
  if(/(院|健康診断)/.test(event.getTitle())){
    var event_status = {
      // 病院系統のとき
      "profile": JSON.stringify({
      "status_text": "病院なう" + " (" + start + "〜" + end + ")",
      "status_emoji": ":hospital:",
      "status_expiration": 0 
      })
    };
  }else if(/(予定あり|外出|訪問|社外)/.test(event.getTitle())){
    var event_status = {
      // 社外のとき
      "profile": JSON.stringify({
      "status_emoji": ":gaisyutu_now:",
      "status_expiration": 0 
      })
    };
  }else if(/(打ち合わせ|社内|MTG|mtg|定例|会議|確定|up|UP|様|on|meet)/.test(event.getTitle())){
    var event_status = {
      // MTG・定例・1on1・打ち合わせ系統のとき
      "profile": JSON.stringify({
      "status_text": "MTG中" + " (" + start + "〜" + end + ")",
      "status_emoji": ":google_meet_new:",
      "status_expiration": 0 
      })
    };
  }else if(/(休|午後|午前)/.test(event.getTitle())){
    var event_status = {
      // 休暇系統のとき
      "profile": JSON.stringify({
      "status_text": text,
      "status_emoji": ":palm_tree:",
      "status_expiration": 0 
      })
    };
  }else if(/(LUNCH|lunch|Lunch|お昼|おひる|ご飯|ごはん)/.test(event.getTitle())){
    var event_status = {
      // ご飯
      "profile": JSON.stringify({
      "status_text": "ごはん食べてます" + " (" + start + "〜" + end + ")",
      "status_emoji": ":rice_ball:",
      "status_expiration": 0 
      })
    };
  }else if(/(作業|自作業|TODO|todo|Todo|案件作業)/.test(event.getTitle())){
    var event_status = {
      // 作業系統
      "profile": JSON.stringify({
      "status_text": "作業中" + " (" + start + "〜" + end + ")",
      "status_emoji": ":heads-down:",
      "status_expiration": 0 
      })
    };
  }else if(/(dog|cat|散歩|walk)/.test(event.getTitle())){
    var event_status = {
      // 散歩系統
      "profile": JSON.stringify({
      "status_text": "散歩中" + " (" + start + "〜" + end + ")",
      "status_emoji": ":walking-the-dog:",
      "status_expiration": 0 
      })
    };
  }else if(/(退社|退勤|定時)/.test(event.getTitle())){
    var event_status = {
      // 退勤系統
      "profile": JSON.stringify({
      "status_emoji": ":taikinn:",
      "status_expiration": 0 
      })
    };
  }else if(/(出社|移動)/.test(event.getTitle())){
    var event_status = {
      // 移動系統
      "profile": JSON.stringify({
      "status_text": "移動中" + " (" + start + "〜" + end + ")",
      "status_emoji": ":train:",
      "status_expiration": 0 
      })
    };
  }else{
    var event_status = {
      // それ以外の予定
      "profile": JSON.stringify({
      "status_text": text,
      "status_emoji": ":spiral_calendar_pad:",
      "status_expiration": 0 
      })
    };
  }
  return event_status;
}

/*******************************************
 その2：作成済ステータス → SlackWebAPI経由 → プロフィールへ
*******************************************/
function postSlackStatus(status) {
  // アクセス情報
  const TOKEN = "SlackApp TOKENはここ";
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

/*******************************************
 その3：カレンダーの予定取得 → Slackステータスを更新
*******************************************/
function main() {
  // カレンダーID
  const ID = "カレンダーIDはここ";
  // 今日の日付
  var date = new Date();
  // カレンダーから今日の予定を取得
  var calendar = CalendarApp.getCalendarById(ID);
  var events = calendar.getEventsForDay(date);
  
  // 今日のイベントがない場合は何もしない
  if (events.length !== 0){ 
    // イベントがないとき
    var set_status = {
      "profile": JSON.stringify({
      "status_text": "MTG/Talk/Huddle OK Time!",
      "status_emoji": ":shigotoneko:",
      "status_expiration": 0 
      })
    };
    for (var i in events){
      // 終日イベントの場合はスルー 
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

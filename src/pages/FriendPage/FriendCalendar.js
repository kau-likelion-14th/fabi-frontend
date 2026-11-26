import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/Calendar.css";

// Date 객체를 YYYY-MM-DD 문자열로 바꾸는 함수
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function FriendCalendar({
  selectedDate,
  onDateChange,
  onMonthChange,
  remainingByDate,
}) {
  function getRemaining(date) {
    return remainingByDate[toDateKey(date)];
  }

  return (
    <div className="calendar-container">
      <Calendar
        onChange={onDateChange}
        onActiveStartDateChange={({ activeStartDate }) => onMonthChange(activeStartDate)}
        value={selectedDate}
        // 일요일부터 시작하는 일반 달력 형태
        calendarType="gregory"
        view="month"
        prev2Label={null}
        next2Label={null}
        showNeighboringMonth={true}
        // 날짜 칸에 '일' 같은 글자 없이 숫자만 표시
        formatDay={(locale, date) => String(date.getDate())}
        // 각 날짜 칸 안에 추가로 보여줄 내용을 정하는 부분
        tileContent={({ date, view }) => {
          if (view !== "month") return null;

          const remaining = getRemaining(date);
          if (remaining == null) return null;
          return <div className="tile-meta">{remaining === 0 ? "★" : remaining}</div>;
        }}
        // 날짜 칸에 적용할 className을 정하는 부분
        tileClassName={({ date, view }) => {
          if (view !== "month") return "";

          const remaining = getRemaining(date);
          if (remaining == null) return "";
          return remaining === 0 ? "tile-done" : "tile-has";
        }}
      />
    </div>
  );
}
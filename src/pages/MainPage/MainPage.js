import React, {useEffect, useState} from "react";
import CustomCalendar from "./Calendar";
import Todo from "./Todo";
import { get } from "../../Api";
import config from "../../Config";
import "../../styles/MainPage.css";

const toDateKey = (date) => { // 날짜 객체를 "YYYY-MM-DD" 문자열로 바꾸는 함수 (달력과 Todo가 같은 키를 쓰기 위함)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const MainPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewDate, setViewDate] = useState(selectedDate);
  const [todosByDate, setTodosByDate] = useState({});
  const [remainingByDate, setRemainingByDate] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [todoError, setTodoError] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const refresh = () => setRefreshKey((prev) => prev + 1);
  const dateKey = toDateKey(selectedDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  useEffect(() => {
    let active = true;

    const fetchCalendar = async () => {
      setCalendarError("");
      try {
        const data = await get(config.CALENDAR.GET, { year, month });
        if (data?.isSuccess === false) throw new Error(data.message);
        if (!active) return;

        const days = Array.isArray(data?.result?.days) ? data.result.days : [];
        setRemainingByDate(Object.fromEntries(
          days.filter((day) => day.hasTodo).map(({ date, remaining }) => [date, remaining])
        ));
      } catch (error) {
        if (active) setCalendarError("캘린더를 불러오지 못했습니다.");
      }
    };

    fetchCalendar();
    return () => { active = false; };
  }, [year, month, refreshKey]);

  useEffect(() => {
    let active = true;

    const fetchTodos = async () => {
      setLoading(true);
      setTodoError("");
      try {
        const data = await get(config.TODOS.LIST, { date: dateKey });
        if (data?.isSuccess === false) throw new Error(data.message);
        if (!active) return;

        const list = Array.isArray(data?.result) ? data.result : [];
        const todos = list.map(({ todoId, description, categoryName, completed }) => ({
          id: todoId,
          text: description,
          category: categoryName,
          completed,
        }));
        setTodosByDate((prev) => ({
          ...prev,
          [dateKey]: todos,
        }));
      } catch (error) {
        if (active) setTodoError("할 일을 불러오지 못했습니다.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTodos();
    return () => { active = false; };
  }, [dateKey, refreshKey]);

  return (
    <div className="mainpage-container">
      <div className="mainpage-calendar">
      {calendarError && <p role="alert">{calendarError} <button onClick={refresh}>다시 시도</button></p>}
      <CustomCalendar
        initialDate={selectedDate}
        onDateChange={setSelectedDate}
        onMonthChange={setViewDate}
        remainingByDate={remainingByDate}
      />
      </div>
      <Todo key={dateKey}
        dateKey={dateKey}
        todosByDate={todosByDate}
        onTodosChanged={refresh}
        loading={loading}
        loadError={todoError}
        onRetry={refresh}
      />
    </div>
  );
};

export default MainPage; //MainPage라는 컴포넌트를 다른 파일에서도 가져다 쓸 수 있도록 "밖으로 내보내는" 명령어

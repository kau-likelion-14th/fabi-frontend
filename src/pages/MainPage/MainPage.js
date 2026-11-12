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
  const dateKey = toDateKey(selectedDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  useEffect(() => {
    let active = true;

    const fetchCalendar = async () => {
      try {
        const data = await get(config.CALENDAR.GET, { year, month });
        if (!active) return;

        const days = Array.isArray(data?.result?.days) ? data.result.days : [];
        setRemainingByDate(Object.fromEntries(
          days.filter((day) => day.hasTodo).map(({ date, remaining }) => [date, remaining])
        ));
      } catch (error) {
        if (active) console.error("캘린더 조회 실패", error);
      }
    };

    fetchCalendar();
    return () => { active = false; };
  }, [year, month, refreshKey]);

  useEffect(() => {
    let active = true;

    const fetchTodos = async () => {
      try {
        const data = await get(config.TODOS.LIST, { date: dateKey });
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
          [dateKey]: [...todos, ...(prev[dateKey] ?? []).filter((todo) => todo.isLocal)],
        }));
      } catch (error) {
        if (active) console.error("Todo 조회 실패", error);
      }
    };

    fetchTodos();
    return () => { active = false; };
  }, [dateKey, refreshKey]);

  const calendarRemainingByDate = { ...remainingByDate };
  for (const [date, todos] of Object.entries(todosByDate)) {
    const localTodos = todos.filter((todo) => todo.isLocal);
    if (localTodos.length === 0) continue;

    const localRemaining = localTodos.filter((todo) => !todo.completed).length;
    calendarRemainingByDate[date] = (remainingByDate[date] ?? 0) + localRemaining;
  }

  return (
    <div className="mainpage-container">
      <CustomCalendar 
        initialDate={selectedDate}
        onDateChange={setSelectedDate}
        onMonthChange={setViewDate}
        remainingByDate={calendarRemainingByDate}
      />
      <Todo 
        dateKey={dateKey}
        todosByDate={todosByDate}
        setTodosByDate={setTodosByDate}
        onCompletionChanged={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
};

export default MainPage; //MainPage라는 컴포넌트를 다른 파일에서도 가져다 쓸 수 있도록 "밖으로 내보내는" 명령어

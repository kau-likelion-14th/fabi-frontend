import React, { useState, useEffect } from "react";
import { get } from "../../Api";
import config from "../../Config";
import StatCard from "./StatCard";

const Status = () => {
  const [stats, setStats] = useState([
    { icon: "🔥", title: "연속 달성일", statistics: { value: 0, unit: "일" } },
    { icon: "🎯", title: "최근 30일 달성률", statistics: { value: 0, unit: "%" } },
    { icon: "⭐", title: "가장 많이 완료한 요일", statistics: { value: "-", unit: "" } },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await get(config.STATISTICS.GET);
        const data = response.result || response;

        setStats([
          {
            icon: "🔥",
            title: "연속 달성일",
            statistics: { value: data.streak || 0, unit: "일" },
          },
          {
            icon: "🎯",
            title: "최근 30일 달성률",
            statistics: { value: data.monthPercent || 0, unit: "%" },
          },
          {
            icon: "⭐",
            title: "가장 많이 완료한 요일",
            statistics: { value: formatDay(data.mostTodoWeek), unit: "" },
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  const formatDay = (day) => {
    const days = {
      MON: "월요일", TUE: "화요일", WED: "수요일",
      THU: "목요일", FRI: "금요일", SAT: "토요일", SUN: "일요일",
    };
    return days[day] || day || "정보 없음";
  };

  return (
    <div className="status-section">
      {stats.map((stat, idx) => (
        <StatCard key={idx} stats={stat} />
      ))}
    </div>
  );
};

export default Status;

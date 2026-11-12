import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import React, { useState } from 'react';
import "../../styles/Calendar.css";

const toDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

export default function CustomCalendar({
    initialDate = new Date(),
    onDateChange,
    onMonthChange,
    remainingByDate = {},
}) {
    const [selectedDate, setSelectedDate] = useState(initialDate);

    const handledDateChange = (value) => {
        const next = value instanceof Date ? value : value?.[0];
        setSelectedDate(next);
        onDateChange?.(next);
    };

    return (
        <div className="calendar-container">
            <Calendar
                onChange={handledDateChange}
                onActiveStartDateChange={({ activeStartDate }) => onMonthChange?.(activeStartDate)}
                value={selectedDate}
                calendarType='gregory'
                view='month'
                prev2Label={null}
                next2Label={null}
                showNeighboringMonth={true}
                formatDay={(locale, date) => String(date.getDate())}
                tileContent={({ date, view }) => {
                    if (view !== 'month') return null;
                    const remaining = remainingByDate[toDateKey(date)];
                    if (remaining === undefined) return null;

                    return (
                        <div className="tile-meta">
                            {remaining === 0 ? "★" : remaining}
                        </div>
                    );
                }}
                tileClassName={({ date, view }) => {
                    if (view !== 'month') return "";
                    const remaining = remainingByDate[toDateKey(date)];
                    if (remaining === undefined) return "";
                    return remaining === 0 ? "tile-done" : "tile-has";
                }}
            />
        </div>
    );
}

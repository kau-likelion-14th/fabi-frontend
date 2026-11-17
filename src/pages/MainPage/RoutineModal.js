import React, { useEffect, useState } from "react";
import "../../styles/Todo.css";
import "../../styles/RoutineModal.css";

const Days = ["월", "화", "수", "목", "금", "토", "일"];
const Weeks = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const RoutineModal = ({
    isOpen,
    onClose,
    onSave,
    initialRoutine,
    defaultDate,
}) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [repeatDays, setRepeatDays] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        setStartDate(initialRoutine?.startDate || defaultDate || "");
        setEndDate(initialRoutine?.endDate || "");
        setRepeatDays(initialRoutine?.week ?? null);
    }, [isOpen, initialRoutine, defaultDate]);

    if (!isOpen) return null;

    const valid = Boolean(startDate && endDate && startDate <= endDate && repeatDays);
    const handleSave = () => {
        if (!valid) return;
        onSave({
            startDate,
            endDate,
            week: repeatDays,
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                role="dialog" aria-modal="true" aria-label="루틴 등록하기"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="routine-header">
                    <button type="button" className="routine-close" aria-label="루틴 닫기" onClick={onClose}>{"‹"}</button>
                    <div className="routine-title">루틴 등록하기</div>
                </div>

                <div className="modal-section">
                    <div className="modal-label">시작 날짜</div>
                    <div className="date-wrapper">
                        <input
                            type="date"
                            className="date-input"
                            aria-label="시작 날짜"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <div className="date-initial">{startDate || "없음"}</div>
                    </div>
                </div>

                <div className="modal-section">
                    <div className="modal-label">종료 날짜</div>
                    <div className="date-wrapper">
                        <input
                            type="date"
                            className="date-input"
                            aria-label="종료 날짜"
                            min={startDate}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        <div className="date-initial">{endDate || "없음"}</div>
                    </div>
                </div>

                <div className="modal-section">
                    <div className="modal-label">반복</div>
                    <div className="modal-categories">
                        {Days.map((day, idx) => (
                            <label
                                key={day}
                                className={`modal-categoryitem ${repeatDays === Weeks[idx] ? "on" : ""}`}
                            >
                                <span>{day}</span>
                                <input
                                    type="radio"
                                    name="repeatDays"
                                    value={Weeks[idx]}
                                    checked={repeatDays === Weeks[idx]}
                                    onChange={() => setRepeatDays(Weeks[idx])}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <p className="modal-hint">시작 날짜, 종료 날짜와 반복 요일을 선택해 주세요.</p>
                {startDate && endDate && startDate > endDate && <p role="alert">종료 날짜는 시작 날짜 이후여야 합니다.</p>}
                <div className="modal-actions">
                    <button className="leftbutton2" onClick={onClose}>취소</button>
                    <button className="rightbutton" disabled={!valid} onClick={handleSave}>저장</button>
                </div>
            </div>
        </div>
    );
};

export default RoutineModal;
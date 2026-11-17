import React, {useEffect, useState} from "react";
import "../../styles/Todo.css";
import "../../styles/TodoModal.css";
import RoutineModal from "./RoutineModal";

const TodoModal = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialTodo,
    categories = {},
    busy = false,
    error = "",
    categoriesLoading = false,
    dateKey
}) => {
    const isEditMode = Boolean(initialTodo);

    const [category, setCategory] = useState(null);
    const [text, setText] = useState("");
    const [routine, setRoutine] = useState(null);

    const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setCategory(initialTodo?.category ?? null);
        setText(initialTodo?.text || "");
        setRoutine(initialTodo?.routine || null);
        setIsRoutineModalOpen(false);
    }, [isOpen, initialTodo]);

    if (!isOpen) return null;

    const categoryKeys = Object.keys(categories);
    const selectedCategory = category ?? categoryKeys[0] ?? "";

    const handleSave = () => {
        if (!text.trim() || !selectedCategory || busy || categoriesLoading || !categoryKeys.includes(selectedCategory)) return;

        onSave({
            text: text.trim(),
            category: selectedCategory,
            routine,
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                role="dialog" aria-modal="true" aria-label={isEditMode ? "할 일 수정하기" : "할 일 추가하기"}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-title">
                    {isEditMode ? "할 일 수정하기" : "할 일 추가하기"}
                </div>
                <div className="modal-section">
                    <div className="modal-label">카테고리</div>
                    {categoriesLoading && <p role="status">카테고리를 불러오는 중...</p>}
                    {!categoriesLoading && categoryKeys.length === 0 && <p>등록된 카테고리가 없습니다.</p>}
                    <div className="modal-categories">
                        {categoryKeys.map((c) => (
                            <label
                                key={c}
                                className={`modal-categoryitem ${selectedCategory === c ? 'selected' : ''}`}
                            >
                                <span style={categories[c]}>{c}</span>
                                <input
                                    disabled={busy}
                                    type="radio"
                                    name="category"
                                    value={c}
                                    checked={selectedCategory === c}
                                    onChange={() => setCategory(c)}
                                />
                            </label>
                        ))}
                    </div>
                </div>
                <div className="modal-section">
                    <div className="modal-label">내용</div>
                    <div className="input-wrapper">
                        <input
                            disabled={busy}
                            type="text"
                            className="text-input"
                            aria-label="내용"
                            placeholder="내용을 입력해주세요"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </div>
                </div>
                <div className="modal-section">
                    <button
                        type="button"
                        className="routine-row"
                        onClick={() => setIsRoutineModalOpen(true)}
                        disabled={busy || (isEditMode && !initialTodo.routine)}
                    >
                        <div className="routine-label">{routine ? "루틴 수정하기" : "루틴 등록하기"}</div>
                        <div className="routine-button">{"›"}</div>
                    </button>
                </div>
                {routine && <p className="routine-summary">{routine.startDate} ~ {routine.endDate} · 매주 {({ MON: "월", TUE: "화", WED: "수", THU: "목", FRI: "금", SAT: "토", SUN: "일" })[routine.week]}요일</p>}
                {routine && !isEditMode && <button type="button" disabled={busy} onClick={() => setRoutine(null)}>루틴 해제</button>}
                {isEditMode && <p className="modal-hint">{routine ? "루틴 수정은 오늘 이후 일정에 반영되며, 삭제는 선택한 날짜에만 적용됩니다." : "등록된 일반 할 일은 루틴으로 전환할 수 없습니다."}</p>}
                {error && <p role="alert">{error}</p>}
                <div className="modal-actions">
                    <button
                        className={`leftbutton ${isEditMode ? '' : 'disabled'}`}
                        onClick={onDelete}
                        disabled={busy || !isEditMode}
                    >
                        삭제
                    </button>
                    <button
                        className={`rightbutton ${text.trim() ? '' : 'disabled'}`}
                        onClick={handleSave}
                        disabled={!text.trim() || !selectedCategory || busy || categoriesLoading || !categoryKeys.includes(selectedCategory)}
                    >
                        {busy ? "처리 중..." : "저장"}
                    </button>
                </div>
                <RoutineModal
                    isOpen={isRoutineModalOpen}
                    initialRoutine={routine}
                    defaultDate={dateKey}
                    onClose={() => setIsRoutineModalOpen(false)}
                    onSave={(newRoutine) => {
                        setRoutine(newRoutine);
                        setIsRoutineModalOpen(false);
                    }}
                />
            </div>
        </div>
    );
};

export default TodoModal;

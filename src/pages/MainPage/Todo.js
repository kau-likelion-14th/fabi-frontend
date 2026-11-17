import React, {useEffect, useMemo, useState} from "react";
import "../../styles/Todo.css";
import "../../styles/TodoModal.css";
import "../../styles/RoutineModal.css";
import TodoModal from "./TodoModal";
import { get, post, put, del, patch } from "../../Api";
import config from "../../Config";

const Weeks = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const categoryStyles = { // 카테고리별 디자인 설정 (배경색과 글자색)
    공부: { backgroundColor: '#E5F8F1', color: '#333' },
    운동: { backgroundColor: '#FFC8BE', color: '#333' },
    동아리: { backgroundColor: '#B6DAFF', color: '#333' },
};

const Todo = ({ dateKey, todosByDate, onCompletionChanged }) => {
    const todos = todosByDate[dateKey] ?? []; // 해당 날짜의 할 일 목록을 가져오되, 데이터가 없으면 빈 배열([])로 처리

    const [isModalOpen, setIsModalOpen] = useState(false); // 모달이 열렸는지 여부
    const [editingTodo, setEditingTodo] = useState(null); // 지금 수정 중인 할 일 정보 (새로 만들 때는 null)
    const [serverCategories, setServerCategories] = useState([]);

    useEffect(() => {
        if (!isModalOpen) return;

        let active = true;

        const fetchCategories = async () => {
            try {
                const data = await get(config.CATEGORIES.GET);
                if (active) setServerCategories(Array.isArray(data?.result) ? data.result : []);
            } catch (error) {
                if (active) console.error("카테고리 조회 실패", error);
            }
        };

        fetchCategories();
        return () => { active = false; };
    }, [isModalOpen]);

    const categories = Object.fromEntries(serverCategories.map(({ categoryName, color }) => [
        categoryName,
        color ? { backgroundColor: color, color: "#333" } : categoryStyles[categoryName],
    ]));

    const openModal = () => { // [+] 버튼 눌렀을 때 (새로 만들기)
        setEditingTodo(null);
        setIsModalOpen(true);
    };

    const openEditModal = async (todo) => {
        try {
            const data = await get(config.TODOS.DETAIL(todo.id));
            if (data?.isSuccess === false) throw new Error(data.message);
            const detail = data.result;
            setEditingTodo({
                id: detail.todoId,
                text: detail.description,
                category: detail.categoryName,
                routine: detail.routineEnabled ? {
                    startDate: detail.startDate,
                    endDate: detail.endDate,
                    repeatDays: Weeks.indexOf(detail.week),
                } : null,
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error("Todo 상세 조회 실패", error);
        }
    };

    const TodoCompleted = async (todo) => {
        try {
            const data = await patch(config.TODOS.TOGGLE_COMPLETE(todo.id, dateKey), {
                completed: !todo.completed,
            });
            if (data?.isSuccess === false) throw new Error(data.message);
            onCompletionChanged();
        } catch (error) {
            console.error("Todo 완료 상태 변경 실패", error);
        }
    };

    const handledSaveTodo = async ({text, category, routine}) => {
        try {
            const payload = {
                description: text,
                categoryName: category,
                routineEnabled: Boolean(routine),
                startDate: routine?.startDate || null,
                endDate: routine?.endDate || null,
                week: routine ? Weeks[routine.repeatDays] : null,
            };
            const data = editingTodo
                ? await put(config.TODOS.DETAIL(editingTodo.id), payload)
                : await post(config.TODOS.LIST, payload, { params: { date: dateKey } });
            if (data?.isSuccess === false) throw new Error(data.message);
            setIsModalOpen(false);
            onCompletionChanged();
        } catch (error) {
            console.error("Todo 저장 실패", error);
        }
    };

    const handledDeleteTodo = async () => {
        if (!editingTodo) return;
        try {
            const data = await del(config.TODOS.DELETE(editingTodo.id, dateKey));
            if (data?.isSuccess === false) throw new Error(data.message);
            setIsModalOpen(false);
            onCompletionChanged();
        } catch (error) {
            console.error("Todo 삭제 실패", error);
        }
    };

    const counts = useMemo(() => { //통계 계산
        const total = todos.length; // 전체 개수
        const done = todos.filter((t) => t.completed).length; // 완료된 개수
        return { total, done };
    }, [todos]);

    return (
        <div className="todo-container">
            <div className="todo-header">
                <div className="todo-title">To do List</div>
                <button className="todo-add" onClick={openModal}>+</button> 
            </div>
            <div className="todo-list">
                {todos.map((t) => (
                    <div 
                        key={t.id} 
                        className={`todo-item ${t.completed ? 'done' : ''}`}
                        onClick={() => openEditModal(t)}
                    >
                        <button 
                            className={`checkbox ${t.completed ? 'checked' : ''}`} 
                            onClick={(e) => {
                                e.stopPropagation();
                                TodoCompleted(t);
                            }}
                        >
                        </button>
                        <div className="todo-text">{t.text}</div>
                        <div 
                            className="todo-category"
                            style={categories[t.category] ?? categoryStyles[t.category]}
                        >
                            {t.category}
                        </div>
                    </div>
                ))}
            </div>
            <TodoModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handledSaveTodo}
                onDelete={handledDeleteTodo}
                initialTodo={editingTodo}
                categories={categories}
            />
        </div>
    );
};

export default Todo;

import React, { useEffect, useRef, useState } from "react";
import "../../styles/Todo.css";
import "../../styles/TodoModal.css";
import "../../styles/RoutineModal.css";
import TodoModal from "./TodoModal";
import { get, post, put, del, patch } from "../../Api";
import config from "../../Config";

const checkResponse = (data) => {
    if (data?.isSuccess === false) throw new Error(data.message || "요청에 실패했습니다.");
    return data?.result;
};
const errorMessage = (error) => error.response?.data?.message || error.message || "다시 시도해 주세요.";

const Todo = ({ dateKey, todosByDate, onTodosChanged, loading, loadError, onRetry }) => {
    const todos = todosByDate[dateKey] ?? [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);
    const [serverCategories, setServerCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoryError, setCategoryError] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const lock = useRef(false);

    useEffect(() => {
        if (!isModalOpen) return;
        let active = true;
        setCategoriesLoading(true);
        setCategoryError("");
        get(config.CATEGORIES.GET).then((data) => {
            const result = checkResponse(data);
            if (!Array.isArray(result)) throw new Error("카테고리 응답을 확인할 수 없습니다.");
            if (active) setServerCategories(result);
        }).catch((err) => {
            if (active) setCategoryError(`카테고리를 불러오지 못했습니다. 창을 다시 열어 주세요. ${errorMessage(err)}`);
        }).finally(() => {
            if (active) setCategoriesLoading(false);
        });
        return () => { active = false; };
    }, [isModalOpen]);

    const categories = Object.fromEntries(serverCategories.map(({ categoryName, color }) => [
        categoryName, { backgroundColor: color || "#E5F8F1", color: "#333" },
    ]));
    const closeModal = () => {
        if (!lock.current) setIsModalOpen(false);
    };
    const openModal = () => {
        setError("");
        setEditingTodo(null);
        setIsModalOpen(true);
    };
    const runRequest = async (action) => {
        if (lock.current) return;
        lock.current = true;
        setBusy(true);
        setError("");
        try { await action(); }
        catch (err) { setError(errorMessage(err)); }
        finally { lock.current = false; setBusy(false); }
    };
    const openEditModal = (todo) => runRequest(async () => {
        const detail = checkResponse(await get(config.TODOS.DETAIL(todo.id)));
        if (!detail) throw new Error("할 일 상세 정보를 불러오지 못했습니다.");
        setEditingTodo({
            id: detail.todoId,
            text: detail.description,
            category: detail.categoryName,
            routine: detail.routineEnabled ? {
                startDate: detail.startDate,
                endDate: detail.endDate,
                week: detail.week,
            } : null,
        });
        setIsModalOpen(true);
    });
    const toggleCompleted = (todo) => runRequest(async () => {
        checkResponse(await patch(config.TODOS.TOGGLE_COMPLETE(todo.id, dateKey), {
            completed: !todo.completed,
        }));
        onTodosChanged();
    });
    const saveTodo = ({ text, category, routine }) => runRequest(async () => {
        const payload = {
            description: text,
            categoryName: category,
            routineEnabled: Boolean(routine),
            startDate: routine?.startDate || null,
            endDate: routine?.endDate || null,
            week: routine?.week || null,
        };
        checkResponse(editingTodo
            ? await put(config.TODOS.DETAIL(editingTodo.id), payload)
            : await post(config.TODOS.LIST, payload, { params: { date: dateKey } }));
        setIsModalOpen(false);
        onTodosChanged();
    });
    const deleteTodo = () => runRequest(async () => {
        if (!editingTodo) return;
        checkResponse(await del(config.TODOS.DELETE(editingTodo.id, dateKey)));
        setIsModalOpen(false);
        onTodosChanged();
    });

    return (
        <div className="todo-container" aria-busy={busy || loading}>
            <div className="todo-header">
                <div className="todo-title">To do List</div>
                <button className="todo-add" aria-label="할 일 추가" onClick={openModal} disabled={busy || loading}>+</button>
            </div>
            {loading && <p role="status">할 일을 불러오는 중...</p>}
            {loadError && <p role="alert">{loadError} <button onClick={onRetry}>다시 시도</button></p>}
            {!isModalOpen && error && <p role="alert">{error}</p>}
            {!loading && !loadError && todos.length === 0 && <p className="todo-empty">등록된 할 일이 없습니다.</p>}
            <div className="todo-list">
                {todos.map((todo) => (
                    <div key={todo.id} className={`todo-item ${todo.completed ? 'done' : ''}`}
                        role="button" tabIndex={busy || loading ? -1 : 0}
                        aria-label={`${todo.text} ${todo.category}`} aria-disabled={busy || loading}
                        onClick={() => !busy && !loading && openEditModal(todo)}
                        onKeyDown={(event) => {
                            if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                                event.preventDefault();
                                if (!busy && !loading) openEditModal(todo);
                            }
                        }}>
                        <button className={`checkbox ${todo.completed ? 'checked' : ''}`}
                            aria-label={`${todo.text} 완료`} aria-pressed={todo.completed}
                            disabled={busy || loading} onClick={(event) => {
                                event.stopPropagation();
                                toggleCompleted(todo);
                            }} />
                        <div className="todo-text">{todo.text}</div>
                        <div className="todo-category" style={categories[todo.category]}>{todo.category}</div>
                    </div>
                ))}
            </div>
            <TodoModal isOpen={isModalOpen} onClose={closeModal} onSave={saveTodo}
                onDelete={deleteTodo} initialTodo={editingTodo} categories={categories}
                busy={busy} error={error || categoryError} categoriesLoading={categoriesLoading}
                dateKey={dateKey} />
        </div>
    );
};
export default Todo;

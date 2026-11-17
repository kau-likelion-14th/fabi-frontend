import React from "react";

import "../../styles/Todo.css";
import "../../styles/FriendTodo.css";

// 친구 todo 목록에 보여줄 임시 데이터
// completed 값에 따라 완료 여부를 구분함
const dummyTodos = [
  { id: 1, text: "프론트 보충자료 읽기", category: "공부", completed: true },
  { id: 2, text: "FriendTodo 구현하기", category: "공부", completed: false },
  { id: 3, text: "동아리 회의", category: "동아리", completed: false },
];

// todo 카테고리별 스타일 정보
const dummyCategories = {
  공부: { backgroundColor: "#E5F8F1", color: "#333" },
  일상: { backgroundColor: "#FFC8BE", color: "#333" },
  동아리: { backgroundColor: "#B6DAFF", color: "#333" },
};

// 친구의 todo 목록을 보여주는 컴포넌트
const FriendTodo = ({ title = "To do List", todos = dummyTodos, categories = dummyCategories }) => {
  return (
    <div className="friend-todo">
      <div className="todo-container">
        <div className="todo-header">
          <div className="todo-title">{title}</div>
        </div>

        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="friend-todo__empty">등록된 투두가 없습니다.</div>
          ) : (
            // todo 배열을 map으로 돌면서 항목을 하나씩 화면에 출력
            todos.map((t) => (
              <div key={t.id} className={`todo-item ${t.completed ? "done" : ""}`}>
                {/* 완료된 todo면 checked 클래스가 붙어서 체크된 모양으로 보임 */}
                <div className={`checkbox ${t.completed ? "checked" : ""}`} />
                <div className="todo-text">{t.text}</div>
                <div
                  className="todo-category"
                  style={categories[t.category] ?? undefined}
                >
                  {t.category}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendTodo;
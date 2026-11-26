import "../../styles/Todo.css";
import "../../styles/FriendTodo.css";

const FriendTodo = ({ title = "To do List", todos, categories, status }) => {
  return (
    <div className="friend-todo">
      <div className="todo-container">
        <div className="todo-header">
          <div className="todo-title">{title}</div>
        </div>

        <div className="todo-list">
          {status === "loading" ? (
            <div className="friend-todo__empty" role="status">투두를 불러오는 중입니다.</div>
          ) : status === "error" ? (
            <div className="friend-todo__empty" role="status">투두를 불러오지 못했습니다.</div>
          ) : todos.length === 0 ? (
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
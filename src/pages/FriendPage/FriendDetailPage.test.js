import { fireEvent, render, screen } from "@testing-library/react";
import { get } from "../../Api";
import FriendDetailPage from "./FriendDetailPage";

jest.mock("../../Api", () => ({ get: jest.fn() }));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "42" }),
  useLocation: () => ({}),
  useNavigate: () => jest.fn(),
}), { virtual: true });

jest.mock("react-calendar", () => function Calendar({
  onChange,
  onActiveStartDateChange,
  tileContent,
}) {
  const date = new Date(2026, 4, 5);
  return (
    <>
      <button onClick={() => onChange(date)}>
        5월 5일 {tileContent({ date, view: "month" })}
      </button>
      <button onClick={() => onActiveStartDateChange({ activeStartDate: date })}>
        5월 달력
      </button>
    </>
  );
});

test("친구 주소로 직접 접근해 프로필을 표시하고 날짜와 월 변경을 반영한다", async () => {
  get.mockImplementation(async (endpoint, params) => {
    switch (endpoint) {
      case "/api/follow/42":
        return { result: { username: "하나#1234", profileImageUrl: "/avatar.png" } };
      case "/api/follow/42/calendar":
        return { result: { days: params.year === "2026" && params.month === "5"
          ? [{ date: "2026-05-05", hasTodo: true, remaining: 0 }]
          : [] } };
      case "/api/follow/42/todos":
        return { result: [{
          todoId: 1,
          description: params.date === "2026-05-05" ? "선택한 날짜 할 일" : "오늘 할 일",
          categoryName: "공부",
          completed: true,
        }] };
      default:
        throw new Error(endpoint);
    }
  });

  jest.useFakeTimers("modern").setSystemTime(new Date(2026, 3, 30, 12));
  try {
    render(<FriendDetailPage />);
    expect(await screen.findByText("하나")).toBeTruthy();
    expect(screen.getByAltText("profile").getAttribute("src")).toBe("/avatar.png");
    expect(await screen.findByText("오늘 할 일")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "5월 달력" }));
    expect(await screen.findByText("★")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /5월 5일/ }));
    const todo = await screen.findByText("선택한 날짜 할 일");
    expect(todo.closest(".todo-item").classList.contains("done")).toBe(true);
    expect(screen.queryByText("오늘 할 일")).toBeNull();
  } finally {
    jest.useRealTimers();
  }
});

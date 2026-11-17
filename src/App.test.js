import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainPage from './pages/MainPage/MainPage';
import FriendTodo from './pages/FriendPage/FriendTodo';
import { get, post, put, del, patch } from './Api';

jest.mock('./Api', () => ({ get: jest.fn(), post: jest.fn(), put: jest.fn(), del: jest.fn(), patch: jest.fn() }));
jest.mock('./pages/MainPage/Calendar', () => function Calendar({ remainingByDate }) {
  return <div data-testid="calendar">{JSON.stringify(remainingByDate)}</div>;
});
const success = (result) => ({ isSuccess: true, result });
const dateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
let todos;
let detail;
beforeEach(() => {
  jest.resetAllMocks();
  todos = [{ todoId: 7, description: '기존 할 일', categoryName: '공부', completed: false }];
  detail = { ...todos[0], routineEnabled: false };
  get.mockImplementation(async (url) => {
    if (url === '/api/todos/calendar') return success({ days: todos.length ? [{ date: dateKey(), hasTodo: true, remaining: todos.filter(t => !t.completed).length }] : [] });
    if (url === '/api/todos') return success(todos);
    if (url === '/api/categories') return success([{ categoryName: '공부', color: '#E5F8F1' }]);
    if (url === '/api/todos/7') return success(detail);
    throw new Error(`Unexpected URL ${url}`);
  });
});
const openExisting = async () => {
  fireEvent.click(await screen.findByRole('button', { name: '기존 할 일 공부' }));
  return screen.findByRole('dialog', { name: '할 일 수정하기' });
};
const expectRefreshed = async () => {
  await waitFor(() => expect(get.mock.calls.filter(([url]) => url === '/api/todos/calendar')).toHaveLength(2));
  expect(get.mock.calls.filter(([url]) => url === '/api/todos')).toHaveLength(2);
};

test('creates a Todo on the selected date and refreshes server data', async () => {
  post.mockImplementation(async () => { todos = [...todos, { todoId: 8, description: '새 할 일', categoryName: '공부', completed: false }]; return success({ todoId: 8 }); });
  render(<MainPage />);
  await screen.findByText('기존 할 일');
  fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }));
  await screen.findByRole('radio', { name: '공부' });
  fireEvent.change(screen.getByLabelText('내용'), { target: { value: '새 할 일' } });
  fireEvent.click(screen.getByRole('button', { name: '저장' }));
  expect(await screen.findByText('새 할 일')).toBeInTheDocument();
  expect(post).toHaveBeenCalledWith('/api/todos', { description: '새 할 일', categoryName: '공부', routineEnabled: false, startDate: null, endDate: null, week: null }, { params: { date: dateKey() } });
  await expectRefreshed();
  expect(screen.getByTestId('calendar')).toHaveTextContent('2');
});

test('fetches detail and persists edits using PUT', async () => {
  put.mockImplementation(async () => { todos = [{ ...todos[0], description: '수정한 할 일' }]; return success(detail); });
  render(<MainPage />);
  await openExisting();
  await screen.findByRole('radio', { name: '공부' });
  expect(get).toHaveBeenCalledWith('/api/todos/7');
  expect(screen.getByRole('button', { name: '루틴 등록하기 ›' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('내용'), { target: { value: '수정한 할 일' } });
  fireEvent.click(screen.getByRole('button', { name: '저장' }));
  await screen.findByText('수정한 할 일');
  expect(put).toHaveBeenCalledWith('/api/todos/7', expect.objectContaining({ description: '수정한 할 일', routineEnabled: false }));
  await expectRefreshed();
});

test('deletes the selected occurrence and clears calendar count', async () => {
  del.mockImplementation(async () => { todos = []; return success('OK'); });
  render(<MainPage />);
  await openExisting();
  fireEvent.click(screen.getByRole('button', { name: '삭제' }));
  await screen.findByText('등록된 할 일이 없습니다.');
  expect(del).toHaveBeenCalledWith(`/api/todos/7/dates/${dateKey()}`);
  await expectRefreshed();
  expect(screen.getByTestId('calendar')).toHaveTextContent('{}');
});

test('PATCH completion refreshes both list and calendar', async () => {
  patch.mockImplementation(async () => { todos = [{ ...todos[0], completed: true }]; return success(todos[0]); });
  render(<MainPage />);
  fireEvent.click(await screen.findByRole('button', { name: '기존 할 일 완료' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '기존 할 일 완료' })).toHaveAttribute('aria-pressed', 'true'));
  expect(patch).toHaveBeenCalledWith(`/api/todos/7/dates/${dateKey()}/complete`, { completed: true });
  await expectRefreshed();
  expect(screen.getByTestId('calendar')).toHaveTextContent('0');
});

test('failed save preserves the form and does not insert a local Todo', async () => {
  post.mockResolvedValue({ isSuccess: false, message: '저장 실패' });
  render(<MainPage />);
  await screen.findByText('기존 할 일');
  fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }));
  await screen.findByRole('radio', { name: '공부' });
  fireEvent.change(screen.getByLabelText('내용'), { target: { value: '실패한 할 일' } });
  fireEvent.click(screen.getByRole('button', { name: '저장' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('저장 실패');
  expect(screen.getByLabelText('내용')).toHaveValue('실패한 할 일');
  expect(screen.queryByText('실패한 할 일')).not.toBeInTheDocument();
});

test('validates routine dates and creates a routine using the backend week enum', async () => {
  post.mockResolvedValue(success({ todoId: 8 }));
  render(<MainPage />);
  await screen.findByText('기존 할 일');
  fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }));
  await screen.findByRole('radio', { name: '공부' });
  fireEvent.change(screen.getByLabelText('내용'), { target: { value: '반복 공부' } });
  fireEvent.click(screen.getByRole('button', { name: '루틴 등록하기 ›' }));
  const routine = within(screen.getByRole('dialog', { name: '루틴 등록하기' }));
  expect(routine.getByRole('button', { name: '저장' })).toBeDisabled();
  fireEvent.change(routine.getByLabelText('시작 날짜'), { target: { value: '2026-11-18' } });
  fireEvent.change(routine.getByLabelText('종료 날짜'), { target: { value: '2026-11-17' } });
  fireEvent.click(routine.getByRole('radio', { name: '월' }));
  expect(routine.getByRole('button', { name: '저장' })).toBeDisabled();
  fireEvent.change(routine.getByLabelText('종료 날짜'), { target: { value: '2026-12-31' } });
  fireEvent.click(routine.getByRole('button', { name: '저장' }));
  fireEvent.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() => expect(post).toHaveBeenCalledWith('/api/todos', expect.objectContaining({ routineEnabled: true, startDate: '2026-11-18', endDate: '2026-12-31', week: 'MON' }), expect.any(Object)));
});

test('restores routine detail and preserves it when editing the description', async () => {
  detail = { ...detail, routineEnabled: true, startDate: '2026-11-18', endDate: '2026-12-31', week: 'WED' };
  put.mockResolvedValue(success(detail));
  render(<MainPage />);
  await openExisting();
  await screen.findByRole('radio', { name: '공부' });
  fireEvent.click(screen.getByRole('button', { name: '루틴 수정하기 ›' }));
  const routine = within(screen.getByRole('dialog', { name: '루틴 등록하기' }));
  expect(routine.getByLabelText('시작 날짜')).toHaveValue('2026-11-18');
  expect(routine.getByRole('radio', { name: '수' })).toBeChecked();
  fireEvent.click(routine.getByRole('radio', { name: '금' }));
  fireEvent.click(routine.getByRole('button', { name: '저장' }));
  fireEvent.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() => expect(put).toHaveBeenCalledWith('/api/todos/7', expect.objectContaining({ routineEnabled: true, startDate: '2026-11-18', endDate: '2026-12-31', week: 'FRI' })));
});


test('blocks duplicate saves and closing while a request is pending', async () => {
  let finish;
  post.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  render(<MainPage />);
  await screen.findByText('기존 할 일');
  fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }));
  await screen.findByRole('radio', { name: '공부' });
  fireEvent.change(screen.getByLabelText('내용'), { target: { value: '한 번만 저장' } });
  fireEvent.click(screen.getByRole('button', { name: '저장' }));
  const pending = screen.getByRole('button', { name: '처리 중...' });
  expect(pending).toBeDisabled();
  fireEvent.click(pending);
  expect(screen.getByRole('button', { name: '닫기' })).toBeDisabled();
  expect(post).toHaveBeenCalledTimes(1);
  finish(success({ todoId: 8 }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('friend Todo displays the selected date data passed by its parent', () => {
  const { rerender } = render(<FriendTodo todos={[{ id: 1, text: '선택한 날짜의 할 일', category: '공부', completed: false }]} categories={{}} />);
  expect(screen.getByText('선택한 날짜의 할 일')).toBeInTheDocument();
  expect(screen.queryByText('FriendTodo 구현하기')).not.toBeInTheDocument();
  rerender(<FriendTodo todos={[]} categories={{}} />);
  expect(screen.getByText('등록된 투두가 없습니다.')).toBeInTheDocument();
});

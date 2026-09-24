"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { PlusOutlined } from '@ant-design/icons';
import TaskCard from '../../../components/TaskCard';
import CustomButton from '@/app/components/Button';
import LoadingComponent from '@/app/components/LoadingComponent';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DragEvent, useState } from 'react';

const GET_TASK_BOARD = gql`
  query GetTaskBoard($siteId: ID!) {
    getTaskBoard(siteId: $siteId) {
      columns {
        status
        count
        tasks {
          _id
          title
          description
          createdBy
          status
          priority
          dueDate
        }
      }
      totalTasks
    }
  }
`;

type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

type Task = {
  _id: string;
  title: string;
  description?: string | null;
  createdBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
};

type TaskBoardData = {
  getTaskBoard: {
    columns: Array<{ status: TaskStatus; count: number; tasks: Task[] }>;
    totalTasks: number;
  };
};

const priorityLabels: Record<TaskPriority, string> = {
  LOW: 'low priority',
  MEDIUM: 'medium priority',
  HIGH: 'high priority',
  URGENT: 'highest priority',
};

const formatDueDate = (dueDate?: string | number | null) => {
  if (!dueDate) return 'No due date';
  const date = new Date(typeof dueDate === 'string' && /^\d+$/.test(dueDate) ? Number(dueDate) : dueDate);

  if (Number.isNaN(date.getTime())) return String(dueDate);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

export default function TaskBoard() {
  const params = useParams();
  const siteId = typeof params.id === 'string' ? params.id : params.id?.[0];
  const { data, loading, error } = useQuery<TaskBoardData>(GET_TASK_BOARD, {
    variables: { siteId },
    skip: !siteId,
    fetchPolicy: 'no-cache',
  });

  const [localColumns, setLocalColumns] = useState<TaskBoardData['getTaskBoard']['columns'] | null>(null);
  const columns = localColumns ?? data?.getTaskBoard.columns ?? [];

  if (loading) return <LoadingComponent />;
  if (error) return <main className="min-h-screen p-8"><p role="alert">Unable to load tasks.</p></main>;

  const tasksFor = (statuses: TaskStatus[]) => columns.filter((column) => statuses.includes(column.status)).flatMap((column) => column.tasks);
  const handleDragStart = (event: DragEvent<HTMLAnchorElement>, taskId: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/task-id', taskId);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/task-id');
    if (!taskId) return;

    setLocalColumns((currentColumns) => {
      const sourceColumns = currentColumns ?? data?.getTaskBoard.columns ?? [];
      let movedTask: Task | undefined;
      const nextColumns = sourceColumns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => {
          if (task._id !== taskId) return true;
          movedTask = task;
          return false;
        }),
      }));

      if (!movedTask) return sourceColumns;

      const destination = nextColumns.find((column) => column.status === targetStatus);
      if (destination) {
        destination.tasks = [...destination.tasks, { ...movedTask, status: targetStatus }];
      }

      return nextColumns;
    });
  };

  const renderColumn = (title: string, statuses: TaskStatus[], dropStatus: TaskStatus, className: string) => (
    <div
      className={`${className} p-4 rounded-xl`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => handleDrop(event, dropStatus)}
      aria-label={`Drop tasks in ${title}`}
    >
      <h2 className="font-bold text-sm mb-6 px-2 tracking-wider">{title}</h2>
      {renderTasks(tasksFor(statuses))}
    </div>
  );

  const renderTasks = (tasks: Task[]) => tasks.length > 0 ? tasks.map((task) => (
    <Link
      key={task._id}
      href={`/site/${siteId}/taskboard/taskdetails?taskId=${encodeURIComponent(task._id)}`}
      draggable
      onDragStart={(event) => handleDragStart(event, task._id)}
      className="block cursor-grab rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 active:cursor-grabbing"
      aria-label={`View details for ${task.title}`}
    >
      <TaskCard
        title={task.title}
        priorities={[{ label: priorityLabels[task.priority], color: '' }]}
        content={task.description || 'No description provided.'}
        date={formatDueDate(task.dueDate)}
        style={{ cursor: 'inherit' }}
      />
    </Link>
  )) : <p className="px-2 py-8 text-center text-sm text-gray-500">No tasks</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Task Board <span className="text-base font-medium text-gray-500">({data?.getTaskBoard.totalTasks ?? 0})</span></h1>
        <Link href={`/site/${siteId}/taskboard/createtask`}>
          <CustomButton text='Add New Task' icon={<PlusOutlined />} />
        </Link>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {renderColumn('BACKLOG', ['BACKLOG'], 'BACKLOG', 'bg-[#f0f0f0] min-h-[70vh]')}
        {renderColumn('IN PROGRESS', ['IN_PROGRESS'], 'IN_PROGRESS', 'bg-[#f0f0f0] min-h-[70vh]')}
        {renderColumn('COMPLETED', ['REVIEW', 'DONE', 'CANCELLED'], 'DONE', 'bg-[#f0f0f0] min-h-[70vh]')}

      </div>
    </div>
  );
}

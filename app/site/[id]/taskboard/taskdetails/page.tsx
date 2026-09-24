"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { ArrowLeft, BarChart3, CalendarDays, UserRound, UsersRound } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";

const GET_TASK_BOARD = gql`
	query GetTaskBoard($siteId: ID!) {
		getTaskBoard(siteId: $siteId) {
			columns {
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
		}
	}
`;

type TaskStatus = "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE" | "CANCELLED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type Task = {
	_id: string;
	title: string;
	description?: string | null;
	createdBy: string;
	status: TaskStatus;
	priority: TaskPriority;
	dueDate?: string | number | null;
};

type TaskBoardData = {
	getTaskBoard: {
		columns: Array<{ tasks: Task[] }>;
	};
};

const priorityLabels: Record<TaskPriority, string> = {
	LOW: "LOW",
	MEDIUM: "MEDIUM",
	HIGH: "HIGH",
	URGENT: "URGENT",
};

const statusLabels: Record<TaskStatus, string> = {
	BACKLOG: "BACKLOG",
	IN_PROGRESS: "IN PROGRESS",
	REVIEW: "REVIEW",
	DONE: "DONE",
	CANCELLED: "CANCELLED",
};

const formatDueDate = (dueDate?: string | number | null) => {
	if (!dueDate) return "No due date";
	const date = new Date(typeof dueDate === "string" && /^\d+$/.test(dueDate) ? Number(dueDate) : dueDate);
	if (Number.isNaN(date.getTime())) return String(dueDate);

	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = String(date.getFullYear()).slice(-2);
	return `${day}/${month}/${year}`;
};

export default function TaskDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const siteId = typeof params.id === "string" ? params.id : params.id?.[0];
	const taskId = searchParams.get("taskId");
	const currentUser = useAppSelector((state: RootState) => state.authSlice.user);
	const { data, loading, error } = useQuery<TaskBoardData>(GET_TASK_BOARD, {
		variables: { siteId },
		skip: !siteId || !taskId,
		fetchPolicy: "no-cache",
	});

	const task = data?.getTaskBoard.columns.flatMap((column) => column.tasks).find((item) => item._id === taskId);
	const createdBy = task?.createdBy === currentUser?._id && currentUser
		? `${currentUser.firstName} ${currentUser.lastName}`.trim()
		: task?.createdBy;

	if (loading) return <main className="task-details-page"><p className="task-details-state">Loading task...</p></main>;
	if (error || !task) return (
		<main className="task-details-page">
			<button type="button" className="back-button" onClick={() => router.back()} aria-label="Go back">
				<ArrowLeft size={32} strokeWidth={2} />
			</button>
			<p className="task-details-state">Unable to find this task.</p>
		</main>
	);

	return (
		<main className="task-details-page">
			<header className="task-details-header">
				<button type="button" className="back-button" onClick={() => router.back()} aria-label="Go back">
					<ArrowLeft size={32} strokeWidth={2} />
				</button>
				<h1>Task Details</h1>
			</header>

			<section className="task-details-content" aria-labelledby="task-title">
				<h2 id="task-title">{task.title}</h2>

				<div className="task-tags" aria-label="Task status and priority">
					<span className={`task-tag priority-${task.priority.toLowerCase()}`}>{priorityLabels[task.priority]}</span>
					<span className="task-tag status-tag">{statusLabels[task.status]}</span>
				</div>

				<section className="details-section" aria-labelledby="details-heading">
					<h3 id="details-heading">Details</h3>
					<div className="details-list">
						<div className="detail-row">
							<UserRound size={22} />
							<span>Created By</span>
							<strong>{createdBy || "Not available"}</strong>
						</div>
						<div className="detail-row">
							<CalendarDays size={22} />
							<span>Due Date</span>
							<strong>{formatDueDate(task.dueDate)}</strong>
						</div>
						<div className="detail-row">
							<BarChart3 size={22} />
							<span>Progress</span>
							<strong>{task.status === "DONE" ? "100%" : "0%"}</strong>
						</div>
					</div>
				</section>

				<section className="description-section" aria-labelledby="description-heading">
					<h3 id="description-heading">Description</h3>
					<p>{task.description || "No description provided."}</p>
				</section>

				<section className="members-section" aria-labelledby="members-heading">
					<div className="members-heading">
						<h3 id="members-heading">Assigned Members (0)</h3>
						<button type="button" className="edit-button" disabled>Edit</button>
					</div>
					<div className="empty-members">
						<UsersRound size={22} />
						<span>No members assigned</span>
					</div>
				</section>
			</section>

			<style jsx>{`
				.task-details-page { background: #fff; color: #242424; min-height: calc(100vh - 84px); padding: 30px 34px 64px; }
				.task-details-header { align-items: center; display: flex; gap: 28px; margin: 0 auto 54px; max-width: 900px; }
				.task-details-header h1 { font-size: 38px; font-weight: 800; letter-spacing: -.03em; margin: 0; }
				.back-button { align-items: center; background: transparent; border: 0; color: #111; cursor: pointer; display: inline-flex; padding: 0; }
				.task-details-content { margin: 0 auto; max-width: 900px; }
				.task-details-content h2 { font-size: 30px; font-weight: 800; margin: 0 0 18px; }
				.task-tags { display: flex; flex-wrap: wrap; gap: 12px; }
				.task-tag { border-radius: 6px; font-size: 14px; font-weight: 700; padding: 8px 13px; }
				.priority-low, .priority-medium { background: #eef6ff; color: #1665c1; }
				.priority-high, .priority-urgent { background: #fff0ed; color: #c2412d; }
				.status-tag { background: #eef6ff; color: #1665c1; }
				.details-section { margin-top: 58px; }
				.details-section h3, .description-section h3, .members-section h3 { font-size: 24px; font-weight: 800; margin: 0 0 24px; }
				.details-list { border-top: 1px solid #e6e6e6; }
				.detail-row { align-items: center; border-bottom: 1px solid #e6e6e6; color: #626262; display: grid; gap: 16px; grid-template-columns: 22px minmax(120px, 1fr) auto; min-height: 68px; }
				.detail-row strong { color: #242424; font-size: 17px; }
				.description-section { margin-top: 70px; }
				.description-section p { color: #626262; font-size: 18px; line-height: 1.6; margin: 0; white-space: pre-wrap; }
				.members-section { margin-top: 70px; }
				.members-heading { align-items: center; display: flex; justify-content: space-between; }
				.members-heading h3 { margin-bottom: 0; }
				.edit-button { background: transparent; border: 0; color: #1665c1; cursor: not-allowed; font-size: 16px; font-weight: 700; opacity: .55; }
				.empty-members { align-items: center; color: #777; display: flex; gap: 12px; margin-top: 28px; }
				.task-details-state { color: #666; font-size: 17px; margin: 80px auto; max-width: 900px; }
				@media (max-width: 640px) { .task-details-page { padding: 24px 20px 48px; } .task-details-header { gap: 20px; margin-bottom: 46px; } .task-details-header h1 { font-size: 32px; } .task-details-content h2 { font-size: 26px; } .detail-row { gap: 10px; grid-template-columns: 22px minmax(90px, 1fr) auto; } .detail-row strong { font-size: 15px; } }
			`}</style>
		</main>
	);
}

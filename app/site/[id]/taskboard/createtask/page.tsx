"use client";

import { FormEvent, useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";

const CREATE_TASK = gql`
	mutation CreateTask($input: CreateTaskInput!) {
		createTask(input: $input) {
			_id
		}
	}
`;

export default function CreateTaskPage() {
	const params = useParams();
	const router = useRouter();
	const siteId = typeof params.id === "string" ? params.id : params.id?.[0];
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [createTask, { loading }] = useMutation(CREATE_TASK);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmedTitle = title.trim();

		if (!siteId || !trimmedTitle) {
			setErrorMessage("Enter a task title before creating the task.");
			return;
		}

		try {
			setErrorMessage("");
			await createTask({
				variables: {
					input: {
						siteId,
						title: trimmedTitle,
						description: description.trim() || undefined,
						dueDate: dueDate || undefined,
					},
				},
			});
			router.push(`/site/${siteId}/taskboard`);
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "Unable to create task.");
		}
	};

	return (
		<main className="create-task-page">
			<section className="create-task-sheet" aria-labelledby="create-task-title">
				<h1 id="create-task-title">Create New Task</h1>

				<form onSubmit={handleSubmit}>
					<label htmlFor="task-title" className="sr-only">Task title</label>
					<input
						id="task-title"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder="Task Title"
						autoFocus
						required
					/>

					<label htmlFor="task-description" className="sr-only">Task description</label>
					<textarea
						id="task-description"
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						placeholder="Description (Optional)"
						rows={4}
					/>

					<label htmlFor="task-due-date" className="sr-only">Due date</label>
					<input
						id="task-due-date"
						type="date"
						value={dueDate}
						onChange={(event) => setDueDate(event.target.value)}
						aria-label="Due date"
					/>

					{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}

					<div className="form-actions">
						<button type="button" className="cancel-button" onClick={() => router.back()} disabled={loading}>Cancel</button>
						<button type="submit" className="create-button" disabled={loading}>{loading ? "Creating..." : "Create"}</button>
					</div>
				</form>
			</section>

			<style jsx>{`
				.create-task-page { align-items: flex-end; background: #fff; color: #000; display: flex; min-height: calc(100vh - 84px); padding: 0; }
				.create-task-sheet { background: #fff; border-radius: 28px 28px 0 0; box-shadow: 0 -8px 30px rgba(0, 0, 0, .06); padding: 34px 28px 30px; width: 100%; }
				h1 { font-size: 26px; font-weight: 800; letter-spacing: -.03em; margin: 0 0 26px; }
				form { display: grid; gap: 18px; margin: 0 auto; max-width: 680px; }
				input, textarea { background: #fff; border: 1px solid #e3e3e3; border-radius: 12px; color: #000; font: inherit; font-size: 16px; outline: 0; padding: 21px 20px; width: 100%; }
				input { height: 70px; }
				textarea { min-height: 122px; resize: vertical; }
				input::placeholder, textarea::placeholder { color: #aaa; }
				input:focus, textarea:focus { border-color: #000; box-shadow: 0 0 0 3px #eee; }
				.form-error { color: #000; font-size: 13px; margin: -4px 0 0; }
				.form-actions { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; margin-top: 2px; }
				.form-actions button { border: 0; border-radius: 8px; font: inherit; font-size: 18px; font-weight: 700; min-height: 64px; transition: opacity .2s ease; }
				.form-actions button:disabled { cursor: wait; opacity: .55; }
				.cancel-button { background: #d9d9d9; color: #000; }
				.create-button { background: #000; color: #fff; }
				.sr-only { height: 1px; margin: -1px; overflow: hidden; position: absolute; width: 1px; clip: rect(0, 0, 0, 0); }
				@media (min-width: 700px) { .create-task-sheet { padding: 38px max(28px, calc((100vw - 900px) / 2)) 42px; } }
			`}</style>
		</main>
	);
}

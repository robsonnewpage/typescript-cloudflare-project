CREATE TABLE `cron_runs` (
	`job_name` text PRIMARY KEY NOT NULL,
	`last_run_at` text NOT NULL,
	`rows_affected` integer NOT NULL
);

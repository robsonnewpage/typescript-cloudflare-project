CREATE TABLE `facts` (
	`id` text PRIMARY KEY NOT NULL,
	`meeting_id` text NOT NULL,
	`kind` text NOT NULL,
	`statement` text NOT NULL,
	`owner` text,
	`due` text,
	`start_turn_index` integer NOT NULL,
	`end_turn_index` integer NOT NULL,
	`speakers` text NOT NULL,
	`quote` text NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`occurred_at` text NOT NULL,
	`participants` text NOT NULL,
	`transcript_key` text
);
--> statement-breakpoint
CREATE TABLE `threads` (
	`id` text PRIMARY KEY NOT NULL,
	`meeting_id` text NOT NULL,
	`status` text NOT NULL,
	`claimed_by` text,
	`claimed_at` text,
	`resolved_by` text,
	`resolved_at` text,
	`resolution_statement` text,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE no action
);

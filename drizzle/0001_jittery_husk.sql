ALTER TABLE `submissions` ADD `edit_token` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `submissions` ADD `status` text DEFAULT 'completed' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_submissions_created_id` ON `submissions` (`created_at`,`id`);
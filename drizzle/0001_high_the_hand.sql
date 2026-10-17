CREATE TABLE `layer_fields` (
	`id` text PRIMARY KEY NOT NULL,
	`layer_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'text' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`layer_id`) REFERENCES `layers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `layer_fields_layer_id_idx` ON `layer_fields` (`layer_id`);--> statement-breakpoint
CREATE TABLE `spot_field_values` (
	`spot_id` text NOT NULL,
	`field_id` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`spot_id`, `field_id`),
	FOREIGN KEY (`spot_id`) REFERENCES `spots`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`field_id`) REFERENCES `layer_fields`(`id`) ON UPDATE no action ON DELETE cascade
);

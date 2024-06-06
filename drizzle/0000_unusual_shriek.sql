CREATE TABLE `commitments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`player` char(42),
	`agent` char(42),
	`betToken` char(42),
	`tokenId` smallint unsigned,
	`betSize` varchar(256),
	`deadline` datetime,
	`count` bigint unsigned,
	`usedCount` bigint unsigned,
	`commitmentHash` varchar(124),
	CONSTRAINT `commitments_id` PRIMARY KEY(`id`),
	CONSTRAINT `commitments_commitmentHash_unique` UNIQUE(`commitmentHash`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`racesWon` bigint unsigned,
	`racesLost` bigint unsigned,
	`betsLost` varchar(256),
	`betsWon` varchar(256),
	`lastRaceBet` varchar(256),
	`lastRaceResult` boolean,
	`lastRaceId` bigint unsigned,
	`level` smallint unsigned,
	`xp` int unsigned,
	`tokenId` smallint unsigned,
	`masteryTime` datetime(3),
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_tokenId_unique` UNIQUE(`tokenId`)
);
--> statement-breakpoint
CREATE TABLE `races` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`executor` char(42),
	`betToken` char(42),
	`winner` char(42),
	`winningTokenId` smallint unsigned,
	`betSize` varchar(256),
	`raceId` bigint unsigned,
	CONSTRAINT `races_id` PRIMARY KEY(`id`),
	CONSTRAINT `races_raceId_unique` UNIQUE(`raceId`)
);
--> statement-breakpoint
CREATE TABLE `commitments_to_races` (
	`commitment_hash` varchar(124) NOT NULL,
	`race_id` bigint unsigned NOT NULL,
	CONSTRAINT `commitments_to_races_commitment_hash_race_id_pk` PRIMARY KEY(`commitment_hash`,`race_id`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`racesWon` bigint unsigned,
	`racesLost` bigint unsigned,
	`betsLost` varchar(256),
	`betsWon` varchar(256),
	`lastRaceBet` varchar(256),
	`lastRaceResult` boolean,
	`level` smallint unsigned,
	`xp` int unsigned,
	`address` char(42),
	`masteryTime` datetime(3),
	CONSTRAINT `players_id` PRIMARY KEY(`id`),
	CONSTRAINT `players_address_unique` UNIQUE(`address`)
);
--> statement-breakpoint
CREATE INDEX `commitmentHash_idx` ON `commitments` (`commitmentHash`);--> statement-breakpoint
CREATE INDEX `tokenId_idx` ON `agents` (`tokenId`);--> statement-breakpoint
CREATE INDEX `raceId_idx` ON `races` (`raceId`);--> statement-breakpoint
CREATE INDEX `address_idx` ON `players` (`address`);
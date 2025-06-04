-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versi server:                 8.0.11 - MySQL Community Server - GPL
-- OS Server:                    Win64
-- HeidiSQL Versi:               12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- membuang struktur untuk table bk_videos_short
DROP TABLE IF EXISTS `bk_videos_short`;
CREATE TABLE IF NOT EXISTS `bk_videos_short` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `key` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vid` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_idx` (`key`),
  CONSTRAINT `FK_bk_videos_short_tb_videos` FOREIGN KEY (`vid`) REFERENCES `tb_videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_gdrive_auth
DROP TABLE IF EXISTS `tb_gdrive_auth`;
CREATE TABLE IF NOT EXISTS `tb_gdrive_auth` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `api_key` varchar(50) NOT NULL,
  `client_id` varchar(100) NOT NULL,
  `client_secret` varchar(50) NOT NULL,
  `refresh_token` varchar(150) NOT NULL,
  `created` int(11) NOT NULL DEFAULT '0',
  `modified` int(11) NOT NULL DEFAULT '0',
  `uid` int(11) NOT NULL DEFAULT '1',
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `bypass` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_idx` (`email`),
  CONSTRAINT `FK_tb_gdrive_auth_tb_users` FOREIGN KEY (`uid`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_gdrive_duplicate
DROP TABLE IF EXISTS `tb_gdrive_duplicate`;
CREATE TABLE IF NOT EXISTS `tb_gdrive_duplicate` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `gdrive_id` varchar(50) NOT NULL,
  `gdrive_email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` text NOT NULL,
  `desc` text NOT NULL,
  `fileSize` bigint(20) NOT NULL DEFAULT '0',
  `md5Checksum` text NOT NULL,
  `sha1Checksum` text NOT NULL,
  `sha256Checksum` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gdrive_id_idx` (`gdrive_id`),
  CONSTRAINT `FK_tb_gdrive_duplicate_tb_gdrive_auth` FOREIGN KEY (`gdrive_email`) REFERENCES `tb_gdrive_auth` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_gdrive_mirrors
DROP TABLE IF EXISTS `tb_gdrive_mirrors`;
CREATE TABLE IF NOT EXISTS `tb_gdrive_mirrors` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `gdrive_id` varchar(50) NOT NULL,
  `mirror_id` varchar(50) NOT NULL,
  `mirror_email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `added` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `gdrive_id_idx` (`gdrive_id`),
  KEY `mirror_id_idx` (`mirror_id`),
  CONSTRAINT `FK_tb_gdrive_mirrors_tb_gdrive_auth` FOREIGN KEY (`mirror_email`) REFERENCES `tb_gdrive_auth` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_gdrive_queue
DROP TABLE IF EXISTS `tb_gdrive_queue`;
CREATE TABLE IF NOT EXISTS `tb_gdrive_queue` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `gdrive_id` varchar(50) NOT NULL,
  `delayed` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `gdrive_id_idx` (`gdrive_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_loadbalancers
DROP TABLE IF EXISTS `tb_loadbalancers`;
CREATE TABLE IF NOT EXISTS `tb_loadbalancers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `link` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `public` tinyint(1) NOT NULL DEFAULT '0',
  `added` int(11) NOT NULL DEFAULT '0',
  `updated` int(11) NOT NULL DEFAULT '0',
  `disallow_hosts` text NOT NULL,
  `disallow_continent` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `link_idx` (`link`),
  KEY `status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_maxmind
DROP TABLE IF EXISTS `tb_maxmind`;
CREATE TABLE IF NOT EXISTS `tb_maxmind` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ip` varchar(250) NOT NULL,
  `prefix_len` int(11) DEFAULT NULL,
  `asn` int(11) DEFAULT NULL,
  `continent` char(2) NOT NULL,
  `country` char(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip_idx` (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_maxmind_asn
DROP TABLE IF EXISTS `tb_maxmind_asn`;
CREATE TABLE IF NOT EXISTS `tb_maxmind_asn` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_plugins2
DROP TABLE IF EXISTS `tb_plugins2`;
CREATE TABLE IF NOT EXISTS `tb_plugins2` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `key` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vid` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_idx` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_sessions
DROP TABLE IF EXISTS `tb_sessions`;
CREATE TABLE IF NOT EXISTS `tb_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip` varchar(50) NOT NULL,
  `useragent` varchar(250) NOT NULL,
  `created` int(11) NOT NULL DEFAULT '0',
  `username` varchar(50) NOT NULL,
  `expired` int(11) NOT NULL DEFAULT '0',
  `token` varchar(250) NOT NULL,
  `stat` tinyint(1) NOT NULL DEFAULT '9',
  PRIMARY KEY (`id`),
  KEY `sessions_idx` (`ip`,`useragent`,`token`),
  CONSTRAINT `FK_tb_sessions_tb_users` FOREIGN KEY (`username`) REFERENCES `tb_users` (`user`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_settings
DROP TABLE IF EXISTS `tb_settings`;
CREATE TABLE IF NOT EXISTS `tb_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(150) NOT NULL,
  `value` mediumtext NOT NULL,
  `updated` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_idx` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_stats
DROP TABLE IF EXISTS `tb_stats`;
CREATE TABLE IF NOT EXISTS `tb_stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vid` bigint(20) NOT NULL,
  `ip` varchar(50) NOT NULL,
  `ua` int(11) NOT NULL,
  `created` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ip_idx` (`ip`),
  CONSTRAINT `FK_tb_stats_tb_stats_ua` FOREIGN KEY (`ua`) REFERENCES `tb_stats_ua` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_tb_stats_tb_videos` FOREIGN KEY (`vid`) REFERENCES `tb_videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_stats_ua
DROP TABLE IF EXISTS `tb_stats_ua`;
CREATE TABLE IF NOT EXISTS `tb_stats_ua` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ua` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_subtitles
DROP TABLE IF EXISTS `tb_subtitles`;
CREATE TABLE IF NOT EXISTS `tb_subtitles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `language` varchar(50) NOT NULL,
  `link` text NOT NULL,
  `vid` bigint(20) NOT NULL,
  `added` int(11) NOT NULL DEFAULT '0',
  `uid` int(11) NOT NULL,
  `order` tinyint(4) NOT NULL DEFAULT '0',
  `updated` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `link_idx` (`link`(255)),
  CONSTRAINT `FK_tb_subtitles_tb_users` FOREIGN KEY (`uid`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_tb_subtitles_tb_videos` FOREIGN KEY (`vid`) REFERENCES `tb_videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_subtitle_manager
DROP TABLE IF EXISTS `tb_subtitle_manager`;
CREATE TABLE IF NOT EXISTS `tb_subtitle_manager` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL,
  `file_size` int(11) NOT NULL DEFAULT '0',
  `file_type` varchar(25) NOT NULL,
  `language` varchar(50) NOT NULL,
  `added` int(11) NOT NULL DEFAULT '0',
  `uid` int(11) NOT NULL,
  `host` varchar(255) NOT NULL,
  `updated` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_name_idx` (`file_name`),
  KEY `language_idx` (`language`),
  KEY `host_idx` (`host`),
  CONSTRAINT `FK_tb_subtitle_manager_tb_users` FOREIGN KEY (`uid`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_users
DROP TABLE IF EXISTS `tb_users`;
CREATE TABLE IF NOT EXISTS `tb_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(500) NOT NULL,
  `name` varchar(50) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `added` int(11) NOT NULL DEFAULT '0',
  `updated` int(15) NOT NULL DEFAULT '0',
  `role` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user` (`user`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `user_idx` (`user`),
  UNIQUE KEY `email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_videos
DROP TABLE IF EXISTS `tb_videos`;
CREATE TABLE IF NOT EXISTS `tb_videos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(1000) NOT NULL,
  `host` varchar(50) NOT NULL,
  `host_id` varchar(1500) NOT NULL,
  `uid` int(11) NOT NULL,
  `added` int(11) NOT NULL DEFAULT '0',
  `updated` int(11) NOT NULL DEFAULT '0',
  `poster` text NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `views` int(11) NOT NULL DEFAULT '0',
  `dmca` tinyint(1) NOT NULL DEFAULT '0',
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug_idx` (`slug`),
  KEY `videos_idx` (`host`,`host_id`(255),`title`(255),`status`) USING BTREE,
  CONSTRAINT `FK_tb_videos_tb_users` FOREIGN KEY (`uid`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_videos_alternatives
DROP TABLE IF EXISTS `tb_videos_alternatives`;
CREATE TABLE IF NOT EXISTS `tb_videos_alternatives` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `vid` bigint(20) NOT NULL,
  `host` varchar(50) NOT NULL,
  `host_id` varchar(1500) NOT NULL,
  `order` int(5) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `videos_alternatives_idx` (`host`,`host_id`(255)),
  CONSTRAINT `FK_tb_videos_alternatives_tb_videos` FOREIGN KEY (`vid`) REFERENCES `tb_videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_videos_hash
DROP TABLE IF EXISTS `tb_videos_hash`;
CREATE TABLE IF NOT EXISTS `tb_videos_hash` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `host` varchar(50) NOT NULL,
  `host_id` varchar(1500) NOT NULL,
  `gdrive_email` varchar(250) NOT NULL,
  `data` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `videos_hash_idx` (`host`,`host_id`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_videos_short
DROP TABLE IF EXISTS `tb_videos_short`;
CREATE TABLE IF NOT EXISTS `tb_videos_short` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `key` varchar(250) NOT NULL,
  `vid` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_idx` (`key`),
  CONSTRAINT `FK_tb_videos_short_tb_videos` FOREIGN KEY (`vid`) REFERENCES `tb_videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- membuang struktur untuk table tb_videos_sources
DROP TABLE IF EXISTS `tb_videos_sources`;
CREATE TABLE IF NOT EXISTS `tb_videos_sources` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `host` varchar(50) NOT NULL,
  `host_id` varchar(1500) NOT NULL,
  `data` text NOT NULL,
  `dl` tinyint(1) NOT NULL DEFAULT '0',
  `sid` int(11) DEFAULT '0',
  `created` int(11) NOT NULL DEFAULT '0',
  `expired` int(11) NOT NULL DEFAULT '0',
  `ua` text NOT NULL,
  `lang` varchar(100) NOT NULL,
  `ip` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `videos_sources_idx` (`host`,`host_id`(255),`expired`,`ip`,`lang`,`ua`(255)),
  CONSTRAINT `FK_tb_videos_sources_tb_loadbalancers` FOREIGN KEY (`sid`) REFERENCES `tb_loadbalancers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

-- Menghapus tabel sementara dan menciptakan struktur VIEW terakhir
DROP VIEW IF EXISTS `vw_loadbalancers`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_loadbalancers` AS select `l`.`id` AS `id`,`l`.`name` AS `name`,`l`.`link` AS `link`,`l`.`public` AS `public`,`l`.`status` AS `status`,`l`.`added` AS `added`,`l`.`updated` AS `updated`,`l`.`disallow_hosts` AS `disallow_hosts`,`l`.`disallow_continent` AS `disallow_continent`,cast((select `c`.`value` from `tb_settings` `c` where (`c`.`key` = concat('active_connections_',`l`.`id`)) limit 1) as unsigned) AS `connections`,(select count(1) from `tb_videos_sources` `v` where (`l`.`id` = `v`.`sid`)) AS `playbacks` from `tb_loadbalancers` `l`
;

-- Menghapus tabel sementara dan menciptakan struktur VIEW terakhir
DROP VIEW IF EXISTS `vw_stats`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_stats` AS select `s`.`id` AS `id`,`s`.`vid` AS `vid`,`v`.`uid` AS `uid`,`s`.`created` AS `created` from (`tb_stats` `s` join `tb_videos` `v` on((`s`.`vid` = `v`.`id`)))
;

-- Menghapus tabel sementara dan menciptakan struktur VIEW terakhir
DROP VIEW IF EXISTS `vw_stats_ua`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_stats_ua` AS select `a`.`id` AS `id`,`a`.`ua` AS `ua`,(select count(1) from `tb_stats` `b` where (`b`.`ua` = `a`.`id`)) AS `jml` from `tb_stats_ua` `a`
;

-- Menghapus tabel sementara dan menciptakan struktur VIEW terakhir
DROP VIEW IF EXISTS `vw_subtitle_manager`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_subtitle_manager` AS select `s`.`id` AS `id`,`s`.`file_name` AS `file_name`,`s`.`language` AS `language`,`s`.`host` AS `host`,`s`.`added` AS `added`,`s`.`updated` AS `updated`,`u`.`id` AS `uid`,`u`.`name` AS `name` from (`tb_subtitle_manager` `s` join `tb_users` `u` on((`s`.`uid` = `u`.`id`)))
;

-- Menghapus tabel sementara dan menciptakan struktur VIEW terakhir
DROP VIEW IF EXISTS `vw_users`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_users` AS select `u`.`id` AS `id`,`u`.`name` AS `name`,`u`.`user` AS `user`,`u`.`email` AS `email`,`u`.`status` AS `status`,`u`.`added` AS `added`,`u`.`updated` AS `updated`,`u`.`role` AS `role`,(select count(1) from `tb_videos` `v` where (`v`.`uid` = `u`.`id`)) AS `videos` from `tb_users` `u`
;

-- Menghapus tabel sementara dan menciptakan struktur VIEW terakhir
DROP VIEW IF EXISTS `vw_videos`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_videos` AS select `v`.`id` AS `id`,`v`.`title` AS `title`,`v`.`host` AS `host`,`v`.`host_id` AS `host_id`,`v`.`status` AS `status`,`v`.`added` AS `added`,`v`.`updated` AS `updated`,`v`.`dmca` AS `dmca`,`v`.`views` AS `views`,`u`.`name` AS `name`,`v`.`uid` AS `uid`,`v`.`poster` AS `poster`,coalesce(nullif(`v`.`slug`,''),`vs`.`key`,`bvs`.`key`) AS `slug` from (((`tb_videos` `v` join `tb_users` `u` on((`v`.`uid` = `u`.`id`))) left join `tb_videos_short` `vs` on((`vs`.`vid` = `v`.`id`))) left join `bk_videos_short` `bvs` on((`bvs`.`vid` = `v`.`id`)))
;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

-- --------------------------------------------------------
-- Host:                         localhost
-- Versi server:                 10.0.10-MariaDB-log - mariadb.org binary distribution
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

CREATE TABLE IF NOT EXISTS `bk_videos_short` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `key` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vid` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_idx` (`key`),
  CONSTRAINT `FK_bk_videos_short_tb_videos` FOREIGN KEY (`vid`) REFERENCES `tb_videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengeluaran data tidak dipilih.

CREATE TABLE IF NOT EXISTS `tb_videos_short` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `key` varchar(250) NOT NULL,
  `vid` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_idx` (`key`),
  CONSTRAINT `FK_tb_videos_short_tb_videos` FOREIGN KEY (`vid`) REFERENCES `tb_videos` (`id`) ON DELETE CASCADE
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

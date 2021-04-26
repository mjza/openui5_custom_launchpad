-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 17, 2020 at 03:38 PM
-- Server version: 10.4.6-MariaDB
-- PHP Version: 7.3.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `launchpad`
--

-- --------------------------------------------------------

--
-- Table structure for table `actions`
--

CREATE TABLE `actions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `actions`
--

INSERT INTO `actions` (`id`, `name`) VALUES
('AT1', 'Show'),
('AT2', 'Hide');

-- --------------------------------------------------------

--
-- Table structure for table `answers`
--

CREATE TABLE `answers` (
  `id` int(11) NOT NULL,
  `answer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `option_id` int(11) DEFAULT NULL,
  `question_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `answers`
--

INSERT INTO `answers` (`id`, `answer`, `user_id`, `option_id`, `question_id`) VALUES
(1, '1', 1, NULL, 1),
(2, '4', 1, NULL, 2),
(3, '', 1, 1, 3),
(4, 'It would be nicer to have more fun environment in the office.', 1, NULL, 4),
(5, 'Having more friendly events inside or outside the office to get more close to other colleagues.', 1, NULL, 4),
(6, '', 1, 17, 18),
(7, '', 1, 21, 19),
(8, '', 1, 8, 9),
(9, '', 1, 11, 10),
(10, 'The location is really nice, especially the station.', 1, NULL, 7),
(11, 'There are a lot of nice restaurants, which are affordable and very good', 1, NULL, 8),
(12, '16 hours', 1, NULL, 11),
(13, 'I would like to reduce my traveling this year since we have a new born baby.', 1, NULL, 12),
(14, '', 1, 14, 13),
(15, '', 1, 2, 3),
(16, '', 1, 4, 3),
(17, '', 1, 3, 3),
(18, '', 1, NULL, 14),
(19, '1', 1, NULL, 15),
(20, '4', 1, NULL, 16),
(21, '1', 3, NULL, 1),
(22, '5', 3, NULL, 2),
(23, '', 3, 5, 3),
(24, '', 3, 19, 18),
(25, '', 3, 22, 19),
(26, '', 3, 14, 13),
(27, '1', 3, NULL, 15),
(28, '5', 3, NULL, 16),
(29, '0', 4, NULL, 1),
(30, '3', 4, NULL, 2),
(31, '', 4, 3, 3),
(32, 'I prefer our company provides us with more seminars and lectures based on our tasks.', 4, NULL, 4),
(33, 'The location is nice.', 4, NULL, 7),
(34, 'It is close to train station. The accessibility to other places is good.', 4, NULL, 8),
(35, '', 4, 17, 18),
(36, '', 4, 20, 19),
(37, '1', 5, NULL, 1),
(38, '4', 5, NULL, 2),
(39, '', 5, 4, 3),
(40, 'If it was more close to city area, would be better.', 5, NULL, 7),
(41, '', 5, 18, 18),
(42, '', 5, 22, 19),
(43, '4', 5, NULL, 5),
(44, '1', 5, NULL, 6),
(45, 'Our manager always ask us about our worries that we have not only in the office but also outside.', 5, NULL, 20),
(46, '', 5, 13, 13),
(47, '', 5, NULL, 14),
(48, '1', 5, NULL, 15),
(49, '4', 5, NULL, 16),
(50, '', 6, 6, 9),
(51, '', 6, 12, 10),
(52, '6 hours', 6, NULL, 11),
(53, 'If company provides more budget for traveling is better.', 6, NULL, 12),
(54, '0', 7, NULL, 1),
(55, '3', 7, NULL, 2),
(56, '', 7, 2, 3),
(57, 'Not really satisfaction.', 7, NULL, 7),
(58, 'There are not enough choices for eating.', 7, NULL, 8),
(59, '', 7, 17, 18),
(60, '', 7, 20, 19),
(61, '', 7, 10, 9),
(62, '', 7, 12, 10),
(63, 'No traveling', 7, NULL, 11),
(64, '1', 8, NULL, 1),
(65, '3', 8, NULL, 2),
(66, '', 8, 2, 3),
(67, 'Increasing the salary in the coming year would be nice.', 8, NULL, 4),
(68, 'Great', 8, NULL, 7),
(69, 'Close to train station and cafes.', 8, NULL, 8),
(70, '', 8, 15, 18),
(71, '', 8, 21, 19),
(72, '1', 9, NULL, 1),
(73, '5', 9, NULL, 2),
(74, '', 9, 5, 3),
(75, 'Better to have more meetings and discuss about our problems in the office.', 9, NULL, 4),
(76, 'I like the location of our company.', 9, NULL, 7),
(77, '', 9, 18, 18),
(78, '', 9, 22, 19),
(79, '4', 9, NULL, 5),
(80, '1', 9, NULL, 6),
(81, '', 9, 14, 13),
(82, '', 9, NULL, 14),
(83, '1', 9, NULL, 15),
(84, '3', 9, NULL, 16),
(85, 'I need bigger size of screen for my work. boost the memory capabilities of my computer hardware to improve the performance.', 9, NULL, 17),
(86, '1', 10, NULL, 1),
(87, '3', 10, NULL, 2),
(88, '', 10, 2, 3),
(89, 'There should be workshops for employees to learn more and be more productive.', 10, NULL, 4),
(90, 'Nice location', 10, NULL, 7),
(91, 'You can have access to station, restaurants, and super markets easily.', 10, NULL, 8),
(92, '', 10, 19, 18),
(93, '', 10, 21, 19),
(94, '', 1, 43, 28),
(95, '', 1, 48, 29),
(96, '1', 1, NULL, 30),
(97, '', 1, 55, 31),
(98, '5', 1, NULL, 32),
(99, '', 1, 60, 33),
(100, '', 4, 44, 28),
(101, '', 4, 49, 29),
(102, '1', 4, NULL, 30),
(103, '', 4, 56, 31),
(104, '4', 4, NULL, 32),
(105, '', 4, 61, 33),
(106, '', 5, 46, 28),
(107, '', 5, 50, 29),
(108, '1', 5, NULL, 30),
(109, '', 5, 57, 31),
(110, '2', 5, NULL, 32),
(111, '', 5, 64, 33),
(112, '', 8, 46, 28),
(113, '', 8, 52, 29),
(114, '0', 8, NULL, 30),
(115, '', 8, NULL, 31),
(116, '2', 8, NULL, 32),
(117, '', 8, 64, 33),
(118, '', 9, 47, 28),
(119, '', 9, 54, 29),
(120, '0', 9, NULL, 30),
(121, '', 9, NULL, 31),
(122, '1', 9, NULL, 32),
(123, '', 9, 65, 33),
(124, 'very, very nice', 3, NULL, 14);

-- --------------------------------------------------------

--
-- Table structure for table `conditions`
--

CREATE TABLE `conditions` (
  `id` int(255) NOT NULL,
  `operand1` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `operand2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `question_source_id` int(11) NOT NULL,
  `question_target_id` int(11) NOT NULL,
  `operator_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conditions`
--

INSERT INTO `conditions` (`id`, `operand1`, `operand2`, `deleted`, `question_source_id`, `question_target_id`, `operator_id`, `action_id`) VALUES
(1, '1', '', 0, 6, 5, 'EQ', 'AT1'),
(2, '7', '', 0, 43, 44, 'GT', 'AT1');

-- --------------------------------------------------------

--
-- Table structure for table `forms`
--

CREATE TABLE `forms` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valid_from` datetime NOT NULL,
  `valid_to` datetime NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `icon_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `forms`
--

INSERT INTO `forms` (`id`, `name`, `valid_from`, `valid_to`, `deleted`, `icon_id`) VALUES
(1, 'Yearly Interview Satisfaction', '2020-01-15 09:00:00', '2020-12-31 21:00:00', 0, 'IC5'),
(2, 'Direct Manger Satsfaction', '2020-01-15 09:00:00', '2020-12-31 21:00:00', 0, 'IC6'),
(3, 'Traveling sheet', '2020-01-15 09:00:00', '2020-12-31 21:00:00', 0, 'IC15'),
(4, 'Equipment sheet', '2020-01-15 09:00:00', '2020-12-31 21:00:00', 0, 'IC9'),
(5, 'HR Company and Supervisor Evaluation Survey', '2020-01-15 09:00:00', '9999-12-31 21:00:00', 0, 'IC7'),
(6, 'Employee Benefits Survey', '2017-01-15 09:00:00', '2017-12-31 21:00:00', 0, 'IC31'),
(8, 'Fiori Webinar', '2020-01-15 09:00:00', '2020-12-31 21:00:00', 0, 'IC5');

-- --------------------------------------------------------

--
-- Table structure for table `icons`
--

CREATE TABLE `icons` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `icons`
--

INSERT INTO `icons` (`id`, `name`, `source`) VALUES
('IC1', 'building', 'sap-icon://building'),
('IC10', 'travel', 'sap-icon://home-share'),
('IC11', 'area-chart', 'sap-icon://area-chart'),
('IC12', 'choropleth-chart', 'sap-icon://choropleth-chart'),
('IC13', 'database', 'sap-icon://database'),
('IC14', 'geographic-bubble-chart', 'sap-icon://geographic-bubble-chart'),
('IC15', 'trip-report', 'sap-icon://trip-report'),
('IC16', 'legend', 'sap-icon://legend'),
('IC17', 'customer', 'sap-icon://customer'),
('IC18', 'lead-outdated', 'sap-icon://lead-outdated'),
('IC19', 'question-mark', 'sap-icon://question-mark'),
('IC2', 'business-card', 'sap-icon://business-card'),
('IC20', 'cart-3', 'sap-icon://cart-3'),
('IC21', 'crm-service-manager', 'sap-icon://crm-service-manager'),
('IC22', 'fob-watch', 'sap-icon://fob-watch'),
('IC23', 'horizontal-grip', 'sap-icon://horizontal-grip'),
('IC24', 'functional-location', 'sap-icon://functional-location'),
('IC25', 'collaborate', 'sap-icon://collaborate'),
('IC26', 'check-availability', 'sap-icon://check-availability'),
('IC27', 'company-view', 'sap-icon://company-view'),
('IC28', 'competitor', 'sap-icon://competitor'),
('IC29', 'customer-and-supplier', 'sap-icon://customer-and-supplier'),
('IC3', 'fax-machine', 'sap-icon://fax-machine'),
('IC30', 'detail-view', 'sap-icon://detail-view'),
('IC31', 'employee-lookup', 'sap-icon://employee-lookup'),
('IC32', 'factory', 'sap-icon://factory'),
('IC33', 'private', 'sap-icon://private'),
('IC34', 'shipping-status', 'sap-icon://shipping-status'),
('IC35', 'soccer', 'sap-icon://soccer'),
('IC36', 'supplier', 'sap-icon://supplier'),
('IC37', 'target-group', 'sap-icon://target-group'),
('IC38', 'thumb-up', 'sap-icon://thumb-up'),
('IC39', 'customer-financial-fact-sheet', 'sap-icon://customer-financial-fact-sheet'),
('IC4', 'bar-chart', 'sap-icon://bar-chart'),
('IC40', 'insurance-life', 'sap-icon://insurance-life'),
('IC41', 'education', 'sap-icon://education'),
('IC42', 'batch-payments', 'sap-icon://batch-payments'),
('IC43', 'bus-public-transport', 'sap-icon://bus-public-transport'),
('IC44', 'physical-activity', 'sap-icon://physical-activity'),
('IC45', 'role', 'sap-icon://role'),
('IC46', 'travel-itinerary', 'sap-icon://travel-itinerary'),
('IC47', 'monitor-payments', 'sap-icon://monitor-payments'),
('IC48', 'meal', 'sap-icon://meal'),
('IC49', 'lab', 'sap-icon://lab'),
('IC5', 'yearly and monthly interview', 'sap-icon://appointment-2'),
('IC50', 'fridge', 'sap-icon://fridge'),
('IC6', 'manager', 'sap-icon://manager'),
('IC7', 'human resource', 'sap-icon://hr-approval'),
('IC8', 'employee', 'sap-icon://employee'),
('IC9', 'wrench', 'sap-icon://wrench');

-- --------------------------------------------------------

--
-- Table structure for table `operators`
--

CREATE TABLE `operators` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ui5_operator` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `operators`
--

INSERT INTO `operators` (`id`, `name`, `ui5_operator`) VALUES
('EQ', 'Equals', 'sap.ui.model.FilterOperator.EQ'),
('GT', 'Greater than', 'sap.ui.model.FilterOperator.GT');

-- --------------------------------------------------------

--
-- Table structure for table `options`
--

CREATE TABLE `options` (
  `id` int(11) NOT NULL,
  `answer` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sequence` int(11) NOT NULL DEFAULT 255,
  `value` int(11) NOT NULL DEFAULT 1,
  `default_answer` tinyint(1) NOT NULL DEFAULT 0,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `question_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `options`
--

INSERT INTO `options` (`id`, `answer`, `sequence`, `value`, `default_answer`, `deleted`, `question_id`) VALUES
(1, 'Lazy', 1, 1, 0, 0, 3),
(2, 'Hardworking', 2, 3, 0, 0, 3),
(3, 'Hating', 3, 5, 0, 0, 3),
(4, 'Lovely', 4, 7, 0, 0, 3),
(5, 'No idea!', 5, 9, 1, 0, 3),
(6, 'Car', 1, 9, 0, 0, 9),
(7, 'Train', 2, 9, 0, 0, 9),
(8, 'Bike', 3, 9, 0, 0, 9),
(9, 'Walking', 4, 9, 0, 0, 9),
(10, 'Very often', 1, 9, 0, 0, 10),
(11, 'Not that much', 2, 9, 1, 0, 10),
(12, 'Mac device', 1, 9, 0, 0, 13),
(13, 'Windows device', 2, 9, 0, 0, 13),
(14, 'Not at all motivated', 1, 1, 0, 0, 18),
(15, 'Not sure', 2, 3, 0, 0, 18),
(16, 'Not very motivated', 3, 4, 0, 0, 18),
(17, 'Somewhat motivated', 4, 5, 0, 0, 18),
(18, 'Very motivated', 5, 7, 0, 0, 18),
(19, 'Too many', 1, 1, 0, 0, 19),
(20, 'Enough', 2, 3, 0, 0, 19),
(21, 'Not enough', 3, 5, 0, 0, 19),
(22, 'Less than a year', 1, 1, 0, 0, 21),
(23, '1-2 years', 2, 3, 0, 0, 21),
(24, '3-5 years', 3, 5, 0, 0, 21),
(25, '6-10 years', 4, 7, 0, 0, 21),
(26, 'More than 10 years', 5, 9, 0, 0, 21),
(27, 'Non-supervisory Staff', 1, 1, 0, 0, 22),
(28, 'Supervisor', 2, 3, 0, 0, 22),
(29, 'Functional Manager', 3, 5, 0, 0, 22),
(30, 'Department Manager', 4, 7, 0, 0, 22),
(31, 'Senior Management/Director/Vice President', 5, 9, 0, 0, 22),
(32, 'My supervisor is knowledgeable about my work', 1, 8, 0, 0, 25),
(33, 'My supervisor gives me fair reviews', 2, 8, 0, 0, 25),
(34, 'My supervisor is willing to promote me', 3, 8, 0, 0, 25),
(35, 'My supervisor trains me in whenever necessary', 4, 8, 0, 0, 25),
(36, 'My supervisor makes sure I have sufficient training', 5, 8, 0, 0, 25),
(37, 'Extremely Dissatisfied', 1, 1, 0, 0, 27),
(38, 'Very Dissatisfied', 2, 3, 0, 0, 27),
(39, 'Neither Satisfied nor Dissatisfied', 3, 5, 0, 0, 27),
(40, 'Very Satisfied', 4, 7, 0, 0, 27),
(41, 'Extremely Satisfied', 5, 9, 0, 0, 27),
(42, 'Extremely Comfortable', 1, 1, 0, 0, 28),
(43, 'Very Comfortable', 2, 3, 0, 0, 28),
(44, 'Somewhat Comfortable', -1, 5, 0, 1, 28),
(45, 'Not So Comfortable', 3, 7, 0, 0, 28),
(46, 'Not At All Comfortable', -1, 9, 0, 1, 28),
(47, 'Extremely Satisfied', 1, 1, 0, 0, 29),
(48, 'Quite Satisfied', 2, 3, 0, 0, 29),
(49, 'Somewhat Satisfied', 3, 5, 0, 0, 29),
(50, 'Neither Satisfied Nor Dissatisfied', 4, 7, 0, 0, 29),
(51, 'Somewhat Dissatisfied', 5, 9, 0, 0, 29),
(52, 'Quite Dissatisfied', 6, 11, 0, 0, 29),
(53, 'Extremely Dissatisfied', 7, 13, 0, 0, 29),
(54, 'Much Better', 1, 1, 0, 0, 31),
(55, 'Better', 2, 3, 0, 0, 31),
(56, 'The Same', 3, 5, 0, 0, 31),
(57, 'Worse', 4, 7, 0, 0, 31),
(58, 'Much Worse', 5, 9, 0, 0, 31),
(59, 'Extremely Satisfied', 1, 1, 0, 0, 33),
(60, 'Quite Satisfied', 2, 3, 0, 0, 33),
(61, 'Somewhat Satisfied', 3, 5, 0, 0, 33),
(62, 'Neither Satisfied Nor Dissatisfied', -1, 7, 0, 1, 33),
(63, 'Somewhat Dissatisfied', -1, 9, 0, 1, 33),
(64, 'Quite Dissatisfied', 4, 11, 0, 0, 33),
(65, 'Extremely Dissatisfied', 5, 13, 0, 0, 33),
(66, 'Umsetzung / Tutorials', 1, 1, 0, 0, 39),
(67, 'Projektbeispiele', 2, 3, 0, 0, 39),
(68, 'Vorgehensweise / Methodik', 3, 5, 0, 0, 39),
(69, 'Kosten-Nutzen-Überblick', 4, 7, 0, 0, 39),
(70, 'SAP S/4 HANA bzw. SAP ERP', 1, 1, 0, 0, 43),
(71, 'SAP CAR', 2, 3, 0, 0, 43),
(72, 'SAP PO/PI', 3, 5, 0, 0, 43),
(73, 'SAP Solution Manager', 4, 7, 0, 0, 43),
(74, 'SAP CPI', 5, 9, 0, 0, 43),
(75, 'SAP Data Hub', 6, 11, 0, 0, 43),
(76, 'SAP Data Intelligence', 7, 13, 0, 0, 43),
(77, 'SAP Cloud DWH', 8, 15, 0, 0, 43),
(78, 'SAP BI', 9, 19, 0, 0, 43),
(79, 'SAP IBP', 10, 21, 0, 0, 43),
(80, 'SAP Cloud Platform', 11, 23, 0, 0, 43),
(81, 'SAP MDG', 12, 25, 0, 0, 43),
(82, 'SAP Leonardo (IoT, AI, Blockchain...)', 13, 27, 0, 0, 43);

-- --------------------------------------------------------

--
-- Table structure for table `qtypes`
--

CREATE TABLE `qtypes` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ui5_class` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `qtypes`
--

INSERT INTO `qtypes` (`id`, `name`, `ui5_class`) VALUES
('QT1', '5Star', 'sap.m.RatingIndicator'),
('QT2', 'Yes/No', 'sap.m.Switch'),
('QT3', 'Single Select', 'sap.m.RadioButton'),
('QT4', 'Multiple Choice', 'sap.m.CheckBox'),
('QT5', 'Simple Short Question', 'sap.m.Input'),
('QT6', 'Simple Long Question', 'sap.m.TextArea'),
('QT7', 'Drop-down List', 'sap.m.Select');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `sequence` int(11) NOT NULL DEFAULT 255,
  `question` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mandatory` tinyint(1) NOT NULL DEFAULT 0,
  `random_weight` double NOT NULL DEFAULT 1,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `qtype_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `form_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `sequence`, `question`, `mandatory`, `random_weight`, `deleted`, `qtype_id`, `form_id`) VALUES
(1, 1, 'Are you satisfied from your salary?', 1, 1, 0, 'QT2', 1),
(2, 2, 'How do you suggest this company to others?', 0, 0.8, 0, 'QT1', 1),
(3, 3, 'What best describes your colleagues?', 0, 1, 0, 'QT4', 1),
(4, 4, 'Any other sharing comment', 0, 1, 0, 'QT6', 1),
(5, 1, 'How do you like working with him or her?', 0, 1, 0, 'QT1', 2),
(6, 2, 'Do you like your manager?', 1, 1, 0, 'QT2', 2),
(7, 5, 'What do you think about the office location?', 1, 1, 1, 'QT5', 1),
(8, 6, 'What do you think about the restaurants nearby?', 1, 1, 0, 'QT6', 1),
(9, 1, 'Which transportation do you use to come to the office?', 1, 1, 0, 'QT4', 3),
(10, 2, 'How  often are you on business trips?', 1, 1, 0, 'QT4', 3),
(11, 3, 'How many hours are you on traveling usually per month?', 1, 1, 0, 'QT5', 3),
(12, 4, 'Any other sharing comment', 1, 1, 1, 'QT6', 3),
(13, 1, 'Do you use a Mac or Windows device?', 1, 1, 0, 'QT3', 4),
(14, 3, 'Describe your hardware', 1, 1, 0, 'QT6', 4),
(15, 2, 'Are you satisfied with your hardware?', 1, 1, 0, 'QT2', 4),
(16, 5, 'Rate your hardware', 1, 1, 1, 'QT1', 4),
(17, 4, 'Any other sharing comment', 1, 1, 0, 'QT6', 4),
(18, 7, 'How motivated are you to see the company succeed?', 1, 1, 1, 'QT3', 1),
(19, 8, 'Which of the following describes the variety of tasks required by your position?', 1, 1, 1, 'QT3', 1),
(20, 3, 'What are the things you like about your manager’s leadership style?', 0, 1, 0, 'QT6', 2),
(21, 1, 'How long have you been working for the company?', 1, 1, 1, 'QT4', 5),
(22, 2, 'What is your job function?', 1, 0.7, 1, 'QT4', 5),
(23, 3, 'If you have ever offered suggestions to management, how satisfied were you with the response?', 1, 1, 0, 'QT1', 5),
(24, 4, 'Do you believe your manager lives by your company\'s ethics?', 1, 1, 0, 'QT2', 5),
(25, 5, 'Which of the following statements apply to your immediate boss/superior?', 1, 1, 1, 'QT4', 5),
(26, 6, 'What suggestions do you have for your boss/supervisor that would help him/her be a more effective manager?', 0, 1, 0, 'QT6', 5),
(27, 7, 'Overall, how satisfied are you with the company you work for?', 1, 1, 0, 'QT3', 5),
(28, 1, 'How comfortable is your employer\'s work environment?', 1, 1, 0, 'QT3', 6),
(29, 2, 'Are you satisfied with your options for getting to and from work?', 1, 1, 0, 'QT3', 6),
(30, 3, 'Does your employer provide you with the health insurance?', 1, 1, 0, 'QT2', 6),
(31, 4, 'Is your employer\'s health insurance plan better or worse than those of other employers?', 1, 1, 0, 'QT7', 6),
(32, 5, 'How are you satisfied with your employer\'s sick day policy?', 1, 1, 1, 'QT1', 6),
(33, 6, 'In general, are you satisfied with your employee benefits?', 1, 1, 1, 'QT3', 6),
(34, 1, 'Wie bewerten Sie den Inhalt des Webinars?', 1, 1, 0, 'QT1', 8),
(35, 1, 'Wie bewerten Sie die technische Umsetzung des Webinars?', 1, 1, 0, 'QT1', 8),
(36, 1, 'Wie bewerten Sie Präsentation der Inhalte?', 1, 1, 0, 'QT1', 8),
(37, 1, 'Würden Sie erneut an einem cimt-Webinar teilnehmen?', 1, 1, 0, 'QT2', 8),
(38, 1, 'Würden Sie die Teilnahme an einem cimt-Webinar weiterempfehlen?', 1, 1, 0, 'QT2', 8),
(39, 1, 'Welche Inhalte würden Sie im Themenbereich SAPUI5 / SAP Fiori gerne präsentiert bekommen?', 0, 1, 0, 'QT4', 8),
(40, 1, 'Haben Sie bereits eigene Anwendungen mit SAPUI5 / SAP  Fiori in Ihrem Unternehmen entwickelt?', 1, 1, 0, 'QT2', 8),
(41, 1, 'Planen Sie in Zukunft Anwendungen mit SAPUI5 / SAP Fiori zu entwickeln?', 1, 1, 0, 'QT2', 8),
(42, 1, 'Planen Sie in nächster Zeit Projekte, bei denen Sie Unterstützung benötigen?', 1, 1, 0, 'QT2', 8),
(43, 1, 'Welche Themen zu SAP Produkten und Technologien würden Sie sonst noch interessieren?', 0, 1, 0, 'QT4', 8),
(44, 1, 'Welches Feedback haben Sie sonst für uns?', 0, 1, 0, 'QT6', 8),
(45, 1, 'Ihre E-Mail-Adresse:', 0, 1, 0, 'QT5', 8),
(46, 1, 'Ihr Name:', 0, 1, 0, 'QT5', 8);

-- --------------------------------------------------------

--
-- Table structure for table `surveys`
--

CREATE TABLE `surveys` (
  `id` int(11) NOT NULL,
  `done_at` datetime DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `form_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `surveys`
--

INSERT INTO `surveys` (`id`, `done_at`, `user_id`, `form_id`) VALUES
(1, NULL, 1, 8),
(3, '2020-01-20 20:00:00', 3, 1),
(4, '2020-02-20 11:00:00', 3, 2),
(7, '2020-12-18 16:00:00', 3, 4),
(8, '2020-10-05 10:40:00', 3, 1),
(9, '2020-01-22 13:00:00', 4, 1),
(10, '2020-06-11 16:00:00', 5, 1),
(11, '2020-08-21 18:00:00', 5, 2),
(12, '2020-06-20 12:20:00', 5, 4),
(13, '2020-04-14 14:00:00', 7, 3),
(14, '2020-04-20 11:00:00', 8, 1),
(15, '2020-03-15 16:00:00', 8, 3),
(16, '2020-05-25 15:00:00', 9, 1),
(17, '2020-07-02 21:00:00', 10, 1),
(18, '2020-07-23 13:00:00', 10, 2),
(19, '2020-08-04 18:00:00', 10, 4),
(20, '2020-09-20 21:00:00', 11, 1),
(22, NULL, 3, 5),
(23, NULL, 4, 5),
(24, NULL, 5, 5),
(25, NULL, 6, 5),
(26, NULL, 7, 5),
(27, NULL, 8, 5),
(28, NULL, 9, 5),
(29, NULL, 10, 5),
(30, NULL, 11, 5),
(32, NULL, 3, 6),
(33, NULL, 4, 6),
(34, '2017-10-02 12:24:00', 5, 6),
(35, '2017-03-22 15:00:00', 6, 6),
(36, NULL, 7, 6),
(37, NULL, 8, 6),
(38, '2017-06-06 18:20:00', 9, 6),
(39, '2017-11-15 09:30:00', 10, 6),
(40, NULL, 11, 6);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(255) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `photo_content` mediumtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `photo_content`, `username`, `password`) VALUES
(1, 'Guest', NULL, 'guest', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(3, 'Natasha Manili', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAopElEQVR42u2deXxU5b3/33NmyWQhhAQSSIIxAwIiKKCCUqgUURGdunSzYqttbW9v7/XW3uu1tW6tSzftta297e8Wf+7WrVXrWGy9Vm21WBFRQVYhkJhAyELWmcx+7h/nAFkns8+cme/79eIFLzKZ85zPeb6f86zfx3TetRciGJdwpauwqITpwAlAJVCh/zny7ylAGWAHSoACwAYUDvuqAcAP+IB+wAt0A+1AJ9AFtOr/bgMaPf3sVdqcA/IUjItFJDBMkM8B5gLzgOOB44CZeqAng8JBphDVdxaVACWuNmAP0ATsBz4Atnv62SnmIAYgxIjd4ZoALAQWA6cCJwOzsvhZVep/lg4zhyAlrj3Ae8A7wEbgXW+Ds0+ecvZgki5AhpnqqrIXcRawHFiG9obPVWMOorUQ3gBe93r4K63OQ1IJxADyBr05vxJYBZyL1qzPZ7YDLwEve/p5RboNYgA5h1LtqrXZcQIXAp9g5ACcoDEAvAq84PfiCh9wNoskYgCGxFzrqrPa+AxwCXAmYBJVYkIF3gSeDfh5OtTsbBRJxACyPegnWW1cBlwhQZ8SM3g04OeJULOzSyQRA8iWoDdZbXwC+CpwKdocu5A6/MAzwLqAn1dDzU5VJBEDSD/a6P2XgKuBGSJIRtgL3Of18IDMJogBpAW7w7UQ+A/gc8g6imwhCDwJ/NTb4HxX5BADSCp6M38NcB2wQhTJal4D7g74WS/dg/GRN1gElBqX1VbAFXrgz0UbjBKym7OAFVYb260O191+H4+GW5wBkWV0pAUwduBfBXwXbd29YFz2Az/w+3hQjEAMICJ6U/9y4PvIwF6usRe4NeDnt9I1OIYiEmjYHa7VVhtbgEcl+HOSGcCjVhtb7A7XapFDI+/HAOwO1yzgHmCNVIe8YB7wot3hWg98y9vg3J3PYuRtC8Bc65pkd7juBrZK8Ocla4CtdofrbnOta1K+ipB3YwB6P/9q4A6Sl0xDMDZtwE0BP/fl2/hAXrUA7A7XLKuNV4DfSPALg6gEfmO18YreJRQDyCVsdS6z3eG6ES07zQqp78IYrADesztcN9rqXGYxgBzA7nAtVMy8h9bkl334wngUAncoZt6zO1yniwEYFP2tfxtaLrp5Uq+FGJkHbLA7XLflcmsgJw3A7nDNUsz8A7gZmeoU4scC3KyY+Ueujg3knAHYHa4vAJuB06T+CkniNGCz3eH6Uq7dWM68HfV02r8G1kp9FVJAMXC/3eE6G/jnXElvnhMtAL15tlGCX0gDa4GNudIlMLwB2B2uz6I1+edI3RTSxBy0LsFnjX4jhu0C2OpcZsXMHcC3keSbQvopBp6wO1wLwyFu8jc6Q0a8CUO2AOwO1wTFzPPAdyT4hQxiAr6jmHleH4MSA0g15lpXHbAB2cAjZA9rgA163RQDSBV2h+t0q00W9ghZyUlWGxuNtnrQMAagJ3F4FdnEI2QnJr1uvmqkhCOGMAB9cY8LbeBFELKZYsCl11kxgCQE/zXAQ8iSXsE4WICH9LorBpBA8N8I/AIZ6ReMhwn4hV6HxQDiCP7b0LbwCoKRuUOvy2IAMQT/D9F28glCLnCzXqfFAKII/tvQFvgIQi7xnWxsCWSVAdgdrluQN7+Qu9ys13ExgFGC/xq0E3kEIZf5fjbNDmSFAdgdrrXAz6VuCHnCz/U6Lwagr5q6H5nqE/IHE1pykYvy2gD0ddO/A2xSJ4Q8wwY8lum9AxkzAKXaVQu8gCzvFfKXYuAFPRbyxwDsDtcEm50XkY09glBps/NipvIJpN0AzLUuE/AIsqVXEI4wD3gkE+cPpN0ArDa+D2R88EMQsoyLFDO3pvuiaT0d2O5wXYC2rVdG/JOIGgri7WjA29GAv+cAvo59hHx9+HtbUYN+wn73sQeuWFDsEzDbijDbSzEXTMBaWoWlaBK2smqsE6qwllZhLa5ISVkD7k48LVvob9zEQOsOqlddR9G0ufIQ9UcJOL0Nzj+m64Jp22Krp1F+TII/Obibt9DftAlPyxa8bR+ihoPR1bBwkJCni5CnC2gZ83MmxaIZQ/FkrBOmYCmuwDaxGktJBRb7RMz2EswFE1CshZjMx6pRyKulyw96ugh6uvH3HDhqSgPtH+rXPcbhd58RAxgkO9rMwGJvg3N3zhhAuNJVCPwemCjPOH76Gt+md/dr9DW8OeStngrUcBB/dwv+7pYU39NG1KAfk0VmgnUmAr8PV7oWK23OgZwwgKIS1iGDfnERcHdy+P0/0L3jpRFvz1xADfoYaN8jrYChzCsqYZ23jSsMbwD6eWpyYk+MDBzaTec7T9Hf8AZhVc3pe/UdbhIDGMlau8P1F2+D8wHDGoDe779XnmVsgd/+1iP0N27Mm3sOBwby5l5j5F67w/X3VI4HpMwAlBqXFW3QT1b6RYG/5wDtGx+jZ+fLeXfvYb9HKsDoFAOPKTWupeEWZ8BQBmAr4GbkiO5xUYN+OjY/Tcfbv416JD/XUGxFUhHG5jRbATd7ISV5BFKyEEjf4HCDPLvIuJu3sPfxr9P+1sN5G/wAlqIyqQyRuSFVm4aSbgB60/9+JI33mKhBPwdf+yWNz/5nyqfZjIBSUCKVIjIW4EE9trLbAPSmv0z5jYGvcz97H/86XVtdIsaROlMyRUQYn7l6bGWvAdgdrnlI039Murb9iYan/k3e+oMwKRZsZbUiRHTcoMdY9hmAvsvvf5Cm/wjUUJCDr/2Sg6/cgxr0iSCDsFeeMGQpsRARC/A/eqxllwFYbVwNLJVnNJSQt4/GP3xXmvyjVT6TidITzhIhYmOpHmvZYwDmWtck5BSfEQTcnex/9no8Le+LGKMQVlUm1C8RIWLnDj3mssMArDZuQbL7DMF3uIn9T30TX0eDiDFW5TOZaHr+Jvw9B0SM2KjUYy7zBqAv9/1XeSbDgv/Z6wn0t4sYEQirKv7uFhqe+Ff6Gt8WQWLjX/XYy6wBAPcgA38jgj8Xd+6lzAj8bj56/ibaNz4mYkSPRY+9zBmAntN/jTwLjYC7k6Y/fFeCP07a33qYpudvJpTiXAc5xBo9BtNvAPpUxF3yDDRC3j4an/lPafYnSH/jRvb//joC7k4RIzruSmRaMG4DsNq4AlnxB2jz/E2um2WBT5LwdTTQ8MS/4OvcL2KMzzw9FtNnAPqaZDnIU+fAK/cw0LpDhEgiIU8X+37373gObhcxxuf78e4TiMsAbAVcBdSL7try3nzcw58Own43jc99B3fzFhEjMvV6TKbeAPTDC2S9P9qIf+vffiVCpBA16KPJdZOYwPjcEM/BIjEbgGLmi8jbHzUUpPnPP5S1/Wk0AekORKRej83UGYA+2nidaA2Ht7pklV+6TeD5m2RgMDLXxTojEJMBWG2cB+R9+taAu5O2Nx/IdxnSTtjvpun5m2SKcGzm6jGaGgMAvi0aQ8fbj0vTP0ME+ttpev4m1KBfxEhCjEZtAHaHayGwIt/V9fccoHvbi1LNMoivo4EDr/5chBidFXqsJtcAgP8QbaF942N5ncAzW+jZ+TJd2/4kQiQYq9EZwFRXFfC5fFc14O6kd/drUr2yhNa//Uq2Eo/O5/SYTY4B2Iv4ErLjj+5tf5K3fxahBn20vPQTEWIkFj1mEzcAfVrhasNLkmhlCwU5LGm9so6B1h10vvesCDGSq6OZEhzXAKw2PgHMyHc1+5vflW2+WUr7W4/I1OBIZuixm5gBAF8VLZG+fxYT9rtp23C/CBFH7EY0AD3x4KWiI/Q3vSMiZDE9O1/Gd7hJhBjKpeMlD41oAFYblwG2fFfR3bxFmv8GoP0fD4sIQ7HpMRyfAUD8iQZyif6mTSKCAejd+7q0Akby2bgMwFzrqgPOFP1goHWniGAQDm95XkQYylmR1gSMaQBWG58BTDkpSawGcEgMwCj07HpFkooOxWQvGrsVEKkLcIlopyX9kI0/xiHsd9P74esixFAui8kAlGpXLdL8B8DbsVdEMBh9e/8uIgzlTD2mozMAmx0n0vwHwN8ta82NhvujzYS8fSLEMUx6TEdnABBbUoGcNgDZbGI41HBQZm6ijOkRBqCnF14lemmEBnpFBAPiObBNRBjKqtFSh48wAFsBy4Fi0Usj4O4QEZJR+5ZMRzGlr1fp/miziD6UYj22IxsActbfEMLSl0yYmspifvofy/jvG89iSpk9Ldf0d7fIOEAUsT2aAUj/fxAhv0dESJDPnz8Ls9nE8oXVPP6T1Zw0ozwt1/V27BPxx4ntoQagrRiS8/4GIQlAEqPIbuHSlcd2k0+tKOLhO8/hkpWONBiATOEOY97wVYFDDMBexFmi0TADkEVACfGVi+dSWjJ0P1mB1czt/3IGt359MVaLkpLrKiaTHNY6CsNjfLj6y0UiIVlMKbPzBeecMX/+mXNm8sBtq1IyLhBWVUKebnkII1keyQCWiT5Csvj2l0+lyB45leSC2ZP5/X+t4cz5VUm/vszgjMqyUQ3A7nBNQPr/QpJYtWQ6qz9WF9Vnyyfa+X83r+QrFyf30KlgvxjAKMzTY32oAQALkcy/QoIoJhNFdgu3/NPpMf2e2WziW19YwN3//rFxWw3REpYB3NGwAKePZgCLRRsh4aBTVX563TLKJ8bXr1/9sTqe/Mlq6mtKEy6LHB82JotGM4BTRRchUa657GSWL6xO6Dvqa0p58ierWbVkekLfE5a8AGNx6mgGsEB0ERLhE6fXcvWlJyXlu4rsFn72n8u5du2CtC4hzhMWDDGAcKWrEJgpugjxcsqsyfz42qWYzUkMVhNcfelc1t36ibQtIc4TZuoxrxlAUQlzkAFAIU5m1ZXx6xtXJG3wbjhL5k9N6xLiPMCix/zRLsDcPBYjIa67cmFe3/8psybz4G2rRqz2SzZTK4p49AfnpmUJcZ4wb7AByPx/nFz1yRO5du2CvLz3M+dXse7WlSkP/iNYLUrKlxDnEXMHG8Dxokf8XH3pXG79+uK8Gqy6ZKWDX6aw2R+Jz5wzk8d+cC41lZK2IgGOH2wAc0SPxCtlPgxWKSYTN3z5VG7/lzMosJozVo65M8p5+q7zpeLFz5AxgHrRI3GODFadMmtyTt5fTWUxD995DmsvmJ0V5UlX1yNHqQdQ9MMDJ4oeyWFqRREP33EO165dkFP91EtWOnj2ngtYMDs3zS0PmWiudU2yWG3UiBbJxWw2cfWlczl7SS0/WPc2b249ZNh7qa8p5aavnsaS+VPlweYYVhs1FqAu75VIYfCs+97ZvP7uAe555D12N3YbpuxFdgtf+9Q8rvzkHBlxz13qLECl6JBali+sZunJ0/jffzTxm99vy2ojKLJb+PzqWXzlkrnSx859Ki1Add7LkAbMZhOrP1bH6qV1vPVBK4/+cTd/3dRCWFWzonxTyuxctnoWnzl3Ztw7+QTDUW0BpHOXTkzabMGS+VNp7fTwwl/3s/6N/RlpFSgmE0vmVfKpc2ZyzhnHJXcdv2AEJlsAGdbNEFMrirj60rlcfelc9rX08pe3mnlry0E27WgnEAyn5JpWi8JpJ07h3I/VcfbiWnnb5zdTLEBp3suQBdTXlB41A483yNYPO3hvZwc79nWxY99hDrZ74uou1FQWc2J9OSfWT2LBnMksmDMlowt4hKxikgUoEx2yiyK75Wg34Qi+QIgDbW6a2/pxewK0dnrw+UJ4vFraqwnFNiwWE8WFVqZOLqK2soSqiqKMLNUVDEOZtAAMQoHVTH1NKfXV+uOS7rqQOKViAEZDAl9IogEogIwCCUJ+YrcABaJDdEwps+NcUs3i2eU4ppVQWmQVUTLMP35+Dq1dXloPD7Bx12Fcbx2gvdsrwkRHgQVJBRZV4H/rklmcv7gGxZQdC3cEjcICM/VTi6mfWsyZcydzzcWzeXFjC/c8u1uMYHwsFkCyKkTgzPlV3HP1yRQWmAEJ/mxHMalcsKSalQuq+NZ9W+gRSSJRLLs8InBexfv86huL9OAXjERhgZlffWMR51W8L2JEQJr/Y7BoQgNfrHo1Y03+QDDMU3/+kPVvNPJhUzcAJxxXxsUrHVz8CUfW7dALBMM892oDz73SMKS8a5bV8dnzTshIeRWTyherXqXdP4HNfZJMdDRMF/0iS3ajZBGTbf38ZMZDFCrjHy1lnpL8VNWtnR6+cedrY+4PmFVXxq9uXMHUiqKs0CuT5Q21Hx73MwNhG9fvvZIOf4lU7mEogJyfNIzPV74eVfCnAl8gFDGYAHY3dvPNH/8NXyCUca18gRDf/PHfxi3vN+58LWPlLVT8fL7ydanYI3ErgByhOojJtn7OKN2Vsev/7qU9Ue0M3Lb3ML97aU/G9frdS3vYtnf8t/Duxu6MlveM0l1MtvVLBR9KUAF8osMxzizdmdGpvvVvNKbks/leXsWkcmbpTqngQ/EpgEyWDmJ+cVNGr7+94XBKPivlzfyzzUK8CtArOhyj1t5pmLIaLVdfpstrpGebJnrFAIYx0ZzZMdG5juhnFU44rizjehmpvJl+ttlqAN2iQ/awZlldSj4r5RVGoVtaAMPoCWV2ZfSnz51Jfc34O7Rn1ZXx6XNnZlyvT587k1l1ZeN+rr6mNOPlzfSzzUK6FKBDdDhGs7cio9cvsJpZd+vKiEF1ZGFNNqT2KrCa+dWNK8Yt77pbV2a8vJl+tllIu3nO+d9bBKwULTTKrf3MK4l+tFgpLkx6GUoKrVx8toOKUjt97gB9bj9Wi8JcRzlfvuhEvvfPS5iYRTn7S4qsXHr2DMpLC0Yt7y1fX0xZSWp2nauegag/+2rXfHZ55CCsQbxguugX6peA+0ULjcm2fu49YV3Un0/FUmAheqJZCnyEaz78qiwHHsqXFaBNdDhGh7+EDT1yWnqusaFnjgT/SNoUIPPLybKMx9uWMxCWY7FyhYGwjcfblosQI2lUAn5aRIehdPhLuO/AKhEiR7jvwCp5+49CwE+LEmp2doEkThnOhp7ZPNgqY6NG58HWlWzomS1CjKQn1OzsOrI2c5/oMZI/d57CXU0XSXfAgAyEbdzVdBF/7jxFxBidfaDlAwCQbVJjsLnPwfV7r5SBQYMQVk1s6JnD9XuvlCxAkdkJx1KC7Rc9xqbDX8K9zefzeNtyPla6g5OKP6LW3slEsxvJFpj5gO8JFdPsrWCbezp/7z1R+vvRsX+wAWwXPaIzgj90nM4fOk4/+n9PVT4kwmSQtduvFRHiYzsc6wJ8IHoIQl7xwVED8PSzE0l6Lwj5QlCPec0AlDbnALArryURjFeLVTnWIk726DHPYAXfE11ixxuS8wEzhU+0j5ejsT7YAN4RXeIxADlbJSOoEAhLCyBO3hnNADaKLrHTGygUETKBSbRPgI0jDMDTz9uAPy/lSIAOn2SZEe0NhV+PdWDQ2YBKm3OAEtcmYKloFD3tA8aqhOPtnzdSfgOjaZ8lbDoyAAhDuwAAb4o+sXHAM9FQ5TUVFMT1M9E+ZxgS48MNQA5Qi5FG9yRDlVcpKYzrZ6J9zvD6mAbg9fAP0Sc29vUbLCWYomCuKBvytjcVFGCuKAPFQKPqqgG1zwKGx/jQJ97qPIQsC46JgaCVJrfxTEApLcY8pRzzlHKU0mJjBT/Q5ClnICjrAGLkAz3GxzAAjT+LTrGxo7tSRBDNjcCI2B7NANaLTrGxrXuqiCCaG4H14xqA38frgByiFgPvd1XLuvQ0ElQV3u+qFiFiw63HdmQDCLc4A8DLolf0DAStbOmSAyfSxZauGun/x87LemxHNgAdGQeIkdcOzhARROtsZtSYHtUA/F5cSH6AmHi7YzruYPoX0qiBIIGWbgJNXYT7fCm/XrjPR6Cpi0BLN2ogmPb7dQcLeLtjulS4GKuJHtPRGUD4gLMZWRUYEyFV4ZWD6T/9NtTpQfWHUENhgh39qL5A6mqRL6BdIxRG9YcIdXrSfr9vHKonJOMtsfKmHtPRGYDOs6JbbLz40ZyMDwYGO9wQDif/i8Nh7bszeW+qwvqWuVLRYueJsX4wZm0N+Hka6QbERIe/hI0ddWm9pnni0G6H6g8RbOtP7pNTIdjWj+oPDb32pPQuHd7YUcdBzwSpaDE+Pa+Hp2I2gFCzsxHpBsTMk/sWprUVYCoswDxh6MEl4YEAwUO9yWkJhMMED/USHhjatbBMLMBUkL6R+KCq8OS+hVLBYuevw1f/RWUAOo+KfrFx0DOBNw6l90AKc8UETDbzCBMIHOxNaExA9WnfMTz4lUIryqT05t7/y4FZ8vaPj6ci/TCiAQT8PIEkCYmZxxsWpTdXoAms00pHmIDqDxE40Euooy+mEXs1ECTU0UfgQO+IZr/JZsZSWQKm9N2eN2TlmcaTpWLFjl+P4fgMQD849BnRMTa6/IXpr7CKgnVaKUrhSOMJ9fkJNPcQbO0l3OvWWgXhsDZOoALhMKovQLjXTbC1l0BzD6G+kb6vFFqxTitN+8ahZxpPpssv6b/ikU6P4TGJJqPlOuAy0TI2XB/NZVnVPo4rPpxWE7BUlRLu6ifYM3JNQHggoDfnvTF/tWVigdbsT+ObH6DJXY7rIxn5j5N141aZ8T4Q8PMqsFe0jI2QqvDTbSvSPy1oAqW8BGv1yC5BXF9nM2OtLkUpT3/wB1WFe3csk3n/+Nirx25iBhBqdqrAfaJn7Bz0TOCRPadn5NqmAivWmjKsU0tG7RaMWzEKrVinlmCtKUvraP9gntq3kMZ+yfoTJ/fpsRuRqJLaez08YC/i9mg/LxzjxZY5zC5rY+mUfZkxgsICLIUFEA4TdgdQfX7CvhCEVNSQNk1oMitgNqEUmDEV2FCKrZlNEKLC5q7pPNc0TypQfAS9Hh6I5oPRBXSr8xAO15PAWtE2dv5n15nUFvWkdzxgOIqCMqEAJhRk/ZHmTZ5yfr59uVSc+Hky0tz/kGoRw5f+VHSNj4GglTvfX0W3jGSPS7e/kJ9uWyHbfRMj6liN2gC8Dc53gddE2/jo8hfy461nZ2THoFHwhqz8eOvZsuAnMV7TYzW5BqDzY9E3fvb2VfCjrWfLgaJjBP+dW85hb1+FiJEYMcVoTAYQ8PNnYLtoHD+7eqZw55ZzpCUwLPh/tPVsdvVMETESY7seo6kxAH1a4W7ROXET+N5758mYAFqf/+Z3z2d7d5VUjMS5O5qpv7gNACAc4mFgn2EkyVIa+yfx3U1rjHemQBJpcpfz3U1rZK4/Oezz+2LfvBezAfgbnSHgh6J34nT4S7j53dVsaK/Pu3vf0F7Pze+upsNfknf3niJ+OFrSz6QbAIDfx4NIKyApDASt/Gzbx3ngwyV5kVo8qCo88OESfrbt4zLVlzz26TEZM3HVON1pbhXdk8eLLXO44Z0Lc7pL0OQu54Z3LuTFljnywJPLrfG8/eM2AICAn0eRcwSTSmP/JL696QJ+23BqTrUGvCErv204lW9vukD6+8nnAz0W48I884xZcf2i2vs4lkmX7wOukGeQPFRM7Oyp5K8HZzDJ7mV6cbeh72dDez13bVnB5sO1qOneTpgfXBlodO6J95dN5117YUJXtztcfwTWyHNIDXUlXVxSt5WlU5shFDBMuTcfns7T+06RhT2pZb23wXlBIl+QjHbmt4BgduiRO4TD4O6Dd/ZM4p3uj2OddSnm8pPBnMUDZ2YrSvF0rDOc/L1zJW99WIG7LzVZygWCeuwlRMLbe70Nzt12h+uXwLXyTBIP+gE3uHvB6wZVX9Kx5jQwWeyYaxZirl5A+HADoc4tqL7erCi3qaAUZeIclIp6TBb70TI/+gq4e8BkAnsxFJdCYXFmdxrnEL/0Njh3Z9wAAAJ+brPauByQQ9vjwOuF/m7w9B4L+iOUT4ATjxv6f0rFDJSKGQQbXiHUsUdL2JHuqNLzCJonz8TiWDnixyceB1MmQnuPdk8D/dofkwmKSqGkDOx2efZx0hbwc1syvigptUZPPHiTPJeY4oe+LmjZB4catTelOsoizsXDx2hNxwbSVGyE+92EOrsJdXYPTfiZooAP9w66Xr8bFduYv3LqKCelqap2r4catXvv65IuQhzcNF6yz2hJWoafgJ/7rDauApbK8xmbYFCr9O4eCIXG//z8aBcJhsOoPh+qT08GqiiYrNp4gclq0VoIiknL/mNShub3UwFVi0I1FIawqn2fnkpcDcRnKvPr4U/vRNDCD4fboKcTiifChElgkZxT47Eh4E9eir6kyR1qdqpWh+ufgHeR1GGjBn53x+jN/EjUxdup0g0BOGYKaSbasodC0HtYM8aiUiibLEYwVjUC/inWDT+RSGrH0dvg/ADZJzA8DulqhwMNYzfzI3GcgXfIxlr2I92DAw2aZtI1GMHdeowljaSPHPl93I7kDDjax2/eo73d1Dg9u6LUuBrEW3ZV1TRr3iNjBIPY7vdxS7K/NOkGoK9Jvoo8Xhsw4IaDjVr/Vk2wsVZk4LwhiZZdVTUNDzZqmuYxQeCqeNf7p9UAALwNzrfJw65AMAgdrdDWrA1wpRqloDjj9xypDIEkvQKCfk3TjlZN4zzkh3pMJf/5parEeldgU748IXcftO7X+rDJxDPW+J2qgiULJtIjlGEgySbo7tE07uvK/G2nkU16LKWElBmA3lxZC+R04y0chrYW6DgQ3bRerHSOtdjPZMJkL8v4/UcqQ08KnnwopHUL2lryYmzADaxNRdM/5QYA2jJh4JpcfToDbm3EeqA/dddoao/w8EqngimDewNMVq0McZQ9Ye37de1ze2zgmmQs982YAegm8ABEPqPciPR1af3SVLz1B9PYFikATZjLazKmgbm8ZsjKxJjKngRCIe0Z5GiX4DE9dlJKWhaQe/r5MjmSPORIk/9wW3qut3WcxGvmqZnLrjPetbemKWlcDnYJPvD089V0XCgtBqC0OQeATwE9GJhgUJ+S6k/fNTeO0wA0V87BZE//bIDJXoy5MrIBvLMnfeUZ6NeeTQ7MEvQAn9JjJjcMAI6OB1yJtvLccHi92gh0Oqb3BnO4D3Y0RYpEE9a69B9Bbq07PWLzf0eTthMwnQT92jPyeg0b/CpwZar7/RkxAN0E/gDcYbSnMuCGtqbU9/fHYv04k6nm6gUopek7WEMprcJcvSChMqeKUEh7VgYdHLxDj5H0Pct032E4xPeB9UZ5Iu4+aG9JfEVfIrywcZxFNSYTtrmrMZltKS+LyWzDNnd1xLd/IKiVOVOoqvbM3H2GCv71emyklbQbgH6wyGUYYFDQ3afN76sZ7rR098PTb4wTmEXl2OatTnFtUbDNW42pKHLq8qff0MqcSVRVe3YGMYEPgMv02MhtAwDwNjj7An4uBNrIUo4Ef7bw4P9GWBV45GFWzKDglE+mJjuQyUrB/AtRKmZE/JjHp5U1WzCACbQF/FzobXBmpJQZy84WanY2AheShSsFB9zQeTC7ytTeA/dFce6rUjGDgoWfTerMgMleTMGiT40b/KCVsT3L5no6D2btmIAbuFCPhYyQ0fSM+gaHtWTRzsEBd+b7/GPx8F9gZ3MUD3XiNAoWfxHLtJMSvqZl2kkULP4iysRp4352Z7NWxmzjyJhAls0OBIG1qdrkEy1xHwySNBW6Ht9lmXT5fuBiyOzJEcEgHGrKzuA/UpHf3gUXnQnWcTLmmBQL5ikzsFTNhlCQsKcz+htTFCxT52KbtwZz9TxMyvjpeTw++Pq9me/7R8Lbr2UcyoKsxCrwJW+D86lMFyTjBqCbwBbLpMsPA+dnqgzhMLQ2QTiUcTki0uOBhlZYvUiNOBJ/1AgsdsxTZmKpXYBSMhmTpUCPgKBmCCYTJpsNpXgy5vLjsdSdinXOKsxVszFZC6N2puvvN/F+lh8Xq6paC69kYlTSpZJvehuc67JBk4RPBkomdofrFkj/VAhoS0kHsvjtNZxPL4MbL8uOstz5BPzuDeNoV1gClZnbQnGrt8F5W7ZokRUtgCMEux7/q2XS5WbgrHRet6s9+fv4U832Jm2r8MdPUjP3OlNV7nzSZKjgB23FoKpqh5Skmdu9Dc7vZZMWWWUAugm8apl0uR1Ylo7rDbjh8CFjVeDBJrCrxcTH540/JpBsPD64/n4T69/OTm3GwzcABYVgtaXtkj/yNjiz7uyMrDykydvgvAFSlwXlCMFg9k33xcprW+DzP4pudiBZ7G6BL9ylXdvIdB5M2+ah2/U6nXVkXQvgaHBqLYEgsDJV1+g4CH5fVt5+TPR44Lk3wRuARTPAnCJbDwThv1+AWx7VNikZHVWFYEA7szCF3JRNfX7DGIBuAq/rswOrSfIUYV9XbiWSUFV4b69mBGYzzJiWvG6Bx6ct773+/8Pft2fvNGlcdcyv6VVQmPSvVtFG++/O5vvPqlmAsbA7XF8A7idJJw4Fg1o6qVyqyMMpK4ELF2un9A4/XDRadjRpu/pe2Jjd8/sJB4EJqh1JPY0oCHzZ2+B8JOvv3QgGoJvABcCTQMJjt0ab8kuU8gnaIaPz67Xjumonw6QSKNQHwAb80NUPzR1aGq+t+7REJLnQzI+WJE4NuoHPeRucfzTCfRvGAHQTOB14gQSOIR9wa3nkBGE4lbUJTw22ARdmenlvLGTlLMBYeBucbwf8LCaBrcSHs3b/oZBpEqwbHwT8LDZS8BvOAODoLsKlxJFUpK8r/Sm9BOMQ9Mc9MLweWJrJXX15YwCg5RMIh/gk8COizDEYDmvn0AtCJHo6Y8ourAI/Cof4ZKb28yeKYU9h17On3GB3uN5FmyGI2Htz92Qup59gHEIhra5MmDTuR91oI/0Z39GXCIZsAQxGfwBnADvH+oy8/YVYiKIVsBM4w+jBnxMGoJvAB8Bi4LHRfi5vfyEWjrQCxuAxYLFe5wyPYbsAo5hAH3CF3eH6C3Avg7oEvd1SqYXY6O0e0Q1wo53V90Au3WdOtACGGcEDwCL0o8kH3DLyL8RO0D8kj+AmYFGuBX9OGoBuArv9PpYCt/f3ZE++QcFY9HcTBG73+1iaztN60omhVgLGw6GAaxHwIDBfqrQQA1uBq6qszs25fJM52QIYTJXVuXna8ZwKfAeQzoAwHn7gO9OO59RcD37IgxbAYA4FXHOA3wDLpZ4Lo/A68LUqq3NnvtxwzrcABlNlde6srucs4BuArAwQjtAJfKO6nrPyKfjzzgAAQs1Otcrq/HV1PScA/4V0C/IZP/Bf1fWcUGV1/jrU7MzhDBGjk1ddgNHQuwU/B86VeMgrXgK+mW9v/OHkXQtgOFVW584qq/M8YA3ayK+Q22wF1lRZnefle/CLAQw1ghenz2QhcBXQIIrkHA3AVdNnsrDK6nxR5BADGIG/0RmqsjofmnY8c3QjyPLDroQo2AdcNe145lRZnQ/pu0gFMYCxCbc4A7oRzNaNYIeoYjh26IE/u8rqfCjc4gyIJCPJ+0HAaDDXukwH9rEauBYZLMx2XgJ+Vl3Pn/JxVF8MIMXoS4v/Dfg8YMtzObIFP/A48It8WL0nBpANTHVVHfqIq4CvAQ4RJCM0AL+pms6DtDoNesKjGIDhORRwnY82VnAx0ipINX7gOeBBaeaLAWQV5lrXpAP7uAy4AjiTJB9nlseowJvAo1XTeUbe9skjZzICZQndVVbnr4Ffm2tddboZXAwsETOIK+jfAp6rrueJoym3W0WYZCItgDSgVLtqDzbi1M1gBdJNGAs/8Brw3LQ6XOEDTjnDSQwgt7A7XBMad7EMWAWcD5yY55LsAF4EXq6bzRtGza8vBiDEhLnWZQo1O1V9NmEpsAxt3OBUcreF4Ac2AxuAN6qms+FIf/6oHoIYQD4TrnQVtrdwGtrxZ4vQUpnNwXhjCCpa/vytR4J+Sg2blDbngDxlMQAhdlM4UTeDWcBMYLr+74oMF68T2A18BOzR/711Sg07JNjFAIT0mEMdUI92bPpU/e8KoBCYBkwGCoCJ+q+Vc6xFoQIB4Ejfu1f/Px/QARwEBvRAb0Mbh28D9k2poVGC3Nj8H1wwenSbpdbLAAAAEnRFWHRFWElGOk9yaWVudGF0aW9uADGEWOzvAAAAAElFTkSuQmCC\r\n', 'nmanili', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(4, 'Adam Avery', NULL, 'aavery', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(5, 'Molly Ball', NULL, 'mball', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(6, 'Olivia Buckland', NULL, 'obuckland', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(7, 'Boris Cornish', NULL, 'bcornish', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(8, 'Charles Dyer', NULL, 'cdyer', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(9, 'Christopher Lang', NULL, 'clang', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(10, 'Frank Fraser', NULL, 'ffraser', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(11, 'Gavin Hamilton', NULL, 'ghamilton', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(12, 'Vanessa Hill', NULL, 'vhill', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(13, 'Una McDonald', NULL, 'umcdonald', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(14, 'Wanda May', NULL, 'wmay', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(15, 'Eric Miller', NULL, 'emiller', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(16, 'Liam Nolan', NULL, 'lnolan', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(17, 'Luke Reid', NULL, 'lreid', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(18, 'Paul Turner', NULL, 'pturner', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(19, 'Kimberly Welch', NULL, 'kwelch', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(20, 'Dorothy Simpson', NULL, 'dsimpson', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9'),
(21, 'Jan Terry', NULL, 'jterry', '*6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `actions`
--
ALTER TABLE `actions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_answer_question` (`question_id`),
  ADD KEY `fk_answer_user` (`user_id`),
  ADD KEY `fk_answer_option` (`option_id`) USING BTREE;

--
-- Indexes for table `conditions`
--
ALTER TABLE `conditions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_condition_source` (`question_source_id`),
  ADD KEY `fk_condition_target` (`question_target_id`),
  ADD KEY `fk_condition_operator` (`operator_id`),
  ADD KEY `fk_condition_action` (`action_id`);

--
-- Indexes for table `forms`
--
ALTER TABLE `forms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_form_icon` (`icon_id`);

--
-- Indexes for table `icons`
--
ALTER TABLE `icons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `operators`
--
ALTER TABLE `operators`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `options`
--
ALTER TABLE `options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_option_question` (`question_id`) USING BTREE;

--
-- Indexes for table `qtypes`
--
ALTER TABLE `qtypes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_question_form` (`form_id`),
  ADD KEY `fk_question_qtype` (`qtype_id`);

--
-- Indexes for table `surveys`
--
ALTER TABLE `surveys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_survey_form` (`form_id`),
  ADD KEY `fk_survey_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `answers`
--
ALTER TABLE `answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT for table `conditions`
--
ALTER TABLE `conditions`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `forms`
--
ALTER TABLE `forms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `options`
--
ALTER TABLE `options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `surveys`
--
ALTER TABLE `surveys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `answers`
--
ALTER TABLE `answers`
  ADD CONSTRAINT `fk_answer_option` FOREIGN KEY (`option_id`) REFERENCES `options` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_answer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `conditions`
--
ALTER TABLE `conditions`
  ADD CONSTRAINT `fk_condition_action` FOREIGN KEY (`action_id`) REFERENCES `actions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_condition_operator` FOREIGN KEY (`operator_id`) REFERENCES `operators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_condition_source` FOREIGN KEY (`question_source_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_condition_target` FOREIGN KEY (`question_target_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `forms`
--
ALTER TABLE `forms`
  ADD CONSTRAINT `fk_form_icon` FOREIGN KEY (`icon_id`) REFERENCES `icons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `options`
--
ALTER TABLE `options`
  ADD CONSTRAINT `fk_option_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `fk_question_form` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_question_qtype` FOREIGN KEY (`qtype_id`) REFERENCES `qtypes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `surveys`
--
ALTER TABLE `surveys`
  ADD CONSTRAINT `fk_survey_form` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_survey_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

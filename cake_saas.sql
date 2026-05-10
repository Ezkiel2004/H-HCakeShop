-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 08, 2026 at 04:42 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cake_saas`
--

-- --------------------------------------------------------

--
-- Table structure for table `cakes`
--

CREATE TABLE `cakes` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `flavor` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `rating` decimal(3,1) DEFAULT 0.0,
  `reviews` int(11) DEFAULT 0,
  `bestseller` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT '',
  `sizes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sizes`)),
  `toppings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`toppings`)),
  `available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cakes`
--

INSERT INTO `cakes` (`id`, `name`, `category`, `flavor`, `price`, `rating`, `reviews`, `bestseller`, `description`, `image`, `sizes`, `toppings`, `available`, `created_at`) VALUES
('cake_001', 'Velvet Dream', 'Classic', 'Red Velvet', 45.00, 4.8, 124, 1, 'Luxurious layers of red velvet cake with silky cream cheese frosting, decorated with white chocolate shavings and fresh raspberries.', '', '[\"6\\\"\", \"8\\\"\", \"10\\\"\", \"12\\\"\"]', '[\"Sprinkles\", \"Fresh Berries\", \"Chocolate Shavings\", \"Edible Flowers\"]', 1, '2025-01-15 10:00:00'),
('cake_002', 'Midnight Ganache', 'Premium', 'Chocolate', 55.00, 4.9, 98, 1, 'Rich dark chocolate layers drenched in Belgian ganache, topped with gold leaf accents and truffles.', '', '[\"6\\\"\", \"8\\\"\", \"10\\\"\"]', '[\"Gold Leaf\", \"Truffles\", \"Chocolate Curls\", \"Caramel Drizzle\"]', 1, '2025-01-20 10:00:00'),
('cake_003', 'Garden Blossom', 'Specialty', 'Vanilla', 65.00, 4.7, 76, 0, 'Light vanilla sponge adorned with handcrafted sugar flowers and delicate buttercream in pastel hues.', '', '[\"6\\\"\", \"8\\\"\", \"10\\\"\", \"12\\\"\"]', '[\"Sugar Flowers\", \"Buttercream Roses\", \"Pearl Sprinkles\", \"Macarons\"]', 1, '2025-02-01 10:00:00'),
('cake_004', 'Tropical Sunset', 'Specialty', 'Mango', 52.00, 4.6, 53, 0, 'Exotic mango and passion fruit layers with coconut cream, decorated with tropical fruits and edible orchids.', '', '[\"6\\\"\", \"8\\\"\", \"10\\\"\"]', '[\"Tropical Fruits\", \"Coconut Flakes\", \"Edible Orchids\", \"White Chocolate\"]', 1, '2025-02-10 10:00:00'),
('cake_005', 'Caramel Crunch', 'Classic', 'Caramel', 48.00, 4.8, 89, 1, 'Moist caramel cake with salted caramel drizzle, crunchy toffee bits, and creamy caramel buttercream.', '', '[\"6\\\"\", \"8\\\"\", \"10\\\"\", \"12\\\"\"]', '[\"Toffee Bits\", \"Caramel Sauce\", \"Pecans\", \"Sea Salt Flakes\"]', 1, '2025-02-15 10:00:00'),
('cake_006', 'Berry Bliss', 'Classic', 'Mixed Berry', 50.00, 4.5, 67, 0, 'Fresh mixed berry layers with whipped cream frosting, loaded with strawberries, blueberries, and raspberries.', '', '[\"6\\\"\", \"8\\\"\", \"10\\\"\"]', '[\"Fresh Berries\", \"Whipped Cream\", \"Mint Leaves\", \"Berry Coulis\"]', 1, '2025-03-01 10:00:00'),
('cake_007', 'Pistachio Royale', 'Premium', 'Pistachio', 70.00, 4.9, 42, 0, 'Elegant pistachio sponge with rose water cream, crushed pistachios, and delicate gold dust finishing.', '', '[\"6\\\"\", \"8\\\"\", \"10\\\"\"]', '[\"Crushed Pistachios\", \"Rose Petals\", \"Gold Dust\", \"White Chocolate\"]', 1, '2025-03-05 10:00:00'),
('cake_008', 'Lemon Cloud', 'Classic', 'Lemon', 42.00, 4.4, 58, 0, 'Light and fluffy lemon cake with tangy lemon curd filling and Italian meringue frosting.', '', '[\"6\\\"\", \"8\\\"\", \"10\\\"\", \"12\\\"\"]', '[\"Meringue Kisses\", \"Lemon Zest\", \"Candied Lemons\", \"Edible Flowers\"]', 1, '2025-03-10 10:00:00'),
('cake_009', 'Matcha Zen', 'Specialty', 'Matcha', 58.00, 4.7, 35, 0, 'Japanese matcha green tea layers with white chocolate mousse and delicate matcha powder dusting.', '', '[\"6\\\"\", \"8\\\"\"]', '[\"Matcha Powder\", \"White Chocolate\", \"Mochi Balls\", \"Red Bean\"]', 1, '2025-03-15 10:00:00'),
('cake_010', 'Cookies & Cream', 'Classic', 'Cookies & Cream', 46.00, 4.6, 112, 1, 'Oreo-studded vanilla layers with cookies and cream frosting, topped with whole cookies and chocolate drizzle.', '', '[\"6\\\"\", \"8\\\"\", \"10\\\"\", \"12\\\"\"]', '[\"Cookie Crumbs\", \"Chocolate Drizzle\", \"Whipped Cream\", \"Mini Oreos\"]', 1, '2025-03-20 10:00:00'),
('cake_011', 'Tiramisu Tower', 'Premium', 'Coffee', 62.00, 4.8, 73, 0, 'Coffee-soaked layers with mascarpone cream, dusted with cocoa and topped with chocolate-covered espresso beans.', '', '[\"6\\\"\", \"8\\\"\", \"10\\\"\"]', '[\"Cocoa Powder\", \"Espresso Beans\", \"Chocolate Shavings\", \"Ladyfingers\"]', 1, '2025-04-01 10:00:00'),
('cake_012', 'Strawberry Fields', 'Classic', 'Strawberry', 44.00, 4.5, 91, 0, 'Fresh strawberry cake with strawberry cream filling, glazed with strawberry mirror glaze.', '', '[\"6\\\"\", \"8\\\"\", \"10\\\"\", \"12\\\"\"]', '[\"Fresh Strawberries\", \"Mirror Glaze\", \"White Chocolate\", \"Mint\"]', 1, '2025-04-05 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('percentage','fixed','free_delivery') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_order` decimal(10,2) DEFAULT 0.00,
  `max_uses` int(11) DEFAULT NULL,
  `used` int(11) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `type`, `value`, `min_order`, `max_uses`, `used`, `active`, `expires_at`, `created_at`) VALUES
('coup_001', 'WELCOME15', 'percentage', 15.00, 30.00, 100, 12, 1, '2025-12-31 23:59:59', '2025-03-15 10:00:00'),
('coup_002', 'SWEET10', 'fixed', 10.00, 50.00, 50, 5, 1, '2025-06-30 23:59:59', '2025-03-15 10:00:00'),
('coup_003', 'FREESHIP', 'free_delivery', 0.00, 25.00, 200, 45, 1, '2025-12-31 23:59:59', '2025-03-15 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(50) NOT NULL,
  `tracking_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `delivery_fee` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL,
  `driver_id` varchar(50) DEFAULT NULL,
  `delivery_address` text NOT NULL,
  `delivery_date` date NOT NULL,
  `delivery_time` varchar(50) NOT NULL,
  `delivery_name` varchar(100) NOT NULL,
  `delivery_phone` varchar(50) NOT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `payment_method` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `tracking_id`, `user_id`, `subtotal`, `delivery_fee`, `tax`, `discount`, `total`, `status`, `driver_id`, `delivery_address`, `delivery_date`, `delivery_time`, `delivery_name`, `delivery_phone`, `coupon_code`, `payment_method`, `created_at`) VALUES
('ord_001', 'TRK-2025-001', 'user_001', 45.00, 5.99, 4.08, 0.00, 55.07, 'delivered', 'user_driver01', '123 Baker Street, Sweet City', '2025-03-10', '14:00-16:00', 'Sarah Johnson', '(555) 123-4567', NULL, 'credit_card', '2025-03-10 13:40:23'),
('ord_002', 'TRK-2025-002', 'user_002', 151.00, 0.00, 12.08, 15.00, 148.08, 'delivered', 'user_driver02', '456 Frosting Ave, Sugar Town', '2025-03-15', '10:00-12:00', 'Mike Chen', '(555) 234-5678', 'WELCOME15', 'credit_card', '2025-03-14 13:40:23'),
('ord_003', 'TRK-2025-003', 'user_001', 70.00, 0.00, 5.60, 0.00, 75.60, 'delivered', 'user_driver02', '123 Baker Street, Sweet City', '2025-03-14', '16:00-18:00', 'Sarah Johnson', '(555) 123-4567', NULL, 'paypal', '2025-03-13 13:40:23'),
('ord_004', 'TRK-2025-004', 'user_003', 46.00, 5.99, 4.16, 0.00, 56.15, 'baking', 'user_driver02', '789 Sprinkle Lane, Cake City', '2025-03-16', '14:00-16:00', 'Emily Davis', '(555) 345-6789', NULL, 'credit_card', '2025-03-15 13:10:23'),
('ord_005', 'TRK-2025-005', 'user_002', 65.00, 0.00, 5.20, 0.00, 70.20, 'baking', 'user_driver01', '456 Frosting Ave, Sugar Town', '2025-03-17', '12:00-14:00', 'Mike Chen', '(555) 234-5678', NULL, 'credit_card', '2025-03-15 11:40:23'),
('ord_03ed3ced', 'TRK-2026-PC7UA8', 'user_001', 5155.00, 0.00, 412.40, 0.00, 5567.40, 'delivered', 'user_driver01', '123 Baker Street, Sweet City', '2026-05-09', '10:00-12:00', 'Sarah Johnson', '(555) 123-4567', NULL, 'credit_card', '2026-05-08 01:00:51'),
('ord_46631db8', 'TRK-2026-EGYMQP', 'user_cba19ca5', 3180.00, 0.00, 254.40, 0.00, 3434.40, 'delivered', 'user_13ef3abc', '123 Baker Street, Sweet City', '2026-05-09', '10:00-12:00', 'Ezekiel Magat', '(555) 123-4567', NULL, 'credit_card', '2026-05-07 02:03:52'),
('ord_796714fe', 'TRK-2026-6EXSY1', 'user_001', 51.00, 0.00, 4.08, 0.00, 55.08, 'delivered', 'user_driver01', '123 Baker Street, Sweet City', '2026-03-25', '10:00-12:00', 'Sarah Johnson', '(555) 123-4567', NULL, 'cod', '2026-03-15 07:29:39'),
('ord_a3c3b357', 'TRK-2026-ZGEXWF', 'user_001', 45.00, 5.99, 3.60, 0.00, 54.59, 'delivered', 'user_driver02', '123 Baker Street, Sweet City', '0000-00-00', '10:00-12:00', 'Sarah Johnson', '(555) 123-4567', NULL, 'credit_card', '2026-03-15 07:25:50');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `cake_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `size` varchar(20) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `toppings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`toppings`)),
  `message` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `cake_id`, `name`, `size`, `qty`, `price`, `toppings`, `message`) VALUES
(1, 'ord_001', 'cake_001', 'Velvet Dream', '8\"', 1, 45.00, '[\"Fresh Berries\"]', 'Happy Birthday!'),
(2, 'ord_002', 'cake_002', 'Midnight Ganache', '10\"', 1, 55.00, '[\"Gold Leaf\", \"Truffles\"]', ''),
(3, 'ord_002', 'cake_005', 'Caramel Crunch', '6\"', 2, 48.00, '[\"Toffee Bits\"]', 'Congratulations!'),
(4, 'ord_003', 'cake_007', 'Pistachio Royale', '8\"', 1, 70.00, '[\"Gold Dust\", \"Rose Petals\"]', 'With Love'),
(5, 'ord_004', 'cake_010', 'Cookies & Cream', '8\"', 1, 46.00, '[\"Cookie Crumbs\"]', ''),
(6, 'ord_005', 'cake_003', 'Garden Blossom', '10\"', 1, 65.00, '[\"Sugar Flowers\", \"Macarons\"]', 'Happy Anniversary!'),
(7, 'ord_a3c3b357', 'cake_001', 'Velvet Dream', '6\"', 1, 45.00, '[]', ''),
(8, 'ord_796714fe', 'cake_001', 'Velvet Dream', '6\"', 1, 51.00, '[\"Fresh Berries\",\"Edible Flowers\"]', ''),
(9, 'ord_46631db8', '', 'H&H Whopper', '', 2, 115.00, '[]', ''),
(10, 'ord_46631db8', '', 'Package #2', '', 1, 2950.00, '[]', ''),
(11, 'ord_03ed3ced', '', 'H&H Combo 2', '', 1, 160.00, '[]', ''),
(12, 'ord_03ed3ced', '', 'Fries with Bacon & Cheese', '', 1, 140.00, '[]', ''),
(13, 'ord_03ed3ced', '', 'Caramel Macchiato', '', 3, 100.00, '[]', ''),
(14, 'ord_03ed3ced', '', 'H&H Whopper', '', 1, 115.00, '[]', ''),
(15, 'ord_03ed3ced', '', 'Spaghetti Bolognese', '', 3, 80.00, '[]', ''),
(16, 'ord_03ed3ced', '', 'Package #5', '', 3, 1400.00, '[]', '');

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` int(11) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_status_history`
--

INSERT INTO `order_status_history` (`id`, `order_id`, `status`, `time`) VALUES
(1, 'ord_a3c3b357', 'received', '2026-03-15 07:25:50'),
(2, 'ord_003', 'baking', '2026-03-15 07:28:29'),
(3, 'ord_003', 'decorating', '2026-03-15 07:28:49'),
(4, 'ord_796714fe', 'received', '2026-03-15 07:29:39'),
(5, 'ord_796714fe', 'out_for_delivery', '2026-03-15 07:30:52'),
(6, 'ord_a3c3b357', 'out_for_delivery', '2026-03-15 07:30:53'),
(7, 'ord_004', 'out_for_delivery', '2026-03-15 07:30:54'),
(8, 'ord_46631db8', 'received', '2026-05-07 02:03:52'),
(9, 'ord_46631db8', 'baking', '2026-05-07 02:06:09'),
(10, 'ord_46631db8', 'out_for_delivery', '2026-05-07 02:06:19'),
(11, 'ord_03ed3ced', 'received', '2026-05-08 01:00:51'),
(12, 'ord_796714fe', 'received', '2026-05-08 01:01:34'),
(13, 'ord_46631db8', 'received', '2026-05-08 01:01:35'),
(14, 'ord_a3c3b357', 'received', '2026-05-08 01:01:38'),
(15, 'ord_a3c3b357', 'delivered', '2026-05-08 01:01:41'),
(16, 'ord_796714fe', 'delivered', '2026-05-08 01:01:42'),
(17, 'ord_46631db8', 'delivered', '2026-05-08 01:01:43'),
(18, 'ord_004', 'delivered', '2026-05-08 01:01:45'),
(19, 'ord_005', 'delivered', '2026-05-08 01:01:46'),
(20, 'ord_002', 'delivered', '2026-05-08 01:01:49'),
(21, 'ord_003', 'delivered', '2026-05-08 01:01:50'),
(22, 'ord_03ed3ced', 'baking', '2026-05-08 01:01:55'),
(23, 'ord_03ed3ced', 'decorating', '2026-05-08 01:01:56'),
(24, 'ord_03ed3ced', 'out_for_delivery', '2026-05-08 01:01:57'),
(25, 'ord_03ed3ced', 'delivered', '2026-05-08 01:01:58'),
(26, 'ord_796714fe', 'decorating', '2026-05-08 01:02:53'),
(27, 'ord_a3c3b357', 'decorating', '2026-05-08 01:02:54'),
(28, 'ord_004', 'baking', '2026-05-08 01:02:56'),
(29, 'ord_005', 'baking', '2026-05-08 01:02:57'),
(30, 'ord_a3c3b357', 'delivered', '2026-05-08 01:04:31'),
(31, 'ord_796714fe', 'delivered', '2026-05-08 01:04:32');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `key_name` varchar(50) NOT NULL,
  `value_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`key_name`, `value_data`) VALUES
('currency', '\"USD\"'),
('deliveryFee', '60'),
('freeDeliveryMin', '1000'),
('loyaltyPointsPerDollar', '10'),
('loyaltyPointsRedemption', '100'),
('platformName', '\"CakeCraft\"'),
('taxRate', '0.08');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'customer',
  `loyalty_points` int(11) DEFAULT 0,
  `status` varchar(20) DEFAULT 'active',
  `address` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `vehicle` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `loyalty_points`, `status`, `address`, `phone`, `vehicle`, `created_at`) VALUES
('user_001', 'Sarah Johnson', 'sarah@example.com', 'sarah123', 'customer', 57219, 'active', '123 Baker Street, Sweet City', '(555) 123-4567', NULL, '2025-01-10 10:00:00'),
('user_002', 'Mike Chen', 'mike@example.com', 'mike123', 'customer', 280, 'active', '456 Frosting Ave, Sugar Town', '(555) 234-5678', NULL, '2025-02-05 10:00:00'),
('user_003', 'Emily Davis', 'emily@example.com', 'emily123', 'customer', 120, 'active', '789 Sprinkle Lane, Cake City', '(555) 345-6789', NULL, '2025-03-01 10:00:00'),
('user_13ef3abc', 'Michael John', 'michael@driver.com', 'driver123', 'driver', 0, 'active', NULL, '(232) - 2321 - 2315', 'Lamborghini Orus', '2026-03-15 07:57:39'),
('user_admin', 'Admin User', 'admin@cakecraft.com', 'admin123', 'admin', 0, 'active', NULL, NULL, NULL, '2025-01-01 00:00:00'),
('user_cba19ca5', 'Ezekiel Magat', 'ezekielmagat27@gmail.com', 'Ezekiel', 'customer', 34344, 'active', NULL, NULL, NULL, '2026-05-07 02:01:19'),
('user_driver01', 'James Rodriguez', 'james@cakecraft.com', 'driver123', 'driver', 0, 'active', NULL, '(555) 456-7890', 'White Van #CC-01', '2025-01-15 10:00:00'),
('user_driver02', 'Lisa Park', 'lisa@cakecraft.com', 'driver123', 'driver', 0, 'active', NULL, '(555) 567-8901', 'Blue Sedan #CC-02', '2025-02-01 10:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cakes`
--
ALTER TABLE `cakes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tracking_id` (`tracking_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

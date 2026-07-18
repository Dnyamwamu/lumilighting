-- Disable triggers/foreign key checks temporarily
ALTER TABLE public.product_collection DISABLE TRIGGER ALL;

-- Clear existing collections
TRUNCATE TABLE public.product_collection CASCADE;

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: product_collection; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.product_collection VALUES ('pcol_01KW1GBHT23J0P8K28HS6SS8PR', 'Featured Deals', 'featured-deals', NULL, '2026-06-26 08:22:18.173744+00', '2026-06-26 08:44:40.027+00', '2026-06-26 08:44:40.025+00', NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KW28613K3XZ1MYEQGE9JKZGF', 'New Arrivals', 'new-arrivals', NULL, '2026-06-26 15:18:43.056057+00', '2026-06-26 15:18:43.056057+00', NULL, NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KW287ADH20EK6VGWNMBVSV51', 'Best Sellers', 'best-sellers', NULL, '2026-06-26 15:19:25.359708+00', '2026-06-26 15:19:25.359708+00', NULL, NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KW289VGWPY2FW5GXHW02KXAA', 'Featured Products', 'featured-products', NULL, '2026-06-26 15:20:48.410545+00', '2026-06-26 15:20:48.410545+00', NULL, NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KW28AZPNM4Q38ZAH50JJQRXR', 'Luxury Collections', 'luxury-collections', NULL, '2026-06-26 15:21:25.460146+00', '2026-06-26 15:21:25.460146+00', NULL, NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KW1H8WVDQHW2ZVNV2QZDDMK6', 'Indoor Lighting', 'indoor-lighting', NULL, '2026-06-26 08:38:19.755814+00', '2026-06-26 15:51:17.458+00', '2026-06-26 15:51:17.455+00', NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KW1HCF0QHE7GSN4DB5JA2HCE', 'Outdoor Lighting', 'outdoor-lighting', NULL, '2026-06-26 08:40:16.661498+00', '2026-06-26 15:51:25.407+00', '2026-06-26 15:51:25.407+00', NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KW1HDJY60D6NVPVRN3EZ2PNQ', 'Commercial Lighting', 'commercial-lighting', NULL, '2026-06-26 08:40:53.444626+00', '2026-06-26 15:51:36.114+00', '2026-06-26 15:51:36.114+00', NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KW1HFQ99SJM0PSVSSCHPMP60', 'Solar Solutions', 'solar-solutions', NULL, '2026-06-26 08:42:03.431972+00', '2026-06-26 15:51:44.517+00', '2026-06-26 15:51:44.516+00', NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KW1HH11DBQJ2NEP66ZWMFRET', 'Smart Lighting', 'smart-lighting', NULL, '2026-06-26 08:42:46.186758+00', '2026-06-26 15:51:59.746+00', '2026-06-26 15:51:59.746+00', NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KW1HHYJGBR0G2ZQEYETG4AVW', 'Electrical Accessories', 'electrical-accessories', NULL, '2026-06-26 08:43:16.429931+00', '2026-06-26 15:52:07.94+00', '2026-06-26 15:52:07.94+00', NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KW1HJSPXAP644N6R3DQKF6MY', 'Decorative Lighting', 'decorative-lighting', NULL, '2026-06-26 08:43:44.218892+00', '2026-06-26 15:52:17.499+00', '2026-06-26 15:52:17.498+00', NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KW1HKRS6RCT1QGTAQYV7PPR4', 'Industrial Lighting', 'industrial-lighting', NULL, '2026-06-26 08:44:16.03653+00', '2026-06-26 15:52:30.222+00', '2026-06-26 15:52:30.221+00', NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KWY51PKPCTHC5J05FYKWGSF5', 'Indoor Lighting', 'indoor-lighting', NULL, '2026-07-07 11:22:39.591653+00', '2026-07-07 11:22:39.591653+00', NULL, NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KWY53TNSP7X0RTYHC382MDEX', 'Outdoor Lighting', 'outdoor-lighting', NULL, '2026-07-07 11:23:49.303948+00', '2026-07-07 11:23:49.303948+00', NULL, NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KWY550CYJ9BC8VSSYQCWNSGK', 'Commercial Lighting', 'commercial-lighting', NULL, '2026-07-07 11:24:27.923823+00', '2026-07-07 11:24:27.923823+00', NULL, NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KWY569QCX5B2AP36NPT14E28', 'Solar Solutions', 'solar-solutions', NULL, '2026-07-07 11:25:10.250401+00', '2026-07-07 11:25:10.250401+00', NULL, NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KWY57VG55N0T0WFW50PENT74', 'Smart Lighting', 'smart-lighting', NULL, '2026-07-07 11:26:01.220054+00', '2026-07-07 11:26:01.220054+00', NULL, NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KWY592KV64HKC9NYJ6298EXN', 'Electrical Accessories', 'electrical-accessories', NULL, '2026-07-07 11:26:41.273579+00', '2026-07-07 11:26:41.273579+00', NULL, NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KWY5ACSGBTSSM2DQRJ610DPQ', 'Decorative Lighting', 'decorative-lighting', NULL, '2026-07-07 11:27:24.463054+00', '2026-07-07 11:27:24.463054+00', NULL, NULL);
INSERT INTO public.product_collection VALUES ('pcol_01KWY5BBD3CXT55GGCT7YVN0CG', 'Industrial Lighting', 'industrial-lighting', NULL, '2026-07-07 11:27:55.810321+00', '2026-07-07 11:27:55.810321+00', NULL, NULL);


-- Re-enable triggers/foreign key checks
ALTER TABLE public.product_collection ENABLE TRIGGER ALL;


-- CreateTable
CREATE TABLE "ref_bank" (
    "company_id" UUID NOT NULL,
    "account_number" VARCHAR(30) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "bank_branch" VARCHAR(100),
    "currency" VARCHAR(3),
    "description" VARCHAR(500),
    "is_default" BOOLEAN,
    "is_active" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_ref_bank" PRIMARY KEY ("company_id","account_number")
);

-- CreateTable
CREATE TABLE "ref_color" (
    "company_id" UUID NOT NULL,
    "color" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_color" PRIMARY KEY ("company_id","color")
);

-- CreateTable
CREATE TABLE "ref_companies" (
    "company_id" UUID NOT NULL,
    "company_name" VARCHAR(100) NOT NULL,
    "address1" VARCHAR(255),
    "address2" VARCHAR(255),
    "address3" VARCHAR(255),
    "country" VARCHAR(3),
    "phone" VARCHAR(25),
    "mobile" VARCHAR(25),
    "email" VARCHAR(50),
    "is_active" BOOLEAN,
    "base_currency" VARCHAR(3),
    "lastopeningday" INTEGER,
    "lastinvoiceno" INTEGER DEFAULT 0,
    "lastlocalinvoice" INTEGER DEFAULT 0,
    "taxpercent" REAL,
    "report_prefix" VARCHAR(8) DEFAULT 'carobar',
    "last_login_date" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_companies" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "ref_contact" (
    "company_id" UUID NOT NULL,
    "code" VARCHAR(25) NOT NULL,
    "name" VARCHAR(100),
    "address1" VARCHAR(255),
    "address2" VARCHAR(255),
    "address3" VARCHAR(255),
    "phone" VARCHAR(25),
    "mobile" VARCHAR(25),
    "fax" VARCHAR(25),
    "email" VARCHAR(50),
    "is_active" BOOLEAN,
    "comment" VARCHAR(255),
    "is_supplier" BOOLEAN DEFAULT false,
    "is_buyer" BOOLEAN DEFAULT false,
    "is_repair" BOOLEAN DEFAULT false,
    "is_localtransport" BOOLEAN DEFAULT false,
    "is_shipper" BOOLEAN DEFAULT false,
    "is_journal" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),

    CONSTRAINT "pk_ref_transport" PRIMARY KEY ("company_id","code")
);

-- CreateTable
CREATE TABLE "ref_country" (
    "company_id" UUID NOT NULL DEFAULT '12c992da-e2f3-4ea4-b661-7570d2ac7c68'::uuid,
    "code" VARCHAR(3) NOT NULL,
    "name" VARCHAR(100),
    "is_targetcountry" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_ref_country" PRIMARY KEY ("company_id","code")
);

-- CreateTable
CREATE TABLE "ref_fueltype" (
    "name" VARCHAR(10) NOT NULL,
    "description" VARCHAR(50),

    CONSTRAINT "pk_fueltype" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "ref_invoiceterms" (
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(50),

    CONSTRAINT "pk_invoiceterms" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "ref_location" (
    "company_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_ref_location" PRIMARY KEY ("company_id","name")
);

-- CreateTable
CREATE TABLE "ref_maker" (
    "company_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_ref_maker" PRIMARY KEY ("company_id","name")
);

-- CreateTable
CREATE TABLE "ref_roles" (
    "role_name" VARCHAR(25) NOT NULL,
    "description" VARCHAR(50),

    CONSTRAINT "pk_ref_roles" PRIMARY KEY ("role_name")
);

-- CreateTable
CREATE TABLE "ref_users" (
    "user_id" VARCHAR(50) NOT NULL,
    "company_id" UUID NOT NULL,
    "role_name" VARCHAR(25),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "last_login_date" TIMESTAMP(6),

    CONSTRAINT "pk_users" PRIMARY KEY ("user_id","company_id")
);

-- CreateTable
CREATE TABLE "ref_vehicle_type" (
    "company_id" UUID NOT NULL,
    "vehicle_type" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_vehicle_type" PRIMARY KEY ("company_id","vehicle_type")
);

-- CreateTable
CREATE TABLE "t_banktrans" (
    "company_id" UUID NOT NULL,
    "account_number" VARCHAR(30) NOT NULL,
    "seq_no" BIGINT NOT NULL,
    "transaction_date" INTEGER NOT NULL,
    "party_code" VARCHAR(25),
    "amount" DOUBLE PRECISION,
    "currency" VARCHAR(4),
    "drcr" VARCHAR(1),
    "description" VARCHAR(500),
    "is_active" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_banktrans" PRIMARY KEY ("company_id","account_number","seq_no")
);

-- CreateTable
CREATE TABLE "t_journal_entry" (
    "company_id" UUID NOT NULL,
    "date" INTEGER NOT NULL,
    "counterparty_code" VARCHAR(25) NOT NULL,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "is_openingbalance" BOOLEAN,
    "drcr" VARCHAR(1),
    "amount" DOUBLE PRECISION DEFAULT 0,
    "currency" VARCHAR(3),
    "description" VARCHAR(500),
    "is_active" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_t_journal_entry" PRIMARY KEY ("company_id","date","seq","counterparty_code")
);

-- CreateTable
CREATE TABLE "transaction_audit_log" (
    "log_id" UUID NOT NULL,
    "action" VARCHAR(1000) NOT NULL,
    "table_name" VARCHAR(100),
    "old_value" VARCHAR(500),
    "new_value" VARCHAR(500),
    "user_id" VARCHAR(50),
    "company_id" UUID,
    "timestamp" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_trans_audit" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "vehicle" (
    "company_id" UUID NOT NULL,
    "chassis_no" VARCHAR(50) NOT NULL,
    "vehicle_name" VARCHAR(50),
    "grade" VARCHAR(50),
    "manufacture_yyyymm" VARCHAR(7),
    "color" VARCHAR(50),
    "seats" SMALLINT,
    "doors" SMALLINT,
    "mileage" INTEGER,
    "fuel_type" VARCHAR(10),
    "is_auto" BOOLEAN,
    "is_ac" BOOLEAN,
    "is_power_steering" BOOLEAN,
    "is_power_lock" BOOLEAN,
    "is_power_mirror" BOOLEAN,
    "is_power_windows" BOOLEAN,
    "is_sun_roof" BOOLEAN,
    "is_high_roof" BOOLEAN,
    "is_4wd" BOOLEAN,
    "is_alloy_wheel" BOOLEAN,
    "is_sun_glass" BOOLEAN,
    "is_full_option" BOOLEAN,
    "gear_type" VARCHAR(5),
    "vehicle_location" VARCHAR(50),
    "inspection_rank" DOUBLE PRECISION,
    "remarks" VARCHAR(255),
    "cc" INTEGER,
    "engine_no" VARCHAR(50),
    "vehicle_type" VARCHAR(50),
    "maker" VARCHAR(50),
    "auction_ref_no" VARCHAR(50),
    "target_country" VARCHAR(3),
    "is_active" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_vehicle" PRIMARY KEY ("company_id","chassis_no")
);

-- CreateTable
CREATE TABLE "vehicle_attachments" (
    "company_id" UUID NOT NULL,
    "chassis_no" VARCHAR(50) NOT NULL,
    "seq_no" INTEGER NOT NULL DEFAULT 0,
    "document_type" VARCHAR(10),
    "file_name" VARCHAR(100),
    "comment" VARCHAR(100),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(30),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(30),

    CONSTRAINT "pk_am_attachments" PRIMARY KEY ("company_id","chassis_no","seq_no")
);

-- CreateTable
CREATE TABLE "vehicle_documentation" (
    "company_id" UUID NOT NULL DEFAULT '12c992da-e2f3-4ea4-b661-7570d2ac7c68'::uuid,
    "chassis_no" VARCHAR(30) NOT NULL,
    "startdate" INTEGER,
    "shakensho_jyotoshomeisho" BOOLEAN,
    "shakensho_inijyou" BOOLEAN,
    "shakensho_inkanshomeisho" BOOLEAN,
    "shakensho_tourokujikou" BOOLEAN,
    "shakensho_jibaiseki" BOOLEAN,
    "ichiji_jyoutoshomeisho" BOOLEAN,
    "export_jyotoshomeisho" BOOLEAN,
    "export_inijyou" BOOLEAN,
    "parts_houshousho" BOOLEAN,
    "parts_torisetsu" BOOLEAN,
    "parts_kirokubo" BOOLEAN,
    "parts_sparekey" BOOLEAN,
    "parts_navirom" BOOLEAN,
    "parts_remotecontroller" BOOLEAN,
    "parts_cd_magazine" BOOLEAN,
    "parts_other" VARCHAR(60),
    "out_changetype" VARCHAR(50),
    "out_exportschedule" INTEGER,
    "out_changedate" INTEGER,
    "out_senddate" INTEGER,
    "sendto" VARCHAR(50),
    "salestatus" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(30),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(30),

    CONSTRAINT "pk_vehicle_documentation" PRIMARY KEY ("company_id","chassis_no")
);

-- CreateTable
CREATE TABLE "vehicle_invoice" (
    "company_id" UUID NOT NULL DEFAULT '12c992da-e2f3-4ea4-b661-7570d2ac7c68'::uuid,
    "invoice_no" VARCHAR(18) NOT NULL,
    "line_no" INTEGER NOT NULL,
    "date" INTEGER,
    "sailing_date" INTEGER,
    "vessel" VARCHAR(50),
    "from_port" VARCHAR(50),
    "to_port" VARCHAR(50),
    "buyer_code" VARCHAR(7),
    "buyername" VARCHAR(50),
    "buyer_address1" VARCHAR(50),
    "buyer_address2" VARCHAR(50),
    "buyer_address3" VARCHAR(50),
    "lc_number" VARCHAR(50),
    "invoiceof" VARCHAR(50),
    "shipping_mark1" VARCHAR(20),
    "shipping_mark2" VARCHAR(20),
    "shipping_mark3" VARCHAR(20),
    "director_name" VARCHAR(50),
    "chassis_no" VARCHAR(30),
    "currency" VARCHAR(4),
    "cost" DOUBLE PRECISION,
    "freight" DOUBLE PRECISION,
    "description" VARCHAR(200),
    "unit" INTEGER,
    "amount" DOUBLE PRECISION,
    "amount_words" VARCHAR(100),
    "amount_total" DOUBLE PRECISION,
    "amounttotal_words" VARCHAR(100),
    "lc_detail_1" VARCHAR(60),
    "lc_detail_2" VARCHAR(60),
    "lc_detail_3" VARCHAR(60),
    "lc_detail_4" VARCHAR(60),
    "lc_detail_5" VARCHAR(60),
    "lc_detail_6" VARCHAR(60),
    "notify" VARCHAR(35),
    "notify_address1" VARCHAR(50),
    "notify_address2" VARCHAR(50),
    "notify_address3" VARCHAR(50),
    "engine_no" VARCHAR(20),
    "idf" VARCHAR(20),
    "stock_no" VARCHAR(20),
    "tax_line" VARCHAR(50),
    "pay_terms" VARCHAR(50),
    "netweight" VARCHAR(50),
    "length_cm" VARCHAR(50),
    "width_cm" VARCHAR(50),
    "height_cm" VARCHAR(50),
    "is_active" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(30),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(30),

    CONSTRAINT "pk_vehicle_invoice" PRIMARY KEY ("company_id","invoice_no","line_no")
);

-- CreateTable
CREATE TABLE "vehicle_invoice_local" (
    "company_id" UUID DEFAULT '12c992da-e2f3-4ea4-b661-7570d2ac7c68'::uuid,
    "invoice_no" VARCHAR(14) NOT NULL,
    "line_no" INTEGER NOT NULL,
    "date" INTEGER NOT NULL,
    "buyer_code" VARCHAR(10),
    "buyername" VARCHAR(50),
    "address1" VARCHAR(50),
    "address2" VARCHAR(50),
    "address3" VARCHAR(50),
    "chassis_no" VARCHAR(30),
    "price" INTEGER,
    "recycle" INTEGER,
    "road_tax" INTEGER,
    "description" VARCHAR(200),
    "amount" INTEGER,
    "amount_total" INTEGER,
    "total_words" VARCHAR(50),
    "detail_1" VARCHAR(60),
    "detail_2" VARCHAR(60),
    "detail_3" VARCHAR(60),
    "detail_4" VARCHAR(60),
    "detail_5" VARCHAR(60),
    "detail_6" VARCHAR(60),
    "tax_line" VARCHAR(50),
    "stock_no" VARCHAR(20),

    CONSTRAINT "pk_invoice_local" PRIMARY KEY ("invoice_no","line_no")
);

-- CreateTable
CREATE TABLE "vehicle_local_transport" (
    "company_id" UUID NOT NULL,
    "chassis_no" VARCHAR(50) NOT NULL,
    "local_transport_date" INTEGER NOT NULL,
    "local_transporter_code" VARCHAR(25),
    "local_transporter_name" VARCHAR(100),
    "local_transport_charges" DOUBLE PRECISION DEFAULT 0,
    "local_transport_currency" VARCHAR(3),
    "remarks" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_vehicle_local_transport" PRIMARY KEY ("company_id","chassis_no","local_transport_date")
);

-- CreateTable
CREATE TABLE "vehicle_purchase" (
    "company_id" UUID NOT NULL,
    "chassis_no" VARCHAR(50) NOT NULL,
    "purchase_date" INTEGER NOT NULL,
    "supplier_code" VARCHAR(25) NOT NULL,
    "supplier_name" VARCHAR(100),
    "currency" VARCHAR(3),
    "purchase_cost" DOUBLE PRECISION DEFAULT 0,
    "tax" DOUBLE PRECISION,
    "commission" REAL,
    "recycle_fee" DOUBLE PRECISION,
    "auction_fee" DOUBLE PRECISION,
    "road_tax" DOUBLE PRECISION,
    "total_vehicle_fee" DOUBLE PRECISION,
    "payment_date" INTEGER,
    "purchase_remarks" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_am_purchase" PRIMARY KEY ("company_id","chassis_no")
);

-- CreateTable
CREATE TABLE "vehicle_repair" (
    "company_id" UUID NOT NULL,
    "chassis_no" VARCHAR(50) NOT NULL,
    "repair_date" INTEGER NOT NULL,
    "repairer_code" VARCHAR(25),
    "repairer_name" VARCHAR(100),
    "repair_charges" DOUBLE PRECISION DEFAULT 0,
    "repair_currency" VARCHAR(3),
    "remarks" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_vehicle_repair" PRIMARY KEY ("company_id","chassis_no","repair_date")
);

-- CreateTable
CREATE TABLE "vehicle_sales" (
    "company_id" UUID NOT NULL,
    "chassis_no" VARCHAR(50) NOT NULL,
    "sales_date" INTEGER NOT NULL,
    "buyer_code" VARCHAR(25) NOT NULL,
    "buyer_name" VARCHAR(100),
    "selling_price" DOUBLE PRECISION DEFAULT 0,
    "buyers_claim" DOUBLE PRECISION DEFAULT 0,
    "currency" VARCHAR(3),
    "remarks" VARCHAR(500),
    "payment_received" BOOLEAN,
    "conversion_rate" DOUBLE PRECISION DEFAULT 1,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_sales" PRIMARY KEY ("company_id","chassis_no")
);

-- CreateTable
CREATE TABLE "vehicle_shipment" (
    "company_id" UUID NOT NULL,
    "chassis_no" VARCHAR(50) NOT NULL,
    "shipment_date" INTEGER,
    "shipper_code" VARCHAR(25),
    "shipper_name" VARCHAR(100),
    "vessel_name" VARCHAR(50),
    "bl_no" VARCHAR(25),
    "is_roro" BOOLEAN,
    "container_no" VARCHAR(35),
    "load_unload_charges" DOUBLE PRECISION DEFAULT 0,
    "shipment_charges" DOUBLE PRECISION DEFAULT 0,
    "storage_charges" DOUBLE PRECISION DEFAULT 0,
    "freight_charges" DOUBLE PRECISION DEFAULT 0,
    "misc_expense" DOUBLE PRECISION,
    "destination" VARCHAR(50),
    "shipment_remarks" VARCHAR(500),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "pk_shipment" PRIMARY KEY ("company_id","chassis_no")
);

-- CreateTable
CREATE TABLE "vehicle_shippinginstructions" (
    "company_id" UUID NOT NULL DEFAULT '12c992da-e2f3-4ea4-b661-7570d2ac7c68'::uuid,
    "seq" BIGINT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "date" INTEGER NOT NULL,
    "chassis_no" VARCHAR(30),
    "shipping_agent" VARCHAR(50),
    "packing" VARCHAR(10),
    "consignee_name" VARCHAR(50),
    "consignee_address" VARCHAR(1000),
    "consignee_phone" VARCHAR(50),
    "notify_name" VARCHAR(50),
    "notify_address" VARCHAR(1000),
    "notify_phone" VARCHAR(50),
    "source" VARCHAR(100),
    "destination" VARCHAR(100),
    "shippingmark1" VARCHAR(50),
    "shippingmark2" VARCHAR(50),
    "shippingmark3" VARCHAR(50),
    "group_no" VARCHAR(10),
    "length_cm" DOUBLE PRECISION,
    "width_cm" DOUBLE PRECISION,
    "height_cm" DOUBLE PRECISION,
    "net_weight" DOUBLE PRECISION,
    "gross_weight" DOUBLE PRECISION,
    "fob_cost" DOUBLE PRECISION,
    "currency" DOUBLE PRECISION,

    CONSTRAINT "pk_vehicle_shippinginstructions" PRIMARY KEY ("company_id","seq","line_no")
);

-- AddForeignKey
ALTER TABLE "ref_bank" ADD CONSTRAINT "fk_bank_companies" FOREIGN KEY ("company_id") REFERENCES "ref_companies"("company_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "ref_contact" ADD CONSTRAINT "fk_contact_company" FOREIGN KEY ("company_id") REFERENCES "ref_companies"("company_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "ref_users" ADD CONSTRAINT "fk_user_company" FOREIGN KEY ("company_id") REFERENCES "ref_companies"("company_id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "ref_users" ADD CONSTRAINT "fk_user_role" FOREIGN KEY ("role_name") REFERENCES "ref_roles"("role_name") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "t_banktrans" ADD CONSTRAINT "fk_banktrans__bank" FOREIGN KEY ("company_id", "account_number") REFERENCES "ref_bank"("company_id", "account_number") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "t_banktrans" ADD CONSTRAINT "fk_banktrans_contact" FOREIGN KEY ("company_id", "party_code") REFERENCES "ref_contact"("company_id", "code") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "t_journal_entry" ADD CONSTRAINT "fk_journal_contact" FOREIGN KEY ("company_id", "counterparty_code") REFERENCES "ref_contact"("company_id", "code") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "fk_vehicle_company" FOREIGN KEY ("company_id") REFERENCES "ref_companies"("company_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_attachments" ADD CONSTRAINT "fk_attachments_vehicle" FOREIGN KEY ("company_id", "chassis_no") REFERENCES "vehicle"("company_id", "chassis_no") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_local_transport" ADD CONSTRAINT "fk_transport_transporter" FOREIGN KEY ("company_id", "local_transporter_code") REFERENCES "ref_contact"("company_id", "code") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_local_transport" ADD CONSTRAINT "fk_transport_vehicle" FOREIGN KEY ("company_id", "chassis_no") REFERENCES "vehicle"("company_id", "chassis_no") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_purchase" ADD CONSTRAINT "fk_purchase_supplier" FOREIGN KEY ("company_id", "supplier_code") REFERENCES "ref_contact"("company_id", "code") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_purchase" ADD CONSTRAINT "fk_purchase_vehicle" FOREIGN KEY ("company_id", "chassis_no") REFERENCES "vehicle"("company_id", "chassis_no") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_repair" ADD CONSTRAINT "fk_repair_contact" FOREIGN KEY ("company_id", "repairer_code") REFERENCES "ref_contact"("company_id", "code") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_repair" ADD CONSTRAINT "fk_repair_vehicle" FOREIGN KEY ("company_id", "chassis_no") REFERENCES "vehicle"("company_id", "chassis_no") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_sales" ADD CONSTRAINT "fk_sales_buyer" FOREIGN KEY ("company_id", "buyer_code") REFERENCES "ref_contact"("company_id", "code") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_sales" ADD CONSTRAINT "fk_sales_vehicle" FOREIGN KEY ("company_id", "chassis_no") REFERENCES "vehicle"("company_id", "chassis_no") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_shipment" ADD CONSTRAINT "fk_shipment_shipper" FOREIGN KEY ("company_id", "shipper_code") REFERENCES "ref_contact"("company_id", "code") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_shipment" ADD CONSTRAINT "fk_shipment_vehicle" FOREIGN KEY ("company_id", "chassis_no") REFERENCES "vehicle"("company_id", "chassis_no") ON DELETE RESTRICT ON UPDATE RESTRICT;

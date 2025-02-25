/*==============================================================*/
/* DBMS name:      PostgreSQL 9.x                               */
/* Created on:     2025-02-16 2:32:54 AM                        */
/*==============================================================*/


drop view v_activebanks;

drop table public.ref_bank;

drop table public.ref_color;

drop table public.ref_companies;

drop table public.ref_contact;

drop table public.ref_country;

drop table public.ref_fueltype;

drop table public.ref_invoiceterms;

drop table public.ref_location;

drop table public.ref_maker;

drop table ref_roles;

drop table public.ref_shipping_agent;

drop table public.ref_users;

drop table public.ref_vehicle_type;

drop table public.t_banktrans;

drop table public.t_journal_entry;

drop table public.transaction_audit_log;

drop table public.vehicle;

drop table public.vehicle_attachments;

drop table public.vehicle_documentation;

drop table public.vehicle_invoice;

drop table public.vehicle_invoice_local;

drop table public.vehicle_local_transport;

drop table public.vehicle_purchase;

drop table public.vehicle_repair;

drop table public.vehicle_sales;

drop table public.vehicle_shipment;

drop table public.vehicle_shippinginstructions;

drop domain typ_YYYYMMDD;

drop domain typ_chassis;

drop domain typ_company_id;

drop domain typ_contact_code;

drop domain typ_cur;

drop domain typ_email;

drop domain typ_user_id;

/*==============================================================*/
/* User: public                                                 */
/*==============================================================*/
/*==============================================================*/
/* Domain: typ_YYYYMMDD                                         */
/*==============================================================*/
create domain typ_YYYYMMDD as INT4;

comment on domain typ_YYYYMMDD is
'Std Date fotmat in Numeric is YYYYMMDD';

/*==============================================================*/
/* Domain: typ_chassis                                          */
/*==============================================================*/
create domain typ_chassis as VARCHAR(50);

comment on domain typ_chassis is
'Chassis Number';

/*==============================================================*/
/* Domain: typ_company_id                                       */
/*==============================================================*/
create domain typ_company_id as uuid;

comment on domain typ_company_id is
'carobar customer';

/*==============================================================*/
/* Domain: typ_contact_code                                     */
/*==============================================================*/
create domain typ_contact_code as VARCHAR(25);

comment on domain typ_contact_code is
'Buyer, Supplier ...';

/*==============================================================*/
/* Domain: typ_cur                                              */
/*==============================================================*/
create domain typ_cur as VARCHAR(3);

comment on domain typ_cur is
'Currency';

/*==============================================================*/
/* Domain: typ_email                                            */
/*==============================================================*/
create domain typ_email as VARCHAR(50);

comment on domain typ_email is
'Rmail';

/*==============================================================*/
/* Domain: typ_user_id                                          */
/*==============================================================*/
create domain typ_user_id as VARCHAR(50);

comment on domain typ_user_id is
'logged in user id';

/*==============================================================*/
/* Table: ref_bank                                              */
/*==============================================================*/
create table public.ref_bank (
   company_id           typ_company_id       not null,
   account_number       varchar(30)          not null,
   bank_name            varchar(100)         not null,
   bank_branch          varchar(100)         null,
   currency             typ_cur              null,
   description          varchar(500)         null,
   is_default           bool                 null,
   is_active            bool                 null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_ref_bank primary key (company_id, account_number)
);

comment on table public.ref_bank is
'Bank static details be used by Carobar customers';

comment on column ref_bank.is_default is
'Default Bank used by Carobar customer. Only 1 bank can be marked as default per company';

/*==============================================================*/
/* Table: ref_color                                             */
/*==============================================================*/
create table public.ref_color (
   company_id           typ_company_id       not null,
   color                varchar(50)          not null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_color primary key (company_id, color)
);

comment on table public.ref_color is
'List of Colors';

/*==============================================================*/
/* Table: ref_companies                                         */
/*==============================================================*/
create table public.ref_companies (
   company_id           typ_company_id       not null,
   company_name         varchar(100)         not null,
   address1             varchar(255)         null,
   address2             varchar(255)         null,
   address3             varchar(255)         null,
   country              varchar(3)           null,
   phone                varchar(25)          null,
   mobile               varchar(25)          null,
   email                typ_email            null,
   is_active            bool                 null,
   base_currency        typ_cur              null,
   lastopeningday       typ_YYYYMMDD         null,
   lastinvoiceno        int4                 null default 0,
   lastlocalinvoice     int4                 null default 0,
   taxpercent           FLOAT4               null,
   report_prefix        varchar(8)           null default 'carobar',
   last_login_date      TIMESTAMP            null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   constraint pk_companies primary key (company_id)
);

comment on table public.ref_companies is
'Stores information about the companies registering for the SaaS platform.';

comment on column ref_companies.lastopeningday is
'Annual Account Opening Day in YYYYMMDD';

comment on column ref_companies.lastinvoiceno is
'Last invoice No. Incremental for every Unique invoice generation';

comment on column ref_companies.lastlocalinvoice is
'Last Local invoice No. Incremental for every Unique invoice generation';

comment on column ref_companies.taxpercent is
'GST or consumption Tax rate';

comment on column ref_companies.report_prefix is
'optional prefix to generate unique report numbers';

comment on column ref_companies.last_login_date is
'Last date when any user logged in for the company';

/*==============================================================*/
/* Table: ref_contact                                           */
/*==============================================================*/
create table public.ref_contact (
   company_id           typ_company_id       not null,
   code                 typ_contact_code     not null,
   name                 varchar(100)         null,
   address1             varchar(255)         null,
   address2             varchar(255)         null,
   address3             varchar(255)         null,
   phone                varchar(25)          null,
   mobile               varchar(25)          null,
   fax                  varchar(25)          null,
   email                typ_email            null,
   is_active            bool                 null,
   comment              varchar(255)         null,
   is_supplier          BOOL                 null default false,
   is_buyer             BOOL                 null default false,
   is_repair            BOOL                 null default false,
   is_localtransport    BOOL                 null default false,
   is_shipper           BOOL                 null default false,
   is_journal           bool                 null default false,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_ref_transport primary key (company_id, code)
);

comment on table public.ref_contact is
'List of contacts to do business transactions like buying / selling / repair etc ';

comment on column ref_contact.company_id is
'Parent Company ID';

comment on column ref_contact.code is
'Unique  Code for the Contact.';

comment on column ref_contact.name is
'Contact Name';

comment on column ref_contact.is_active is
'true is the contact is still in use';

comment on column ref_contact.comment is
'any specific comment or free note ';

comment on column ref_contact.is_journal is
'True when Contact purpose is to use for journal entry as well';

/*==============================================================*/
/* Table: ref_country                                           */
/*==============================================================*/
create table public.ref_country (
   company_id           uuid                 not null default '12c992da-e2f3-4ea4-b661-7570d2ac7c68',
   code                 varchar(3)           not null,
   name                 varchar(100)         null,
   is_targetcountry     bool                 null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_ref_country primary key (company_id, code)
);

comment on table public.ref_country is
'Reference list of Countries';

comment on column ref_country.code is
'Alpha-3 code';

comment on column ref_country.is_targetcountry is
'Will this Country appear in Company''s Target List of Country
Target List is target country of sales where company does business ';

/*==============================================================*/
/* Table: ref_fueltype                                          */
/*==============================================================*/
create table public.ref_fueltype (
   name                 varchar(10)          not null,
   description          varchar(50)          null,
   constraint pk_fueltype primary key (name)
);

comment on table public.ref_fueltype is
'GAS, DEISEL, EV, HYBRID, CNG, LPG, Hydrogen';

/*==============================================================*/
/* Table: ref_invoiceterms                                      */
/*==============================================================*/
create table public.ref_invoiceterms (
   name                 varchar(50)          not null,
   description          varchar(50)          null,
   constraint pk_invoiceterms primary key (name)
);

comment on table public.ref_invoiceterms is
'CNF | FOB | CIF | CFR';

/*==============================================================*/
/* Table: ref_location                                          */
/*==============================================================*/
create table public.ref_location (
   company_id           typ_company_id       not null,
   name                 varchar(100)         not null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_ref_location primary key (company_id, name)
);

comment on table public.ref_location is
'Descriptive list of Yards where Vehicles are stored';

/*==============================================================*/
/* Table: ref_maker                                             */
/*==============================================================*/
create table public.ref_maker (
   company_id           typ_company_id       not null,
   name                 varchar(100)         not null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_ref_maker primary key (company_id, name)
);

comment on table public.ref_maker is
'Vehicle Maker List';

/*==============================================================*/
/* Table: ref_roles                                             */
/*==============================================================*/
create table ref_roles (
   role_name            VARCHAR(25)          not null,
   constraint PK_REF_ROLES primary key (role_name)
);

comment on table ref_roles is
'Role management for the Application';

comment on column ref_roles.role_name is
'SA : Superadmin
CA : Company Admin
CU : Standar company user';

/*==============================================================*/
/* Table: ref_shipping_agent                                    */
/*==============================================================*/
create table public.ref_shipping_agent (
   company_id           typ_company_id       not null,
   name                 varchar(100)         not null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_shipping_agent primary key (company_id, name)
);

comment on table public.ref_shipping_agent is
'List of Shipping Agents';

/*==============================================================*/
/* Table: ref_users                                             */
/*==============================================================*/
create table public.ref_users (
   user_id              typ_user_id          not null,
   company_id           typ_company_id       not null,
   role_name            VARCHAR(25)          null,
   first_name           varchar(100)         not null,
   last_name            varchar(100)         not null,
   email                typ_email            not null,
   password_hash        varchar(255)         not null,
   is_active            bool                 null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   last_login_date      TIMESTAMP            null,
   constraint pk_users primary key (user_id, company_id)
);

comment on table public.ref_users is
'Stores information about the users associated with each company.';

comment on column ref_users.role_name is
'SA : Superadmin
CA : Company Admin
CU : Standar company user';

comment on column ref_users.last_login_date is
'Last date when any user logged in for the company';

/*==============================================================*/
/* Table: ref_vehicle_type                                      */
/*==============================================================*/
create table public.ref_vehicle_type (
   company_id           typ_company_id       not null,
   vehicle_type         varchar(100)         not null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_vehicle_type primary key (company_id, vehicle_type)
);

comment on column ref_vehicle_type.vehicle_type is
'Sedan, SUV, Truck ...';

/*==============================================================*/
/* Table: t_banktrans                                           */
/*==============================================================*/
create table public.t_banktrans (
   company_id           typ_company_id       not null,
   account_number       varchar(30)          not null,
   seq_no               int8                 not null,
   transaction_date     typ_YYYYMMDD         not null,
   party_code           typ_contact_code     null,
   amount               float8               null,
   currency             varchar(4)           null,
   drcr                 varchar(1)           null,
   description          varchar(500)         null,
   is_active            bool                 null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_banktrans primary key (company_id, account_number, seq_no)
);

comment on table public.t_banktrans is
'Bank Transactions';

comment on column t_banktrans.transaction_date is
'YYYYMMDD';

/*==============================================================*/
/* Table: t_journal_entry                                       */
/*==============================================================*/
create table public.t_journal_entry (
   company_id           typ_company_id       not null,
   date                 typ_YYYYMMDD         not null,
   counterparty_code    typ_contact_code     not null,
   seq                  int4                 not null default 0,
   is_openingbalance    bool                 null,
   drcr                 varchar(1)           null,
   amount               float8               null default 0,
   currency             typ_cur              null,
   description          varchar(500)         null,
   is_active            bool                 null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_t_journal_entry primary key (company_id, date, seq, counterparty_code)
);

comment on table public.t_journal_entry is
'Table to capture pure accounting journal entries';

/*==============================================================*/
/* Table: transaction_audit_log                                 */
/*==============================================================*/
create table public.transaction_audit_log (
   log_id               uuid                 not null,
   action               varchar(1000)        not null,
   table_name           varchar(100)         null,
   old_value            VARCHAR(500)         null,
   new_value            VARCHAR(500)         null,
   user_id              typ_user_id          null,
   company_id           typ_company_id       null,
   "timestamp"          timestamp            null default CURRENT_TIMESTAMP,
   constraint pk_trans_audit primary key (log_id)
);

comment on table public.transaction_audit_log is
'Logs important  changes made by users';

comment on column transaction_audit_log.action is
'descriptive text log';

comment on column transaction_audit_log.table_name is
'what table got impacted';

/*==============================================================*/
/* Table: vehicle                                               */
/*==============================================================*/
create table public.vehicle (
   company_id           typ_company_id       not null,
   chassis_no           typ_chassis          not null,
   vehicle_name         varchar(50)          null,
   grade                varchar(50)          null,
   manufacture_yyyymm   varchar(7)           null,
   color                varchar(50)          null,
   seats                int2                 null,
   doors                int2                 null,
   mileage              int4                 null,
   fuel_type            varchar(10)          null,
   is_auto              bool                 null,
   is_ac                bool                 null,
   is_power_steering    bool                 null,
   is_power_lock        bool                 null,
   is_power_mirror      bool                 null,
   is_power_windows     bool                 null,
   is_sun_roof          bool                 null,
   is_high_roof         bool                 null,
   is_4wd               bool                 null,
   is_alloy_wheel       bool                 null,
   is_sun_glass         bool                 null,
   is_full_option       bool                 null,
   gear_type            varchar(5)           null,
   vehicle_location     varchar(50)          null,
   inspection_rank      float8               null,
   remarks              varchar(255)         null,
   cc                   int4                 null,
   engine_no            varchar(50)          null,
   vehicle_type         varchar(50)          null,
   maker                varchar(50)          null,
   payment_date         typ_YYYYMMDD         null,
   auction_ref_no       varchar(50)          null,
   target_country       varchar(3)           null,
   is_active            bool                 null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_vehicle primary key (company_id, chassis_no)
);

comment on column vehicle.fuel_type is
'GAS (Gasoline),  HYB, EV, DIE (Diesel): CNG, LNG, LPG ... ';

comment on column vehicle.cc is
'engine capacity in cubic meters';

comment on column vehicle.payment_date is
'payment schedule after purchase';

comment on column vehicle.auction_ref_no is
'optional auction ref no in case vehicle is bought from auctions ';

comment on column vehicle.target_country is
'intended target country of sale';

/*==============================================================*/
/* Table: vehicle_attachments                                   */
/*==============================================================*/
create table public.vehicle_attachments (
   company_id           typ_company_id       not null,
   chassis_no           typ_chassis          not null,
   seq_no               int4                 not null default 0,
   document_type        varchar(10)          null,
   file_name            varchar(100)         null,
   comment              varchar(100)         null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           varchar(30)          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           varchar(30)          null,
   constraint pk_am_attachments primary key (company_id, chassis_no, seq_no)
);

comment on table public.vehicle_attachments is
'File attachments associated with chassis number';

comment on column vehicle_attachments.document_type is
'pdf, excel, zip, picture';

comment on column vehicle_attachments.file_name is
'filename with extension';

comment on column vehicle_attachments.comment is
'user comments about the document';

/*==============================================================*/
/* Table: vehicle_documentation                                 */
/*==============================================================*/
create table public.vehicle_documentation (
   company_id           uuid                 not null default '12c992da-e2f3-4ea4-b661-7570d2ac7c68',
   chassis_no           varchar(30)          not null,
   startdate            int4                 null,
   shakensho_jyotoshomeisho bool                 null,
   shakensho_inijyou    bool                 null,
   shakensho_inkanshomeisho bool                 null,
   shakensho_tourokujikou bool                 null,
   shakensho_jibaiseki  bool                 null,
   ichiji_jyoutoshomeisho bool                 null,
   export_jyotoshomeisho bool                 null,
   export_inijyou       bool                 null,
   parts_houshousho     bool                 null,
   parts_torisetsu      bool                 null,
   parts_kirokubo       bool                 null,
   parts_sparekey       bool                 null,
   parts_navirom        bool                 null,
   parts_remotecontroller bool                 null,
   parts_cd_magazine    bool                 null,
   parts_other          varchar(60)          null,
   out_changetype       varchar(50)          null,
   out_exportschedule   int4                 null,
   out_changedate       int4                 null,
   out_senddate         int4                 null,
   sendto               varchar(50)          null,
   salestatus           int4                 null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           varchar(30)          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           varchar(30)          null,
   constraint pk_vehicle_documentation primary key (company_id, chassis_no)
);

/*==============================================================*/
/* Table: vehicle_invoice                                       */
/*==============================================================*/
create table public.vehicle_invoice (
   company_id           uuid                 not null default '12c992da-e2f3-4ea4-b661-7570d2ac7c68',
   invoice_no           varchar(18)          not null,
   line_no              int4                 not null,
   date                 int4                 null,
   sailing_date         int4                 null,
   vessel               varchar(50)          null,
   from_port            varchar(50)          null,
   to_port              varchar(50)          null,
   buyer_code           varchar(7)           null,
   buyername            varchar(50)          null,
   buyer_address1       varchar(50)          null,
   buyer_address2       varchar(50)          null,
   buyer_address3       varchar(50)          null,
   lc_number            varchar(50)          null,
   invoiceof            varchar(50)          null,
   shipping_mark1       varchar(20)          null,
   shipping_mark2       varchar(20)          null,
   shipping_mark3       varchar(20)          null,
   director_name        varchar(50)          null,
   chassis_no           varchar(30)          null,
   currency             varchar(4)           null,
   cost                 float8               null,
   freight              float8               null,
   description          varchar(200)         null,
   unit                 int4                 null,
   amount               float8               null,
   amount_words         varchar(100)         null,
   amount_total         float8               null,
   amounttotal_words    varchar(100)         null,
   lc_detail_1          varchar(60)          null,
   lc_detail_2          varchar(60)          null,
   lc_detail_3          varchar(60)          null,
   lc_detail_4          varchar(60)          null,
   lc_detail_5          varchar(60)          null,
   lc_detail_6          varchar(60)          null,
   notify               varchar(35)          null,
   notify_address1      varchar(50)          null,
   notify_address2      varchar(50)          null,
   notify_address3      varchar(50)          null,
   engine_no            varchar(20)          null,
   idf                  varchar(20)          null,
   stock_no             varchar(20)          null,
   tax_line             varchar(50)          null,
   pay_terms            varchar(50)          null,
   netweight            varchar(50)          null,
   length_cm            varchar(50)          null,
   width_cm             varchar(50)          null,
   height_cm            varchar(50)          null,
   is_active            bool                 null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           varchar(30)          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           varchar(30)          null,
   constraint PK_VEHICLE_INVOICE primary key (company_id, invoice_no, line_no)
);

/*==============================================================*/
/* Table: vehicle_invoice_local                                 */
/*==============================================================*/
create table public.vehicle_invoice_local (
   company_id           uuid                 null default '12c992da-e2f3-4ea4-b661-7570d2ac7c68',
   invoice_no           varchar(14)          not null,
   line_no              int4                 not null,
   date                 int4                 not null,
   buyer_code           varchar(10)          null,
   buyername            varchar(50)          null,
   address1             varchar(50)          null,
   address2             varchar(50)          null,
   address3             varchar(50)          null,
   chassis_no           varchar(30)          null,
   price                int4                 null,
   recycle              int4                 null,
   road_tax             int4                 null,
   description          varchar(200)         null,
   amount               int4                 null,
   amount_total         int4                 null,
   total_words          varchar(50)          null,
   detail_1             varchar(60)          null,
   detail_2             varchar(60)          null,
   detail_3             varchar(60)          null,
   detail_4             varchar(60)          null,
   detail_5             varchar(60)          null,
   detail_6             varchar(60)          null,
   tax_line             varchar(50)          null,
   stock_no             varchar(20)          null,
   constraint pk_invoice_local primary key (invoice_no, line_no)
);

/*==============================================================*/
/* Table: vehicle_local_transport                               */
/*==============================================================*/
create table public.vehicle_local_transport (
   company_id           typ_company_id       not null,
   chassis_no           typ_chassis          not null,
   local_transport_date typ_YYYYMMDD         not null,
   local_transporter_code typ_contact_code     null,
   local_transporter_name VARCHAR(100)         null,
   local_transport_charges float8               null default 0,
   local_transport_currency typ_cur              null,
   remarks              varchar(255)         null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_vehicle_local_transport primary key (company_id, chassis_no, local_transport_date)
);

/*==============================================================*/
/* Table: vehicle_purchase                                      */
/*==============================================================*/
create table public.vehicle_purchase (
   company_id           typ_company_id       not null,
   chassis_no           typ_chassis          not null,
   purchase_date        typ_YYYYMMDD         not null,
   supplier_code        typ_contact_code     not null,
   supplier_name        varchar(100)         null,
   currency             typ_cur              null,
   purchase_cost        FLOAT8               null default 0,
   tax                  FLOAT8               null,
   commission           FLOAT4               null,
   recycle_fee          FLOAT8               null,
   auction_fee          FLOAT8               null,
   road_tax             FLOAT8               null,
   total_vehicle_fee    FLOAT8               null,
   payment_date         typ_YYYYMMDD         null,
   purchase_remarks     varchar(255)         null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_am_purchase primary key (company_id, chassis_no)
);

comment on table public.vehicle_purchase is
'Information related to Vehicle Purchase, costs, taxes etc';

comment on column vehicle_purchase.purchase_date is
'Date of Purchase';

comment on column vehicle_purchase.currency is
'default is base currency derived from company table';

comment on column vehicle_purchase.purchase_cost is
'base price of purchase - e.g. bid price for auction purchase';

comment on column vehicle_purchase.tax is
'consumption tax / GST';

comment on column vehicle_purchase.commission is
'optional - in case there is any agent commission fee';

comment on column vehicle_purchase.payment_date is
'payment schedule after purchase';

/*==============================================================*/
/* Table: vehicle_repair                                        */
/*==============================================================*/
create table public.vehicle_repair (
   company_id           typ_company_id       not null,
   chassis_no           typ_chassis          not null,
   repair_date          typ_YYYYMMDD         not null,
   repairer_code        typ_contact_code     null,
   repairer_name        VARCHAR(100)         null,
   repair_charges       float8               null default 0,
   repair_currency      typ_cur              null,
   remarks              varchar(255)         null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_vehicle_repair primary key (company_id, chassis_no, repair_date)
);

/*==============================================================*/
/* Table: vehicle_sales                                         */
/*==============================================================*/
create table public.vehicle_sales (
   company_id           typ_company_id       not null,
   chassis_no           typ_chassis          not null,
   sales_date           typ_YYYYMMDD         not null,
   buyer_code           typ_contact_code     not null,
   buyer_name           varchar(100)         null,
   selling_price        float8               null default 0,
   buyers_claim         float8               null default 0,
   currency             typ_cur              null,
   remarks              varchar(500)         null,
   payment_received     bool                 null,
   conversion_rate      FLOAT8               null default 1,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_sales primary key (company_id, chassis_no)
);

comment on table public.vehicle_sales is
'Sales record';

comment on column vehicle_sales.sales_date is
'Date of Sales';

comment on column vehicle_sales.buyers_claim is
'claim from buyer if any ';

/*==============================================================*/
/* Table: vehicle_shipment                                      */
/*==============================================================*/
create table public.vehicle_shipment (
   company_id           typ_company_id       not null,
   chassis_no           typ_chassis          not null,
   shipment_date        typ_YYYYMMDD         null,
   shipper_code         typ_contact_code     null,
   shipper_name         VARCHAR(100)         null,
   vessel_name          varchar(50)          null,
   bl_no                varchar(25)          null,
   is_roro              bool                 null,
   container_no         varchar(35)          null,
   load_unload_charges  FLOAT8               null default 0,
   shipment_charges     FLOAT8               null default 0,
   storage_charges      FLOAT8               null default 0,
   freight_charges      FLOAT8               null default 0,
   misc_expense         FLOAT8               null,
   destination          varchar(50)          null,
   shipment_remarks     varchar(500)         null,
   created_at           timestamp            null default CURRENT_TIMESTAMP,
   created_by           typ_user_id          null,
   updated_at           timestamp            null default CURRENT_TIMESTAMP,
   updated_by           typ_user_id          null,
   constraint pk_shipment primary key (company_id, chassis_no)
);

comment on table public.vehicle_shipment is
'Table to register shipment details when shipping abroad';

comment on column vehicle_shipment.shipment_date is
'Intended date of Shipment';

comment on column vehicle_shipment.vessel_name is
'Name of Ship';

comment on column vehicle_shipment.bl_no is
' bill of lading';

comment on column vehicle_shipment.is_roro is
'Roll-on/roll-off';

comment on column vehicle_shipment.container_no is
'Container Number - incase shipment is done using container';

comment on column vehicle_shipment.load_unload_charges is
'Load and unload charges to move vehicle on ship';

comment on column vehicle_shipment.shipment_charges is
'base shipment charge for the vehicle';

comment on column vehicle_shipment.destination is
'Destination Port';

/*==============================================================*/
/* Table: vehicle_shippinginstructions                          */
/*==============================================================*/
create table public.vehicle_shippinginstructions (
   company_id           uuid                 not null default '12c992da-e2f3-4ea4-b661-7570d2ac7c68',
   seq                  int8                 not null,
   line_no              int4                 not null,
   date                 int4                 not null,
   chassis_no           varchar(30)          null,
   shipping_agent       varchar(50)          null,
   packing              varchar(10)          null,
   consignee_name       varchar(50)          null,
   consignee_address    varchar(1000)        null,
   consignee_phone      varchar(50)          null,
   notify_name          varchar(50)          null,
   notify_address       varchar(1000)        null,
   notify_phone         varchar(50)          null,
   source               varchar(100)         null,
   destination          varchar(100)         null,
   shippingmark1        varchar(50)          null,
   shippingmark2        varchar(50)          null,
   shippingmark3        varchar(50)          null,
   group_no             varchar(10)          null,
   length_cm            float8               null,
   width_cm             float8               null,
   height_cm            float8               null,
   net_weight           float8               null,
   gross_weight         float8               null,
   fob_cost             float8               null,
   currency             float8               null,
   constraint pk_vehicle_shippinginstructions primary key (company_id, seq, line_no)
);

/*==============================================================*/
/* View: v_activebanks                                          */
/*==============================================================*/
create or replace view v_activebanks as
SELECT c.company_name,
    c.company_id,
    b.account_number,
    b.bank_name,
    b.bank_branch,
    b.currency,
    b.description,
    b.is_default
   FROM ref_bank b
     JOIN ref_companies c ON b.company_id::uuid = c.company_id::uuid
  WHERE b.is_active = true AND c.is_active = true
  ORDER BY c.company_name, b.is_default DESC, b.account_number;

alter table ref_bank
   add constraint fk_bank_companies foreign key (company_id)
      references ref_companies (company_id)
      on delete restrict on update restrict;

alter table ref_contact
   add constraint fk_contact_company foreign key (company_id)
      references ref_companies (company_id)
      on delete restrict on update restrict;

alter table ref_users
   add constraint fk_user_company foreign key (company_id)
      references ref_companies (company_id)
      on delete cascade on update restrict;

alter table ref_users
   add constraint fk_user_role foreign key (role_name)
      references ref_roles (role_name)
      on delete restrict on update restrict;

alter table t_banktrans
   add constraint fk_banktrans__bank foreign key (company_id, account_number)
      references ref_bank (company_id, account_number)
      on delete restrict on update restrict;

alter table t_banktrans
   add constraint fk_banktrans_contact foreign key (company_id, party_code)
      references ref_contact (company_id, code)
      on delete restrict on update restrict;

alter table t_journal_entry
   add constraint fk_journal_contact foreign key (company_id, counterparty_code)
      references ref_contact (company_id, code)
      on delete restrict on update restrict;

alter table vehicle
   add constraint fk_vehicle_company foreign key (company_id)
      references ref_companies (company_id)
      on delete restrict on update restrict;

alter table vehicle_attachments
   add constraint fk_attachments_vehicle foreign key (company_id, chassis_no)
      references vehicle (company_id, chassis_no)
      on delete restrict on update restrict;

alter table vehicle_local_transport
   add constraint fk_transport_transporter foreign key (company_id, local_transporter_code)
      references ref_contact (company_id, code)
      on delete restrict on update restrict;

alter table vehicle_local_transport
   add constraint fk_transport_vehicle foreign key (company_id, chassis_no)
      references vehicle (company_id, chassis_no)
      on delete restrict on update restrict;

alter table vehicle_purchase
   add constraint fk_purchase_supplier foreign key (company_id, supplier_code)
      references ref_contact (company_id, code)
      on delete restrict on update restrict;

alter table vehicle_purchase
   add constraint fk_purchase_vehicle foreign key (company_id, chassis_no)
      references vehicle (company_id, chassis_no)
      on delete restrict on update restrict;

alter table vehicle_repair
   add constraint fk_repair_contact foreign key (company_id, repairer_code)
      references ref_contact (company_id, code)
      on delete restrict on update restrict;

alter table vehicle_repair
   add constraint fk_repair_vehicle foreign key (company_id, chassis_no)
      references vehicle (company_id, chassis_no)
      on delete restrict on update restrict;

alter table vehicle_sales
   add constraint fk_sales_buyer foreign key (company_id, buyer_code)
      references ref_contact (company_id, code)
      on delete restrict on update restrict;

alter table vehicle_sales
   add constraint fk_sales_vehicle foreign key (company_id, chassis_no)
      references vehicle (company_id, chassis_no)
      on delete restrict on update restrict;

alter table vehicle_shipment
   add constraint fk_shipment_shipper foreign key (company_id, shipper_code)
      references ref_contact (company_id, code)
      on delete restrict on update restrict;

alter table vehicle_shipment
   add constraint fk_shipment_vehicle foreign key (company_id, chassis_no)
      references vehicle (company_id, chassis_no)
      on delete restrict on update restrict;


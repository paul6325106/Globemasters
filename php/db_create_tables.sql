
/* 
 * Each dataset is uniquely identified. There's some optional fields to assist
 * with identifying the dataset. The only field to pay any particular mind to is
 * the country_identifier value, which describes how countries are identified in
 * the dataset (either by name or an ISO 3166 code).
 */

CREATE TABLE `datasets` ( 
`dataset_id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, 
`name` VARCHAR(20) UNIQUE COMMENT "A name for this dataset, just for general identifiability's sake.", 
`description` VARCHAR(255) COMMENT "(Optional) a brief description of this dataset.", 
`owner` VARCHAR(35) COMMENT "(Optional) the name of the person who is associated with this dataset.",
`country_identifier` ENUM("name", "iso_a2", "iso_a3", "iso_n3") NOT NULL COMMENT "The data used to identify countries in this dataset: name, or ISO 3166 Alpha-2, Alpha-3 or Numeric-3."
) ENGINE = InnoDB;

/* 
 * Rather than storing strings for the country in each data entry, we'll store
 * them here. Values are quite likely to be repeated between datasets, and
 * guarenteed to be repeated inside datasets. We build and update this, instead
 * of just starting with a premade database of names and codes, because ISO
 * codes can change over time and we may need to support outdated datasets.
 */

CREATE TABLE `countries` (
`country_id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, 
`value` VARCHAR(56) NOT NULL COMMENT "The value used to associate the data with a country. May be a few characters (an ISO code) or as much as 56 chars (as per the longest country name, according to Google)." 
) ENGINE = InnoDB;

/* 
 * Using a table instead of an enum for the field datatype, because there may be
 * changes in future (like with the introduction of videos or sounds).
 */

CREATE TABLE `field_datatypes` (
`datatype_id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, 
`name` VARCHAR(20) NOT NULL
) ENGINE = InnoDB;

/* 
 * 
 */

CREATE TABLE `fields` (
`field_id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, 
`name` VARCHAR(100) NOT NULL,
`datatype` INT UNSIGNED NOT NULL,
FOREIGN KEY (datatype) REFERENCES field_datatypes(datatype_id) ON DELETE CASCADE
) ENGINE = InnoDB;

/* 
 * 
 */

CREATE TABLE `data_entries` ( 
`data_id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, 
`dataset_id` INT UNSIGNED NOT NULL, 
`country_id` INT UNSIGNED NOT NULL,
`field_id` INT UNSIGNED NOT NULL,
`val` VARCHAR(255) NOT NULL COMMENT "A string value. Might be a piece of information, might be a path. Depends on the dataset.", 
FOREIGN KEY (dataset_id) REFERENCES datasets(dataset_id) ON DELETE CASCADE,
FOREIGN KEY (country_id) REFERENCES countries(country_id) ON DELETE CASCADE,
FOREIGN KEY (field_id) REFERENCES fields(field_id) ON DELETE CASCADE
) ENGINE = InnoDB;

<?php

define( 'WP_CACHE', true );
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'shokhbari' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'TKL;K>LkE:[_hB<H1{0fX[kRd>Y~pH-%gFb[4YEhZM[:(j;[kHnhp.pQF-t.~[o7' );
define( 'SECURE_AUTH_KEY',  'p$#HPtkOw~noet &lheFnwro1?aRC6YkR{BN!U_z>@.#?e>;^@s>!%/c>D~+;73^' );
define( 'LOGGED_IN_KEY',    'EyAp,W3*j([Mmk7rR2=RT~DcmG 1}aayJN-fqH*m<K-[t]8Luwy%IB_)Di_[qcd4' );
define( 'NONCE_KEY',        '7onBT Nyo?s5 pd7pqW( X{$9de`oz2z#rA$yIRD((+3uUfw938WMJ y *qLyfH(' );
define( 'AUTH_SALT',        '>wut9~7eGVN((DgDyltVaP:UZsnIyv*58)L8n(X,:wwnt=RoN;V5V=:e#I1yL9;]' );
define( 'SECURE_AUTH_SALT', '5$/$w7d3Zsm@nQck%5#mYKA:E&a%zXr*ny:$*k2oSgo17b7Gsx|DEgWn2t0^!KbD' );
define( 'LOGGED_IN_SALT',   ':|aFjyI#%f?d74BabVnd0UhdyEc)7~c>0+B6mur*V-5*cpmq-6(r]jQR%Y@MC f4' );
define( 'NONCE_SALT',       '7+V_6QfC<r!LKK#TM*-g`@|Yu6R&m5AGLJ!diJs,<8ZGKU*l$Ps!MG`B@MV3&[D]' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'sb_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

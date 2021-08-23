<?php
namespace WooLentorBlocks\Api;

use Exception;
use WP_REST_Server;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load general WP action hook
 */
class Api {

	/**
	 * The Constructor.
	 */
	public function __construct() {
		$this->namespace = 'woolentor/v1';
	}

	/**
	 * Resgister routes
	 */
	public function register_routes() {

        register_rest_route(  $this->namespace, 'category', 
            [
                'methods' => WP_REST_Server::READABLE,
                'args' => [
                    'querySlug'  => [],
                    'queryLimit' => [],
                    'queryOrder' => [],
                    'queryType'  => [],
                    'wpnonce'    => []
                ],
                'callback'            => [ $this, 'get_category_data' ],
                'permission_callback' => [ $this, 'permission_check' ],
            ]
        );

	}

    /**
     * Api permission check
     */
    public function permission_check() {
        if( current_user_can( 'edit_posts' ) ){
            return true;
        }else{
            return false;
        }
    }

    /**
     * Get category data
     */
    public function get_category_data( $request ){
        
        if ( !wp_verify_nonce( $_REQUEST['wpnonce'], 'woolentorblock-nonce') ){
            return rest_ensure_response([]);
        }

        $data = woolentorBlocks_taxnomy_data( $request['querySlug'], $request['queryLimit'], $request['queryOrder'], $request['queryType'] );
        return rest_ensure_response( $data );

    }

	
}

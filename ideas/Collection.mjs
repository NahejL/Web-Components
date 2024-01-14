

export default class Collection {

	#internal

	// Associative Collections have idempotent keys; the getter is only affected by the setter of the same key
	// ie: Set, MultiSet, Map; this is akin to Indices
	isAssociative( key ) {}
	getAssociations() {}

	// Linear Collections have keys with ordering properties
	// ie: List, Stack, Queue; this is akin to Compound Keys
	isLinear( key ) {}
	getLinearOrderings() {}

	/* Compound keys:
		An entry may be identified by many keys.
		eg: getKey = entry => [ entry[0], entry[1] ]
		For such, each key may be Associative OR Linear in type.
		A linear key would not behave as expected with associative operations ( "delete" never replaces it ).
		An associative key would not behave as expected with linear operations ( "splice" changes other entries ).

		A Collection may have both types of keys.

		*/

	// associative operators
	get( key ) {}
	set( entry ) {}
	has( key ) {}
	delete( key ) {}

	// linear operators
	push( value, order ) {} // reverse -> unshift
	pop( value, order ) {} // reverse -> shift
	splice( from, to, ...values ) {}

	clear() {}
	get count() {}
	get size() {} // for constrained collection, entries not set

	;[Symbol.iterator]() {}

	// default constructs a Set
	constructor({
		getKey = Collection.Identity,
		setKey = Collection.Entry
		} = {} ) {

		if( getKey == Collection.Identity
	   && setKey == Collection.Identity ) {

			this.#internal = new Set

			}

		}

	static Identity = ( entry, collection ) => entry 
	static Entry = ( key, value, collection ) => [ key, value ]

	}
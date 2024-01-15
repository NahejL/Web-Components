
import Collection from "../ideas/Collection.mjs"


class GraphView {

	#observer

	// WeakMaps, like Symbols, cannot provide the whole set.
	// Hence I need a Map of WeakRef -> data.
	// Hence I need a WeakMap of Element -> WeakRef.
	// If the element is disposed unexpectedly, the Map’s ref’s entry must be deleted to prevent leaking.

	// WeakRef is semantically accurate.
	// This allows all other collections to share a simple map.
	// However, no other collection can dispose of a ref since others may use it.
	#refsOfElements = new class extends Collection { 
		
		#internal = new WeakMap
		#finalization = new FinalizationRegistry( ref => {

			// many things may use the ref
			// hence they are not able to dispose of it for others
			// throw Error( "This should not be reached; the Graph was unable to maintain it's state." )
			console.log( "lost ref; maybe not a bug ?" )

			} )
	
		get( element ) {

			if( this.#internal.has( element ) ) {
				return this.#internal.get( element )
				}

			let ref = new WeakRef( element )

			this.#internal.set( element, ref )
				
			this.#finalization.register( element, ref, ref )

			return ref
			}

		// delete( element ) {

		// 	let ref = this.#internal.get( element )

		// 	this.#internal.delete( element )

		// 	this.#finalization.unregister( ref )

		// 	}

		}

	// ### Collections should provide a finalization callback in to throw an error.
	// No elements should be disposed while it is cached here.
	// If they do, something went wrong.

	// document.querySelectorAll(":active") // unreliable
	#isMovingTarget = new class extends Collection {
		// ordered (insertion)
		// unique (identity)
		#internalSpecies = Set
		#internal = new this.#internalSpecies 

		#refsOfElements

		delete( entry, keyType = Collection.Identity ) {
			switch( keyType ) {

				case Collection.Identity: {

					let ref = this.#refsOfElements.get( entry )
					
					this.#internal.delete( ref )

					break
					}

				case "index": {

					let ref = Array.from( this.#internal ).at( entry )

					this.#internal.delete( ref )

					break
					}

				}
			}


		push( element ) {

			let ref = this.#refsOfElements.get( element )

			this.#internal.add( ref )

			}

		get count() {
			return this.#internal.size
			}

		get( index ) {	
			return Array.from( this.#internal ).at( index )?.deref?.()
			}

		;[Symbol.iterator] () {
			return Array.from( this.#internal, ref => ref.deref() )[Symbol.iterator]()
			}

		clear() {
			this.#internal = new this.#internalSpecies
			}

		constructor( refsOfElements ) {
			super()
			this.#refsOfElements = refsOfElements
			}

		} ( this.#refsOfElements )

  // document.querySelectorAll(":hover") // unreliable
	#isConnectionTarget = new class extends Collection {
		// ordered ( insertion )
		// unique ( identity )
		#internalSpecies = Set
		#internal = new this.#internalSpecies

		#refsOfElements

		delete( element ) {

			let ref = this.#refsOfElements.get( element )

			this.#internal.delete( ref )

			}

		get( index ) {
			return Array.from( this.#internal ).at( index )?.deref?.()
			}

		push( element ) {

			let ref = this.#refsOfElements.get( element )

			this.#internal.add( ref )

			}

		constructor( refsOfElements ) {
			super()
			this.#refsOfElements = refsOfElements
			}

		} ( this.#refsOfElements )

	#positionOfAny = new class extends Collection {

		#internalSpecies = Map
		#internal = new this.#internalSpecies

		#refsOfElements

		set( element, position ) {

			let ref = this.#refsOfElements.get( element )

			this.#internal.set( ref, position )

			}

		delete( element ) {

			let ref = this.#refsOfElements.get( element )

			this.#internal.delete( ref )

			}

		get( element ) {

			let ref = this.#refsOfElements.get( element )

			return this.#internal.get( ref )
			}

		constructor( refsOfElements ) {
			super()
			this.#refsOfElements = refsOfElements
			}

		} ( this.#refsOfElements )

	#pathOfEdge = new class extends Collection {

		#internalSpecies = Map
		#internal = new this.#internalSpecies

		#refsOfElements

		delete( element ) {

			let ref = this.#refsOfElements.get( element )

			this.#internal.delete( ref )

			}

		set( element, path ) {

			let ref = this.#refsOfElements.get( element )

			this.#internal.set( ref, path )

			}

		get( element ) {

			let ref = this.#refsOfElements.get( element )

			return this.#internal.get( ref )

			}

		constructor( refsOfElements ) {
			super()
			this.#refsOfElements = refsOfElements
			}

		} ( this.#refsOfElements )

	#edgeAnchorsOfNodeAnchor = new class extends Collection {
		// Set of NodeAnchor && EdgeAnchor
		#internalSpecies = Map
		#internal = new this.#internalSpecies

		#refsOfElements

		// defaults: edgeAnchor = Collection.Range.All
		get( nodeAnchor, maybeEdgeAnchor ) {

			let nodeRef = this.#refsOfElements.get( nodeAnchor )

			if( maybeEdgeAnchor ) { 

				let edgeRef = this.#refsOfElements.get( maybeEdgeAnchor )

				return this.#internal.get( nodeRef )?.has?.( edgeRef ) ?? false
				}

			else {

				let edgeAnchors = this.#internal.get( nodeRef )

				return Array.from( edgeAnchors?.[Symbol.iterator]?.() ?? [] )
					.map( ref => ref.deref() )
				}

			}	

		add( nodeAnchor, edgeAnchor ) {

			let nodeRef = this.#refsOfElements.get( nodeAnchor )
				, edgeRef = this.#refsOfElements.get( edgeAnchor )

			if( this.#internal.has( nodeRef ) ) {
				this.#internal.get( nodeRef ).add( edgeRef )
				}

			else {
				let edgeAnchors = new Set([ edgeRef ])
				this.#internal.set( nodeRef, edgeAnchors )
				}

			}

		// defaults: edgeAnchor = Collection.Ranges.All 
		delete( nodeAnchor, maybeEdgeAnchor ) {

			let nodeRef = this.#refsOfElements.get( nodeAnchor )

			if( maybeEdgeAnchor && this.#internal.has( nodeRef) ) {

				let edgeRef = this.#refsOfElements.get( edgeAnchor )

				this.#internal.get( nodeRef ).delete( edgeRef )
 
				}

			else {
				this.#internal.delete( nodeRef )
				}

			}

		constructor( refsOfElements ) {
			super()
			this.#refsOfElements = refsOfElements
			}

		} ( this.#refsOfElements )

	#nodeAnchorOfEdgeAnchor = new class extends Collection {

		#internalSpecies = Map
		#internal = new this.#internalSpecies

		get( element ) {

			let ref = this.#refsOfElements.get( element )

			return this.#internal.get( ref )
			}

		set( element, nodeAnchor ) {

			let edgeRef = this.#refsOfElements.get( element )
				, nodeRef = this.#refsOfElements.get( nodeAnchor )

			this.#internal.set( edgeRef, nodeRef )

			}

		delete( element ) {

			let ref = this.#refsOfElements.get( element )

			this.#internal.delete( ref )

			}

		#refsOfElements

		constructor( refsOfElements ) {
			super()
			this.#refsOfElements = refsOfElements
			}

		} ( this.#refsOfElements )

	#createWorld( element ) {

		this.#positionOfAny.set( element, { x: 0, y: 0 } )

		for( let node of element.querySelectorAll( ":scope [graph_node]" ) )
			this.#createNode( node )

		for( let edge of element.querySelectorAll( ":scope [graph_edge]" ) )
			this.#createEdge( edge )

		}

	#deleteWorld( element ) {
		this.#positionOfAny.delete( element )
		this.#isMovingTarget.delete( element )

		for( let node of element.querySelectorAll( "[graph_node]" ) )
			this.#deleteNode( node )

		for( let edge of element.querySelectorAll( "[graph_edge]") )
			this.#deleteEdge( edge )

		}

	#deleteNode( element ) {
		this.#positionOfAny.delete( element )
		this.#isMovingTarget.delete( element )

		for( let anchor of element.querySelectorAll( "[graph_node_input], [graph_node_output]" ) )
			this.#deleteNodeAnchor( anchor )

		}

	#createNode( element ) {

		console.log( element )

		element.style.setProperty( "--x", 0 )
		element.style.setProperty( "--y", 0 )
		this.#positionOfAny.set( element, { x: 0, y: 0 } )

		for( let anchor of element.querySelectorAll( "[graph_node_input], [graph_node_output]" ) )
			this.#createNodeAnchor( anchor )

		}

	#deleteNodeAnchor( element ) { 
		this.#isConnectionTarget.delete( element )

		for( let edge of this.#edgeAnchorsOfNodeAnchor.get( element ) ) {
			this.#nodeAnchorOfEdgeAnchor.delete( edge )
			}

		this.#edgeAnchorsOfNodeAnchor.delete( element )
		}

	#createNodeAnchor( element ) {

		// this.#edgeAnchorsOfNodeAnchor.set( element, new this.#edgeAnchorsSpecies )

		}

	#deleteEdge( element ) {
		this.#pathOfEdge.delete( element )

		for( let anchor of element.querySelectorAll( "[graph_edge_anchor]" ) )
			this.#deleteEdgeAnchor( anchor )

		}

	#createEdge( element ) {
		
		let path = document.createElementNS( "http://www.w3.org/2000/svg", "path" )
		element.closest( "[graph_world]" ).querySelector( "[graph_svg]" ).append( path )
		this.#pathOfEdge.set( element, path )

		for( let anchor of element.querySelectorAll( "[graph_edge_anchor]" ) )
			this.#createEdgeAnchor( anchor )

		}

	#deleteEdgeAnchor( element ) {
		this.#positionOfAny.delete( element )
		this.#isMovingTarget.delete( element )

		let nodeAnchor = this.#nodeAnchorOfEdgeAnchor.get( element )

		if( nodeAnchor ) {
			this.#edgeAnchorsOfNodeAnchor.delete( nodeAnchor, element )
			}
		
		this.#nodeAnchorOfEdgeAnchor.delete( element )
		}

	#createEdgeAnchor( element ) {

		element.style.setProperty( "--x", 0 )
		element.style.setProperty( "--y", 0 )
		this.#positionOfAny.set( element, { x: 0, y: 0 } )

		}

	handleEvent( event ) {
		switch( event.type ) {

			case "mousedown": {

				let target 

				if( "graph_node_handle" in event.target.attributes ) {
					target = event.target.closest( "[graph_node]" )
					this.#isMovingTarget.push( target )
					}

				else if( "graph_edge_anchor" in event.target.attributes ) {
					target = event.target
					this.#isMovingTarget.push( target )
					}

				else if( "graph" in event.target.attributes ) {
					target = event.target.querySelector( "[graph_world]" )
					this.#isMovingTarget.push( target )
					}

				target?.toggleAttribute?.( "graph_moving", true )

				break
				}

			case "mousemove": {

				if( this.#isMovingTarget.count === 0 )
					break

				let targets = []

				for( let target of this.#isMovingTarget ) {

					targets.push( target )

					if( "graph_node" in target.attributes ) {

						let anchors = Array.from( target.querySelectorAll( "[graph_node_input], [graph_node_output]" ) )
							.flatMap( nodeAnchor => Array.from( this.#edgeAnchorsOfNodeAnchor.get( nodeAnchor ) ) )

						targets.push( ...anchors )
						}

					}

				let positions = this.#positionOfAny

				for( let target of targets ) {

					console.log( target )

					let { x, y } = positions.get( target ) 

					x += event.movementX
					y += event.movementY
	
					positions.set( target, { x, y } )
					target.style.setProperty( "--x", x )
					target.style.setProperty( "--y", y )
					
					if( target.matches( "[graph_edge_anchor]" ) ) {

						let edge = target.closest( "[graph_edge]" )
							, path = this.#pathOfEdge.get( edge )

						let [ a, b ] = Array.from( edge.querySelectorAll( "[graph_edge_anchor]" ), 
							anchor => this.#positionOfAny.get( anchor ) )

						path.style.setProperty( "d", `path("M${a.x},${a.y} L${b.x},${b.y}")` )

						}

					}

				break
				}

			case "mouseup": {

				let nodeAnchor = this.#isConnectionTarget.get(0)
					, edgeAnchor = this.#isMovingTarget.get(0)

				if( edgeAnchor?.matches?.( "[graph_edge_anchor]" ) ) {

					if( nodeAnchor?.matches?.( "[graph_node_input], [graph_node_output]" ) ) {

						this.#edgeAnchorsOfNodeAnchor.add( nodeAnchor, edgeAnchor )

						this.#nodeAnchorOfEdgeAnchor.set( edgeAnchor, nodeAnchor )

						let { x: ax, y: ay } = edgeAnchor.getBoundingClientRect()
							, { x: cx, y: cy } = nodeAnchor.getBoundingClientRect()

						this.handleEvent({ 
							type: "mousemove", target: edgeAnchor, 
							movementX: cx - ax,
							movementY: cy - ay,
							})

						}

					else {
						
						let prevNodeAnchor = this.#nodeAnchorOfEdgeAnchor.get( edgeAnchor )

						if( prevNodeAnchor ) {

							this.#edgeAnchorsOfNodeAnchor.delete( prevNodeAnchor, edgeAnchor )

							this.#nodeAnchorOfEdgeAnchor.delete( edgeAnchor )

							}

						}

					}

				// this.#movingTarget?.toggleAttribute?.( "graph_moving", false )
				// this.#movingTarget = null

				for( let target of this.#isMovingTarget )
					target.toggleAttribute( "graph_moving", false )

				this.#isMovingTarget.clear()

				break
				}

			case "mouseover": {

				if( this.#isMovingTarget.get(0)?.matches?.( "[graph_edge_anchor]" )
				 && event.target.matches( "[graph_node_input], [graph_node_output]" ) ) {
					this.#isConnectionTarget.push( event.target )
					}

				break
				}

			case "mouseout": {

				this.#isConnectionTarget.delete( event.target )

				break
				}

			case "attributes": {
				console.log( "attributes", event.target )
				switch( event.attributeName ) {

					case "graph_world": {

						if( "graph_world" in event.target.attributes ) {
							this.#createWorld( event.target )
							}

						else {
							this.#deleteWorld( event.target )
							}

						break
						}

					case "graph_node": {

						if( "graph_node" in event.target.attributes ) {
							this.#createNode( event.target )
							}

						else {
							this.deleteNode( event.target )
							}

						break
						}

					case "graph_node_input":
					case "graph_node_output": {
						this.#createNodeAnchor( event.target )
						break
						}

					case "graph_edge": {

						if( "graph_edge" in event.target.attributes ) {
							this.#createEdge( event.target )
							}

						else {
							this.#deleteEdge( event.target )
							}

						break
						}

					case "graph_edge_anchor": {

						if( "graph_edge_anchor" in event.target.attributes ) {
							this.#createEdgeAnchor( event.target )
							}

						else {
							this.#deleteEdgeAnchor( event.target )
							}

						break
						}

					}
				break
				}

			case "childList": {

				for( let root of event.addedNodes ) {

					console.log( root )

					if( root.nodeType !== 1 )
						continue

					for( let attribute of GraphView.globalyObservedAttributes ) {
						for( let node of root.querySelectorAll( "[" + attribute + "]" ) ) {

							this.handleEvent({ type: "attributes", target: node, attributeName: attribute })

							}
						}
					}

				for( let root of event.removedNodes ) {
					for( let attribute of GraphView.globalyObservedAttributes ) {
						for( let element of root.querySelectorAll( "[" + attribute + "]" ) ) {
							switch( attribute ) {

								case "graph_world": {
									this.#deleteWorld( element )
									break
									}

								case "graph_node": {
									this.#deleteNode( element )
									break
									}

								case "graph_node_input": {
									this.#deleteNodeAnchor( element )
									break
									}

								case "graph_node_output": {
									this.#deleteNodeAnchor( element )
									break
									}

								case "graph_edge": {
									this.#deleteEdge( element )
									break
									}

								case "graph_edge_anchor": {
									this.#deleteEdgeAnchor( element )
									break
									}

								}
							}
						}
					}

				break
				}

			}
		}

	constructor() {
		addEventListener( "mousedown", this )
		addEventListener( "mousemove", this )
		addEventListener( "mouseup", this )
		addEventListener( "mouseover", this )
		addEventListener( "mouseout", this )

    this.#observer = new MutationObserver( ( records, observer ) => records.forEach( record => this.handleEvent( record ) ) )
    this.#observer.observe( document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: GraphView.globalyObservedAttributes } )
    
    for( let attribute of GraphView.globalyObservedAttributes ) {
    	for( let target of document.querySelectorAll( "[" + attribute + "]" ) ) {
				this.handleEvent({ type: "attributes", target, attributeName: attribute })
				}
			}
    	
		}

	static get globalyObservedAttributes() { return [ "graph_world", "graph_node", "graph_node_input", "graph_node_output", "graph_edge", "graph_edge_anchor" ] }

	static self = new this

	}

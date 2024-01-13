

class GraphView {

	#observer
	#movingTarget
	#connectionTarget
	#positions = new Map
	#paths = new Map
	#connections = new Map // node_connection -> [ edge_anchor ]
	#anchors = new Map // edge_anchor -> node_connection

	handleEvent( event ) {
		switch( event.type ) {

			case "mousedown": {

				if( "graph_node_handle" in event.target.attributes ) {
					this.#movingTarget = event.target.closest( "[graph_node]" )
					}

				else if( "graph_edge_anchor" in event.target.attributes ) {
					this.#movingTarget = event.target
					}

				else if( "graph" in event.target.attributes ) {
					this.#movingTarget = event.target.querySelector( "[graph_world]" )
					}

				this.#movingTarget?.toggleAttribute?.( "graph_moving", true )

				break
				}

			case "mousemove": {

				if( !this.#movingTarget ) 
					break

				let targets = Array.from( this.#movingTarget.querySelectorAll( ":scope:not([graph_world]) [graph_node_input], [graph_node_output]" ), 
					connection => Array.from( this.#connections.get( connection ) ) )
					.flat()

				let positions = this.#positions

				for( let target of [ this.#movingTarget, ...targets ] ) {
					
					let { x, y } = positions.get( target )

					x += event.movementX
					y += event.movementY

					positions.set( target, { x, y } )
					target.style.setProperty( "--x", x )
					target.style.setProperty( "--y", y )
					
					if( "graph_edge_anchor" in target.attributes ) {

						let edge = target.closest( "[graph_edge]" )
							, paths = this.#paths

						let path = paths.get( edge )

						let [ a, b ] = Array.from( edge.querySelectorAll( "[graph_edge_anchor]" ), 
							anchor => this.#positions.get( anchor ) )

						path.style.setProperty( "d", `path("M${a.x},${a.y} L${b.x},${b.y}")` )

						}

					}


				break
				}

			case "mouseup": {

				if( this.#movingTarget?.matches?.( "[graph_edge_anchor]" ) ) {
				 
					 if( this.#connectionTarget?.matches?.( "[graph_node_input], [graph_node_output]" ) ) {

						this.#connections.get( this.#connectionTarget )
							.add( this.#movingTarget )

						this.#anchors.set( this.#movingTarget, this.#connectionTarget )

						let { x: ax, y: ay } = this.#movingTarget.getBoundingClientRect()
							, { x: cx, y: cy } = this.#connectionTarget.getBoundingClientRect()

						this.handleEvent({ 
							type: "mousemove", target: this.#movingTarget, 
							movementX: cx - ax,
							movementY: cy - ay,
							})

						}

					else {

						let connection = this.#anchors.get( this.#movingTarget )

						if( connection ) {

							this.#connections.get( connection ) 
								.delete( this.#movingTarget )

							this.#anchors.delete( this.#movingTarget )

							}

						}

					}

				this.#movingTarget?.toggleAttribute?.( "graph_moving", false )
				this.#movingTarget = null

				break
				}

			case "mouseover": {

				if( this.#movingTarget 
				 && "graph_edge_anchor" in this.#movingTarget.attributes 
				 && event.target.matches( "[graph_node_input], [graph_node_output]" )
				 ) {
					this.#connectionTarget = event.target
					}

				break
				}

			case "mouseout": {

				if( this.#connectionTarget ) {
					this.#connectionTarget = null
					}	

				break
				}

			case "attributes": {
				switch( event.attributeName ) {

					case "graph_world": {

						if( "graph_world" in event.target.attributes ) {
							this.#positions.set( event.target, { x: 0, y: 0 } )
							}

						else {
							this.#positions.delete( event.target )
							}

						break
						}

					case "graph_node": {

						if( "graph_node" in event.target.attributes ) {
							this.#positions.set( event.target, { x: 0, y: 0 } )
							}

						else {
							this.#positions.delete( event.target )
							}

						break
						}

					case "graph_node_input":
					case "graph_node_output": {

						this.#connections.set( event.target, new Set )

						break
						}

					case "graph_edge": {

						if( "graph_edge" in event.target.attributes ) {
							let path = document.createElementNS( "http://www.w3.org/2000/svg", "path" )
							event.target.closest( "[graph_world]" ).querySelector( "[graph_svg]" ).append( path )
							this.#paths.set( event.target, path )
							}

						else {
							let path = this.#paths.get( event.target )
							this.#paths.delete( event.target )
							path.remove()
							}

						break
						}

					case "graph_edge_anchor": {

						if( "graph_edge_anchor" in event.target.attributes ) {
							this.#positions.set( event.target, { x: 0, y: 0 } ) 
							}

						else {
							this.#positions.delete( event.target )
							}

						break
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
    this.#observer.observe( document.documentElement, { subtree: true, attributes: true, attributeFilter: GraphView.globalyObservedAttributes } )
    
    for( let attribute of GraphView.globalyObservedAttributes ) {
    	for( let target of document.querySelectorAll( "[" + attribute + "]" ) ) {
				this.handleEvent({ type: "attributes", target, attributeName: attribute })
				}
			}
    	
		}

	static get globalyObservedAttributes() { return [ "graph_world", "graph_node", "graph_node_input", "graph_node_output", "graph_edge", "graph_edge_anchor" ] }

	static self = new this

	}


export default class CommandPalette extends HTMLElement {

	#rootElement
	#modalElement
	#searchElement
	#resultsElement
	#backdropElement
	#currResult

	#query = ""

	open() {
		this.#modalElement.showPopover()
		this.#searchElement.focus()
		this.#searchElement.textContent = this.#query
		}

	close() {
		this.#searchElement.blur()
		this.#modalElement.hidePopover()
		}

	focusNext() {

		// this.querySelector(" :scope > *:not(palette-hidden).palette-selected ")

		}

	focusPrev() {}

	update( query ) {
		this.#query = query

		for( let command of this.children ) { 
			if( command.getAttribute("name").startsWith( query.trim() ) )  
				command.classList.remove("palette-hidden")
			else
				command.classList.add("palette-hidden")
			}

		}

	submit( target = this.#currResult ) {

		target?.click()

		}

	constructor() {
		super()

		let shadow = this.attachShadow({ mode: "closed", delegatesFocus: true, slotAssignments: "named" })
		shadow.append( CommandPalette.content.cloneNode(true) )
		shadow.adoptedStyleSheets = [ CommandPalette.styles ]

		this.#rootElement = shadow.getElementById("root")
		this.#modalElement = shadow.getElementById("modal")
		this.#searchElement = shadow.getElementById("search")
		this.#resultsElement = shadow.getElementById("results")
		this.#backdropElement = shadow.getElementById("backdrop")

		// this.#rootElement.addEventListener( "focusin", event => this.open(), {
		// 	capture: true,
		// 	passive: false
		// 	} )

		this.#rootElement.addEventListener( "keydown", event => {
			switch( event.key ) {

				case "ArrowUp":
					event.preventDefault()
					this.focusNext()
					break

				case "ArrowDown":
					event.preventDefault()
					this.focusPrev()
					break

				case "Tab":
					event.preventDefault()
					this.focusNext()
					break

				case "Enter":
					event.preventDefault()
					this.submit()
					break

				case "Escape":
					event.preventDefault()
					this.close()
					break

				}
			}, {
			capture: true,
			passive: false,
			} )

		this.#rootElement.addEventListener( "input", event => {
			this.update( this.#searchElement.textContent )
			}, {
			capture: true,
			passive: false,
			} )

		this.#rootElement.addEventListener( "click", event => {
			switch( event.target ) {

				case this.#backdropElement:
					this.close()
					break

				default:
					if( event.target.classList.contains("result") )
						this.submit( event.target )
						break
					break

				}
			}, {
			capture: true,
			passive: false,
			} )

		}


	static content = getHTML()
	static styles = getCSS()

	static {
		customElements.define( "command-palette", this )
		}

	}


function getHTML() {
	let template = document.createElement("template")

	template.innerHTML = `
		<link rel=stylesheet href="https://nahejl.github.io/Web-Components/default.css" />
		<elem- id=root tabindex=0 >	
			<elem- id=modal popover=manual >

				<elem- id=backdrop ></elem->

				<elem- id=palette >
					<elem- id=bar >
						<elem- id=icon >⌕</elem->
						<elem- id=search contenteditable=plaintext-only ></elem->
						</elem->
					<slot id=results ></slot>
					</elem->

				</elem->
			</elem->
		`

	return template.content
	}


function getCSS() {

	let sheet = new CSSStyleSheet

	sheet.replace(`

		#root {
			display: contents
			}

		#modal:not(:popover-open) {
			display: none;
			}

		#modal:popover-open {
			position: fixed; inset: 0px;
			width: 100vw; height: 100vh;
			display: grid; place-content: start center;
			padding: 8px;
			}

		#backdrop {
			z-index: 1;
			position: fixed; inset: 0px;
			width: 100vw; height: 100vh; 
			background: #1112;
			backdrop-filter: blur(2px);
			pointer-events: auto;
			}

		#palette {
			z-index: 2;
			grid-area: 1/1;
			width: 600px;
			display: flex; flex-flow: column nowrap;
			border-radius: 6px; 
			}

		#bar {
			width: 100%;
			background: #123; color: #EEE;
			display: flex; flex-flow: row nowrap;
			place-content: start;
			}

		#icon {
			width: 40px; height: 100%;
			display: grid;
			font-size: 30px;
			line-height: 1;
			opacity: 0.8;
			}

		#search {
			flex-grow: 1;
			padding: 10px 12px 10px 0px;
	    -moz-user-modify: read-write;
	    -webkit-user-modify: read-write;
			}

		#search:empty::after {
			content: "Query";
			opacity: .25;
			pointer-events: none;
			}

		#results {
			display: flex; flex-flow: column nowrap;
			place-items: start;
			width: 100%;
			background: #789; color: #EEE;
			padding-block: 5px;
			}

		#results::slotted(*) {
			padding-inline: 10px;
			}

		`)

	return sheet
	}

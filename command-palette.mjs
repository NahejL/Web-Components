
export default class CommandPalette extends HTMLElement {

	#rootElement
	#modalElement
	#searchElement
	#backdropElement
	#currResult

	#query = ""

	open() {
		this.#modalElement.showPopover()
		this.#searchElement.focus()
		this.#searchElement.value = this.#query
		}

	close() {
		this.#query = ""
		this.#searchElement.blur()
		this.#modalElement.hidePopover()
		}

	add( command ) {}

	remove( command ) {}

	focusNext() {}

	focusPrev() {}

	update( query ) {}

	submit( target = this.#currResult ) {}

	constructor() {
		super()

		let shadow = this.attachShadow({ mode: "closed", delegatesFocus: true, slotAssignments: "manual" })
		shadow.append( CommandPalette.content.cloneNode(true) )
		shadow.adoptedStyleSheets = [ CommandPalette.styles ]

		this.#rootElement = shadow.getElementById("root")		
		this.#modalElement = shadow.getElementById("modal")
		this.#searchElement = shadow.getElementById("search")		
		this.#searchElement.beforeInput = console.log
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
			this.update( this.#searchElement.value )
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

	template.innerHTML = `<elem- id=root tabindex=0 >	
		<elem- id=modal popover=manual >

			<elem- id=backdrop ></elem->

			<input id=search value=SEARCH />

			</elem->
		</elem->`

	return template.content
	}


function getCSS() {

	let sheet = new CSSStyleSheet

	sheet.replace(`
		`)

	return sheet
	}

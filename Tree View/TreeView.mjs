
class TreeHandler {

  #observer

  #updateClassA( branch ) {
    let parent = branch.parentElement.closest( ".tree_branch, .tree" )
    if( parent === null )
      return
    
    if( parent.classList.contains("a") ) {
      branch.classList.remove("a")
      }

    else {
      branch.classList.add("a")
      }

    }

  handleEvent( event ) {
    switch( event.type ) {
        
      case "click": {
        if( event.target.matches( ":is( .tree, .tree_branch ) > :scope.tree_leaf:first-child" ) ) {
          event.target.parentElement.classList.toggle( "tree_branch_closed" )
          break
          }
        break
        }

      case "dblclick": {
        if( event.target.matches( ".tree_leaf" ) )
          event.target.focus()
        break
        }

      case "contextmenu": {
        break
        }

      case "childList": {
        for( let node of event.addedNodes ) {
          for( let branch of node.querySelectorAll( ".tree_branch") ) {
            this.#updateClassA( branch )
            }
          }
        break
        }

      case "attributes": {
        if( event.target.classList.contains( ".tree_branch" ) )
          ;
        break
        }
        
      }
    }

  constructor() {
    addEventListener( "click", this )
    addEventListener( "dblclick", this )
    addEventListener( "contextmenu", this )
    
    this.#observer = new MutationObserver( ( records, observer ) => records.forEach( record => this.handleEvent( record ) ) )
    this.#observer.observe( document.documentElement, { subtree: true, attributes: true, attributeFilter: [ "class" ] } )
    
    document.querySelectorAll( ".tree_branch" ).forEach( target => this.#updateClassA( target ) )
    
    }

  static self = new this
  }





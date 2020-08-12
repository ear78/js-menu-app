let url = 'http://localhost:5001/api/menu-items/'

fetch( url )
    .then( resp => {
        console.log( 'resp :', resp );
        let data = resp.json()
        data.then( d => {
            console.log( 'd', d );
            if ( d ) {
                addPageContent( d );
            }
        } )

    } )

function addPageContent( data ) {
    var newDiv = document.createElement( 'div' );
    var att = document.createAttribute( 'class' );
    att.value = 'items-wrapper';
    newDiv.setAttributeNode( att )

    var content = data.map( item => {
            return `<div class="item">
                    <h4 class="title">${item.title}</h4>
                    <p class="sub-title">${item.subTitle}</p>
                    <p class="description">${item.description}</p>
                    <div class="social-box">
                      ${item.social.map(link => {
                        return `<i>${link}</i>`
                      }).join(' ')}
                    </div>
                  </div>`;
        } )
        .join( '' )

    newDiv.innerHTML = content;

    document.getElementById( 'content' )
        .appendChild( newDiv )
}

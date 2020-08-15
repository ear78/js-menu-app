
// Let's Grab the Data from the backend
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

// Let's print the data dynamically to the browser
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
                        return `<a href="${link.link}"><i class="fa fa-${link.icon}" aria-hidden="true"></i></a>`
                      }).join(' ')}
                    </div>
                  </div>`;
        } )
        .join( '' )

    newDiv.innerHTML = content;

    document.getElementById( 'content' )
        .appendChild( newDiv )
}

let x = document.querySelectorAll('.social-inputs');
x.forEach(input => input.style.display = 'none'); // hide inputs initially

const handleSocialInput = (check, name) => {
  let socialNames = ['facebook', 'linkedin', 'twitter', 'instagram']
  socialNames.forEach(socialName => {
    if(check && name === socialName) {
      document.querySelector(`#${name}`).style.display = 'block'
    }
    if(!check && name === socialName) {
      document.querySelector(`#${name}`).style.display = 'none'
    }
  })
}

// Let's add click handlers to our checkboxes
let checkBoxes = document.querySelectorAll('input[type="checkbox"]');
checkBoxes.forEach(box => {
  box.addEventListener('click', function(e) {
    let checked = e.target.checked
    let socialName = e.target.name
    handleSocialInput(checked, socialName) // Toggles show/hide specific inputs
  })
})

// Let's submit our data to the backend
let button = document.querySelector('#handle-submit');
button.addEventListener('click', function() {
  handleSubmit();
})

let form = document.forms.menuForm // Grab form elements

const handleSubmit = () => {
  console.log('handleSubmit', form.elements);
  let obj = {
    social: [],
  };

  [...form.elements].forEach((input, index) => {
      if(input.name.indexOf('URL') !== -1 && input.value.length) {
        obj['social'].push({icon: input.name.slice(0,-3), link: input.value})
      }
      else if (input.type !== 'checkbox' && input.value.length) {
        obj[input.name] = input.value
      }
  })
  console.log(obj);
  axios.post('http://localhost:5001/api/menu-items/', obj).then((resp) => {
    console.log('response', resp);
  }).catch((error) => {
    console.log('error:', error);
  })
}

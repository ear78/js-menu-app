
// Let's Grab the Data from the backend on page load
let url = 'http://localhost:5001/api/menu-items/'

fetch( url )
.then( resp => {
  console.log( 'resp :', resp );
  let data = resp.json()
  data.then(d => {
    console.log( 'd', d );
    if(d) {
      addPageContent(d);
      handleDataLoading(false);
    }
  })
})

const handleDataLoading = (bool) => {
  let contentLoading = document.querySelector('.content-loading');
  if(!bool) {
    contentLoading.style.display = 'none';
  } else {
    contentLoading.style.display = 'flex';
  }
}

// Let's print the data dynamically to the browser
function addPageContent( data ) {
  if(document.querySelector('.items-wrapper') !== null) {
    document.querySelector('.items-wrapper').remove();
  }
  var newDiv = document.createElement( 'div' );
  var att = document.createAttribute( 'class' );
  att.value = 'items-wrapper';
  newDiv.setAttributeNode( att )

  var content = data.map( item => {
    return `<div class="item">
    <img src="${item.image}"/>
    <h4 class="title">${item.title}</h4>
    <p class="sub-title">${item.subTitle}</p>
    <p class="description">${item.description}</p>
    <div class="social-box">
      ${item.social.map(link => {
        return `<a href="${link.link}"><i class="fa fa-${link.icon}" aria-hidden="true"></i></a>`
      }).join(' ')}
    </div>
  </div>`;
}).join( '' )

newDiv.innerHTML = content;
document.getElementById( 'content').appendChild( newDiv )
}

// Show/Hide social html text inputs
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
button.addEventListener('click', function(e) {
  e.preventDefault()
  handleSubmit();
})

const handleSubmit = () => {
  // console.log('handleSubmit', form.elements);
  handleDataLoading(true)
  let form = document.forms.menuForm // Grab form elements

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

  // Convert image file to base64
  let file = document.querySelector('#upload').files[0]
  let reader = new FileReader();
  reader.onload = (e) => {
    let imageFile64 = e.target.result;
    obj.image = imageFile64;
    postRequest(); // When image is base64 send postRequest
  }
  if(file) {
    reader.readAsDataURL(file)
  }

  const postRequest = () => {
    axios.post('http://localhost:5001/api/menu-items/', obj).then((resp) => {
      console.log('response', resp);
      let data = resp.data
      addPageContent(data)
      handleDataLoading(false);
    }).catch((error) => {
      console.log('error:', error);
    })
  }
}

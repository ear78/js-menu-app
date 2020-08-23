
// Let's Grab the Data from the backend on page load
const URL = 'http://localhost:5001/api/menu-items/';
let dataState = []
let isEditing = false;
let stateId = '';

fetch( URL )
.then( resp => {
  let data = resp.json()
  data.then(d => {
    console.log( 'd', d );
    if(d) {
      dataState = [...d]
      addPageContent(d);
      handleDataLoading('load', false);
      getActionButtons(); // get buttons after data/content is set
    }
  })
})

// Sets Loading Spinner
const handleDataLoading = (type, bool) => {
  let contentLoading = document.querySelector('.content-loading');
  if(!bool && type === 'load') {
    contentLoading.style.display = 'none';
  }
  else if(bool && type === 'load') {
    contentLoading.style.display = 'flex';
  }
}

// Let's print the data dynamically to the browser
const addPageContent = (data) => {
  if(document.querySelector('.items-wrapper') !== null) {
    document.querySelector('.items-wrapper').remove();
  }
  var newDiv = document.createElement( 'div' );
  var att = document.createAttribute( 'class' );
  att.value = 'items-wrapper';
  newDiv.setAttributeNode( att )

  var content = data.map((item, index) => {
    return `<div id="${item._id}" class="item">
              <div class="top-section">
                <img src="${item.image}"/>
                <div class="functions">
                  <i class="fa fa-pencil-square-o edit" aria-hidden="true"></i>
                  <i class="fa fa-trash delete" aria-hidden="true"></i>
                </div>
              </div>
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

// Let's add click handlers to our checkboxes
let checkBoxes = document.querySelectorAll('input[type="checkbox"]');
checkBoxes.forEach(box => {
  box.addEventListener('click', function(e) {
    let checked = e.target.checked
    let socialName = e.target.name
    handleSocialInput(checked, socialName) // Toggles show/hide specific inputs
  })
})

//Let's Create/Edit and submit our data to the backend
let button = document.querySelector('#handle-submit');
button.addEventListener('click', function(e) {
  e.preventDefault()
  e.stopPropagation();
  handleSubmit();
})

// Show/Hide social html text inputs
const hideSocialInputs = () => {
  let socialInputs = document.querySelectorAll('.social-inputs');
  socialInputs.forEach(input => input.style.display = 'none'); // hide inputs initially
}
hideSocialInputs() // hide inputs on initial load

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

// Handle Submit of form to backend. Handles create and edit
const handleSubmit = () => {
  handleDataLoading('load', true)
  let postRequest
  let form = document.forms.menuForm // Grab form elements
  let elements = [...form.elements]

  let obj = {
    social: [],
  };

  elements.forEach((input, index) => {
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

  if(isEditing) {
    // if(!file.length) {
    //   let group = dataState.find(data => data._id === id)
    //   obj.image = group.image
    // }
    console.log(URL + stateId, obj);
    postRequest = () => {
      axios.put(URL + stateId, obj).then(resp => {
        let data = resp.data
        dataState = [...data]
        addPageContent(data)
        handleDataLoading('load', false)
      }).catch(error => {
        console.log('error:', error)
      })
    }
  }

  if(!isEditing) {
    // Create ajax call to backend
    postRequest = () => {
      axios.post(URL, obj).then((resp) => {
        let data = resp.data
        dataState = [...data]
        addPageContent(data)
        handleDataLoading('load', false);
      }).catch((error) => {
        console.log('error:', error);
      })
    }
  }
}

// Delete handlers for all delete buttons
const getActionButtons = () => {
  let deleteButtons = document.querySelectorAll('.item .delete');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      let id = e.target.offsetParent.id
      handleDelete(id)
    })
  })

  let editButtons = document.querySelectorAll('.item .edit');
  editButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      let id = e.target.offsetParent.id;
      handleEdit(id);
    })
  })
}

// Delete ajax call to backend
const handleDelete = (id) => {
  handleDataLoading('load', true);

  axios.delete(URL + id).then((resp) => {
    let data = resp.data
    dataState = [...data] //update app data
    addPageContent(data)
    handleDataLoading('load', false)
    getActionButtons()
  }).catch((error) => {
    console.log('error:', error)
  })
}

// Edit form functionality
const handleEdit = (id) => {
  // Set loading, isEditing, id
  handleDataLoading('edit', true)
  isEditing = true;
  stateId = id

  // Open mask
  let editMask = document.querySelector('.edit-mask');
  editMask.classList.add('active');

  // Set User Text
  let formTitle = document.querySelector('.form-title')
  formTitle.innerHTML = 'Edit User';

  // Create Reset Button
  let reset = document.createElement('input');
  reset.setAttribute('type', 'reset');
  reset.value = 'Cancel';
  formTitle.appendChild(reset)

  // Resets form
  let resetButton = document.querySelector('input[type="reset"]')
  resetButton.addEventListener('click', function () {
    isEditing = false
    id = ''
    hideSocialInputs()
    editMask.classList.remove('active')
    formTitle.innerHTML = 'Add User'
    reset.remove()
    document.querySelector('#menu-form').reset()
  })

  // Form data
  let form = document.forms.menuForm
  let card = dataState.find(data => data._id === id)

  let elements = [...form.elements]
  elements.forEach(element => {
    if(element.name === 'title') {
      element.value = card.title;
    }
    if(element.name === 'subTitle') {
      element.value = card.subTitle
    }
    if(element.name === 'description') {
      element.value = card.description
    }
    if(element.name === 'facebook' && card.social[0]) {
      element.click()
      document.querySelector('input[name="facebookURL"]').value = card.social[0].link
    }
    if(element.name === 'linkedin' && card.social[1]) {
      element.click()
      document.querySelector('input[name="linkedinURL"]').value = card.social[1].link
    }
    if(element.name === 'twitter' && card.social[2]) {
      element.click()
      document.querySelector('input[name="twitterURL"]').value = card.social[2].link
    }
  })
}

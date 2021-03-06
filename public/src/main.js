/* Libraries */
import axios from '../node_modules/axios'

/* Import SCSS */
import './scss/style.scss'


// Let's Grab the Data from the backend on page load
const URL = 'http://localhost:5001/api/menu-items/'
let dataState = []
let isEditing = false
let stateId = ''

// READ
axios.get( URL ).then( resp => {
  let data = resp.data
  console.log(data)
  if(data) {
    dataState = [...data]
    addPageContent(data)
    handleDataLoading('load', false)
    getActionButtons()
  }
})

// Let's print the data dynamically to the browser
const addPageContent = (data) => {
  if(document.querySelector('.items-wrapper') !== null) {
    document.querySelector('.items-wrapper').remove()
  }
  var newDiv = document.createElement( 'div' )
  var att = document.createAttribute( 'class' )
  att.value = 'items-wrapper'
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
                <span class="phone">${item.phone}</span>
              </div>
            </div>`
          }).join( '' )

  newDiv.innerHTML = content
  document.getElementById( 'content').appendChild( newDiv )
}

// Sets Loading Spinner
const handleDataLoading = (type, bool) => {
  let contentLoading = document.querySelector('.content-loading')
  if(!bool && type === 'load') {
    contentLoading.style.display = 'none'
  }
  else if(bool && type === 'load') {
    contentLoading.style.display = 'flex'
  }
}

// Set Form Title, Add User or Edit User
const setFormTitle = () => {
  let formTitle = document.querySelector('.form-title')
  return isEditing ? formTitle.innerHTML = 'Edit User' : formTitle.innerHTML = 'Add User'
}

const setEditMask = () => {
  let editMask = document.querySelector('.edit-mask')
  return isEditing ? editMask.classList.add('active') : editMask.classList.remove('active')
}

// @params isClick <Boolean> - to use reset click event, resets entire form
const setResetForm = (isClick) => {
  let formTitle = document.querySelector('.form-title')

  if(!isClick) {
    // Create Reset Button
    let reset = document.createElement('input')
    reset.setAttribute('type', 'reset')
    reset.value = 'Cancel'
    formTitle.appendChild(reset)

    // Resets form
    let resetButton = document.querySelector('input[type="reset"]')
    resetButton.addEventListener('click', function () {
      isEditing = false
      id = ''
      hideSocialInputs()
      setEditMask()
      setFormTitle()
      reset.remove()
      document.querySelector('#menu-form').reset()
    })
  }

  if(isClick && isEditing) {
    let resetButton = document.querySelector('input[type="reset"]')
    resetButton.click()
  }

  if(isClick && !isEditing) {
    hideSocialInputs()
    document.querySelector('#menu-form').reset()
    setFormTitle()
    id = ''
  }
}

// Let's add click handlers to our checkboxes
let checkBoxes = document.querySelectorAll('input[type="checkbox"]')
checkBoxes.forEach(box => {
  box.addEventListener('click', function(e) {
    let checked = e.target.checked
    let socialName = e.target.name
    handleSocialInput(checked, socialName) // Toggles show/hide specific inputs
  })
})

//Let's Create/Edit and submit our data to the backend
let submitButton = document.querySelector('#handle-submit')
submitButton.addEventListener('click', function(e) {
  e.preventDefault()
  e.stopPropagation()
  handleSubmit()
})

// Show/Hide social html text inputs
const hideSocialInputs = () => {
  let socialInputs = document.querySelectorAll('.social-inputs')
  socialInputs.forEach(input => input.style.display = 'none') // hide inputs initially
}
hideSocialInputs()// Hide on load

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

// Edit and Delete Buttons
const getActionButtons = () => {
  let deleteButtons = document.querySelectorAll('.item .delete')
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation()
      let id = e.target.offsetParent.id
      handleDelete(id)
    })
  })

  let editButtons = document.querySelectorAll('.item .edit')
  editButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation()
      let id = e.target.offsetParent.id
      handleEdit(id)
    })
  })
}

// Handle Submit of form to backend. Handles create and edit
const handleSubmit = () => {
  handleDataLoading('load', true)
  let submitRequest
  let form = document.forms.menuForm // Grab form elements
  let elements = [...form.elements]
  // console.log(elements)

  let obj = {
    social: [],
  }

  elements.forEach((input, index) => {
      if(input.name.indexOf('URL') !== -1 && input.value.length) {
        obj['social'].push({icon: input.name.slice(0,-3), link: input.value})
      }
      else if (input.type !== 'checkbox' && input.value.length) {
          obj[input.name] = input.value
      }
  })

  // Convert image file to base64
  let fileSelector = document.querySelector('#upload')
  let file = fileSelector.files[0]
  let reader = new FileReader()
  reader.onload = (e) => {
    let imageFile64 = e.target.result
    obj.image = imageFile64
    // submitRequest() // When image is base64 send postRequest
  }
  if(file) {
    reader.readAsDataURL(file)
  }

  if(isEditing) {
    // if no pic selected, grab pic from loaded data
    if(!fileSelector.files.length) {
      let group = dataState.find(data => data._id === stateId)
      obj.image = group.image

      // UPDATE
      submitRequest = () => {
        axios.put(URL + stateId, obj).then(resp => {
          let data = resp.data
          dataState = [...data]
          addPageContent(data)
          handleDataLoading('load', false)
          setEditMask()
          setResetForm(true)
          getActionButtons()
        }).catch(error => {
          console.log('error:', error)
        })
      }
      submitRequest()
    }
    // UPDATE
    submitRequest = () => {
      axios.put(URL + stateId, obj).then(resp => {
        let data = resp.data
        dataState = [...data]
        addPageContent(data)
        handleDataLoading('load', false)
        setEditMask()
        setResetForm(true)
        getActionButtons()
      }).catch(error => {
        console.log('error:', error)
      })
    }
  }

  if(!isEditing) {
    console.log('post:', obj);
    // CREATE
    // submitRequest = () => {
    //   axios.post(URL, obj).then((resp) => {
    //     let data = resp.data
    //     dataState = [...data]
    //     addPageContent(data)
    //     handleDataLoading('load', false)
    //     setResetForm(true)
    //     getActionButtons()
    //   }).catch((error) => {
    //     console.log('error:', error)
    //   })
    // }
  }
}

// DELETE
const handleDelete = (id) => {
  handleDataLoading('load', true)

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
  handleDataLoading('edit', true)
  isEditing = true
  stateId = id

  // Open Edit mask
  setEditMask()

  // Set User Text
  setFormTitle()

  // reset form
  setResetForm()

  // Form data
  let form = document.forms.menuForm
  let card = dataState.find(data => data._id === id)

  let elements = [...form.elements]
  elements.forEach(element => {
    if(element.name === 'title') {
      element.value = card.title
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


let form = document.forms.menuForm
const error = document.querySelector('input[name="title"] + span.error')

let elements = [...form.elements]
elements.forEach((el, index) => {
  if(el.type !== 'submit') {
    // console.log('form:', el.type, el.className);
    if((el.type === 'text' || el.type === 'textarea') && el.className !== 'input-ignore') {
      el.addEventListener('input', function(e) {
        isFormValid()
        let error = document.querySelector(`[name="${e.target.name}"] + span.error`)

        if(e.target.validity.valid) {
          error.className = 'error';
        } else {
          showError(el.name);
        }
      })
    }
  }
})

const showError = (name) => {
  let errorSelector = `[name="${name}"] + span.error`
  let error = document.querySelector(errorSelector)
  let selector = `[name="${name}"]`
  let selected = document.querySelector(selector)

  if(selected.validity.valueMissing) {
    error.textContent = 'Required field.';
  }
  else if(selected.validity.patternMismatch) {
    console.log('mismatch :');
    error.textContent = 'Please match format (123)555-1234'
  }
  else if(selected.validity.tooLong) {
    error.textContent = `This field should be a max of ${ selected.maxlength } characters, you entered ${ selected.value.length }.`
  }

  // Set the styling appropriately
  error.className = 'error active';
}

const isFormValid = () => {
  let arr = []
  elements.forEach(el => {
    if((el.type === 'text' || el.type === 'textarea') && el.className !== 'input-ignore') {
      arr.push(el.checkValidity())
    }
  })

  // If all inputs are valid
  let formValid = arr.every((val) => val === true)

  // Set disabled submit button
  if(formValid) {
    document.querySelector('#handle-submit').classList.remove('btn--disabled')
  } else {
    document.querySelector('#handle-submit').classList.add('btn--disabled')
  }
}

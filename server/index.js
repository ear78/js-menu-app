const express = require( 'express' )
const bodyParser = require( 'body-parser' )
const cors = require( 'cors' )
const mongodb = require( 'mongodb' )

const app = express()
const port = process.env.PORT || 5001

//middleware
app.use( bodyParser.json() );
app.use( cors() );

const menuItems = require( './routes/api/menuItems.js' );

app.use( '/api/menu-items', menuItems );

app.listen( port, () => {
    `listening on port ${port}`
} )

const express = require( 'express' );
const mongodb = require( 'mongodb' );

const router = express.Router();

const uri = 'mongodb://elliotr:abc123@ds047325.mlab.com:47325/menu-app'

// Get menuItems
router.get( '/', async ( req, res ) => {
    const menuItems = await loadMenuItems();
    res.send( await menuItems.find()
        .toArray() );
} )

// Add menuItems
router.post( '/', async ( req, res ) => {
    const menuItems = await loadMenuItems();
    await menuItems.insertOne( {
        restaurant: req.body.restaurant,
        title: req.body.title,
        item: {
            title: req.body.item.title,
            description: req.body.item.description,
            calories: req.body.item.calories
        },
        date: new Date()
    } );
    res.status( 201 )
        .send();
} )

// connection string
async function loadMenuItems() {
    const client = await mongodb.MongoClient.connect( uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } )

    return client.db( 'menu-app' )
        .collection( 'menuItems' );
}

module.exports = router;

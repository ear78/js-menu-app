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
            calories: req.body.item.calories,
            price: req.body.item.price
        },
        date: new Date()
    } );
    res.status( 201 )
        .send();
} )

// Delete Menu Item
router.delete( '/:id', async ( req, res ) => {
    const menuItem = await loadMenuItems();
    await menuItem.deleteOne( {
        _id: new mongodb.ObjectID( req.params.id )
    } );
    res.status( 200 )
        .send();
} )

// Update Menu item
router.put( '/:id', async ( req, res ) => {
    const menuItem = await loadMenuItems();
    await menuItem.updateOne( {
        _id: new mongodb.ObjectID( req.params.id )
    }, {
        $set: {}
    } )
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

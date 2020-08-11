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
        title: req.body.title,
        subTitle: req.body.subTitle,
        description: req.body.description,
        social: req.body.social,
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
        $set: {
            text: req.body.text
        }
    } )
    res.status( 200 )
        .send()
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

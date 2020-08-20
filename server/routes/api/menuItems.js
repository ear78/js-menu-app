const express = require( 'express' );
const mongodb = require( 'mongodb' );
const fs = require( 'fs' );

const router = express.Router();

const uri = 'mongodb://elliotr:abc123@ds047325.mlab.com:47325/menu-app'

// Get menuItems
router.get( '/', async ( req, res ) => {
  const menuItems = await loadMenuItems();
  res.send( await menuItems.find().toArray());
})

// Add menuItems
router.post( '/', async ( req, res ) => {
  const menuItem = await loadMenuItems();

  let item = {
    title: req.body.title,
    subTitle: req.body.subTitle,
    description: req.body.description,
    social: req.body.social,
    image: req.body.image,
    date: new Date()
  }

  await menuItem.insertOne(item);
  res.status(201).send(await menuItem.find().toArray());
})

// Delete Menu Item
router.delete( '/:id', async ( req, res, next ) => {
  const menuItem = await loadMenuItems();
  await menuItem.deleteOne( {
    _id: new mongodb.ObjectID( req.params.id )
  } );
  res.status(200).send(await menuItem.find().toArray());
})

// Update Menu item
router.put( '/:id', async ( req, res ) => {
  const menuItem = await loadMenuItems();
  await menuItem.updateOne({
    _id: new mongodb.ObjectID( req.params.id )
  }, {
    $set: {
      title: req.body.title,
      subTitle: req.body.subTitle,
      description: req.body.description,
      social: req.body.social,
      image: req.body.image,
      date: new Date()
    }
  })
  res.status(200).send(await menuItem.find().toArray());
})

// connection string
async function loadMenuItems() {
  const client = await mongodb.MongoClient.connect( uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  return client.db('menu-app')
  .collection('menuItems');
}

module.exports = router;

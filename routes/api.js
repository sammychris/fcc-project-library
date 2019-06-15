/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

let expect = require('chai').expect;
let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectId;

require('dotenv').config();
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        expect(err).to.equal(null);
        db.collection('library').find({}).toArray((err, r) => {
          expect(err).to.equal(null);
          for( let i = 0; i < r.length; i++) {
            r[i].commentcount = r[i].comments.length;
            delete r[i].comments;
          }
          res.json(r);
        });
      });
    })
    
    .post(function (req, res){
      let title = {title: req.body.title, comments: []};
      if(!title.title) return res.send('missing title');
      //response will contain new book object including atleast _id and title
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        expect(err).to.equal(null);
        db.collection('library').insertOne(title, (err, r) => {
          expect(err).to.equal(null);
          res.json(r.ops[0]);
        });
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        expect(err, 'database error').to.not.exist;
        db.collection('library').remove();
        res.send("complete delete successful");
      });
    });

  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = new ObjectId(req.params.id);
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        db.collection('library').find({_id: bookid}).toArray((err, r) => {
          expect(err).to.equal(null);
          if (!r.length) return res.send('no book exists');
          json(r[0]);
        });
      })
    })
    
    .post(function(req, res){
      let bookid = new ObjectId(req.params.id); //Must convert to mongo object id to search by it in db
      let comment = req.body.comment;
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        expect(err).to.equal(null);
        db.collection('library').findAndModify(
          {_id: bookid}, {}, {$push: { comments: comment }},
          {new: true, upsert: false}, (err, r) => {
            expect(err).to.equal(null);
            res.json(r.value);
          });
      });
    })
    
    .delete(function(req, res){
      let bookid = new ObjectId(req.params.id);
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        expect(err).to.equal(null);
        db.collection('library').findOneAndDelete({_id: bookid}, (err, r) => {
          expect(err).to.equal(null);
          res.send("delete successful");
        });
      });
    });
  
};

const express = require('express');
const Category = require('../../models/categories');
const _404Error = require('../../components/responses/404Error');
const categoryComponent = require("../../components/schemas/Category");
const categoryRouter = express.Router();

categoryRouter.route('/')
  .get((req, res, next)=>{
    Category.find({})
    .then((categories)=>{
        Promise.all(
          categories.map(async (category)=> await categoryComponent(category.id))
        )
        .then((mapped_categories)=>{
          return res.json(mapped_categories);
        })
    },(err)=>{
      return _404Error(req, res, err);
    })
    .catch((err)=>{
      return _404Error(req, res, err);
    })
  })
  .post((req, res, next)=>{
    const { name, parent } = req.body;
    Category.create(req.body)
    .then((category)=>{
      res.statusCode = 201
      res.setHeader('Content-Type', 'application/json');
      if(category.parent && category.parent!==null && category.parent!==undefined){
        Category.findByIdAndUpdate(category.parent,{$push:{subcategories: category}})
        .then((parentUpdate)=>{
          return res.json(category);
        }, (err)=>{return _404Error(req, res, err)})
        .catch((err)=> {return _404Error(req, res, err)} )
      }
      else{
        return res.json(category);
      }
    }, (err)=>{
      return _404Error(req, res, err);
    })
    .catch((err)=>{
      return _404Error(req, res, err)
    })

  })
  .put((req, res, next)=>{

  })
  .delete((req, res, next)=>{

  })


module.exports = categoryRouter;

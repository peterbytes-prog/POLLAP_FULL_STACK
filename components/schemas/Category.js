const Category = require('../../models/categories');

async function categoryComponent(id){
  const category = await Category.findById(id).populate('parent');
  return category
}

module.exports = categoryComponent;

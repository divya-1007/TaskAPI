const _ = require('lodash')

const commonService = {
    findByQuery: async( modelName, isFindOne = false, query = {}, projection = DEFAULT_PROJECTION, limit = 0, offset = false, sort = false ,findAndCountAll=false) => {
          console.log();
        if(!_.isObject(query)){
         return Promise.reject(new Error("query must be Object"))
        }

        if(!_.isObject(projection)){
            projection = {}
        }

        if(sort === true){
         return modelName.find(query ,projection).sort({_id: -1})
        }

        if(isFindOne === true){
        return  modelName.findOne( {where:query},projection)
        }

        if(_.isNumber(offset) && limit){
            console.log("hello");
        return modelName.findAndCountAll({ where: query ,limit: limit, offset: offset},projection)
        }else if(limit){
        return modelName.find(query ,projection).limit(limit);
        }
       return modelName.find(query ,projection);
    },

    insertByQuery: async(modelName ,query, fieldChange = false)=>{
     if(!_.isArray(query) && _.isObject(query)){
        return modelName.create(query)
     }
    },
    
    updateByQuery:async(modelName, isFindOne,query = {},uData = {})=>{
     if(!_.isObject(query)){
       return Promise.reject( new Error('Query must be object'))
     }
     if(!_.isObject(uData)){
      return Promise.reject(new Error("Update Data must be object"))
     }
     if(isFindOne === true){
     return modelName.update(query, {where:uData}) 
     }
     return modelName.update(query, {where:uData}) 
    }
}


module.exports = commonService
const APIError = require('../rest').APIError;
 const Sort = require('../model/articleSort')
const Result = require('../model/result.js')
const Tool = require('../tool/tool')

module.exports = {
    'POST /api/sort/:userId/:token': async (ctx, next) => {
        let tokenResult = await Tool.checkToken(ctx)
        if(tokenResult.code != 0){
            ctx.rest(tokenResult)
            return
        }
       var  id = ctx.params.userId,
            token = ctx.params.token,
            t = ctx.request.body,
            m;
        if (!t.sort || !t.sort.trim()) {
            ctx.rest(Result.create(10,{msg:'miss sort'})) 
            return
        } 
        m = new Sort(id,t.sort)
        let sortResult =await Sort.save(m)
        ctx.rest(sortResult)
    },
    'GET /api/sort/:userId/:token': async (ctx, next) => {
        let tokenResult = await Tool.checkToken(ctx)
        if(tokenResult.code != 0){
            ctx.rest(tokenResult)
            return
        }
       let id = ctx.params.userId
       let token = ctx.params.token
       let sortsResult = await Sort.sorts(id)
        ctx.rest(sortsResult)
    },
    'DELETE /api/sort/:id/:userId/:token': async (ctx, next) => {
        let tokenResult = await Tool.checkToken(ctx)
        if(tokenResult.code != 0){
            ctx.rest(tokenResult)
            return
        }
       let id = ctx.params.id
       let user_id =  ctx.params.userId
       let token = ctx.params.token
       let deleteResult =await Sort.deleteSort(id)
       ctx.rest(deleteResult)
 
    },

}

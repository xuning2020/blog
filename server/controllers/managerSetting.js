const APIError = require('../rest').APIError;
const Result = require('../model/result.js')
const path = require('path')
const fs = require('fs')
const Tool = require('../tool/tool')
const Check = require('../tool/check')
const DB = require('../sqlhelp/mysql')
module.exports = {
    //管理用户
    'GET /api/manage/list/:mId/:token': async (ctx, next) => {
        let tokenResult = await Check.checkManageToken(ctx)
        if(tokenResult.code != 0){
            ctx.rest(tokenResult)
            return
        }
       let sql = 'select m_id,m_username,m_group,m_last_login_time,m_login_times,m_head from blog_manager'
       let res = await DB.exec(sql)
       ctx.rest(res)
    },

    'GET /api/manage/info/:manageId/:mId/:token': async (ctx, next) => {
        let tokenResult = await Check.checkManageToken(ctx)
        if(tokenResult.code != 0){
            ctx.rest(tokenResult)
            return
        }
        let paraCheckResult = Check.checkNum(ctx.params,'manageId')
        if(paraCheckResult){
            ctx.rest(paraCheckResult)
            return
        }
       let sql = 'select m_id,m_username,m_group,m_last_login_time,m_login_times,m_head from blog_manager where m_id = ' + ctx.params.manageId
       let res = await DB.exec(sql)
       ctx.rest(Tool.convertResultData(res))
    },

    'Post /api/manage/update/:mId/:token': async (ctx, next) => {
        let tokenResult = await Check.checkManageToken(ctx)
        if(tokenResult.code != 0){
            ctx.rest(tokenResult)
            return
        }
        let paraCheckResult = Check.checkString(ctx.request.body,'oldPassword')
        if(paraCheckResult){
            ctx.rest(paraCheckResult)
            return
        }
        let paraCheckResult = Check.checkString(ctx.request.body,'newPassword')
        if(paraCheckResult){
            ctx.rest(paraCheckResult)
            return
        }
        let oldPass = ctx.request.body.oldPassword
        let newPass = ctx.request.body.newPassword
        let m_id = ctx.params.mId
        let md5OldPass = Tool.md5(oldPass)
        let sql = 'select m_id from blog_manager where m_id = ? and m_password = ?'
        let res = await DB.exec(sql,[m_id,md5OldPass])
        if(res.code != 0){
             ctx.rest(res)
             return
        }
        if(res.data.length == 0){
            ctx.rest(Result.create(501))
            return
        }
        sql = 'update blog_manager set m_password = ? where m_id = ?'
        
        res = await DB.exec(sqlUser,[Tool.md5(newPass),m_id])
        ctx.rest(res)
    },

 
    'POST /api/manage/head/:mId/:token': async (ctx, next) => {
       let tokenResult = await Check.checkManageToken(ctx)
       if(tokenResult.code != 0){
            ctx.rest(tokenResult)
            return
       }
       let id = ctx.params.mId
       let  t = ctx.request.body.files.file
       let oldPath = t.path
       if (!fs.existsSync(oldPath)){
           ctx.rest(Result.create(9))
       }
       let fileType = t.type
       let extension = fileType.split('/')[1]
       let newFileName = id + '-' + new Date().getTime()+ '.' + extension
       let newPath =  path.join(__dirname,'../static/myimg/' + newFileName)
       fs.renameSync(oldPath,newPath)
       let urlPath = "http://localhost:3000/static/myimg/" + newFileName
       let sql = 'update blog_manager set m_head = ? where m_id = ?'
       let res = await DB.exec(sql,[urlPath,id])
       res.data = {url:urlPath}
       ctx.rest(res)
    },
}





























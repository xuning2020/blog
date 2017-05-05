const APIError = require('../rest').APIError;
const User = require('../model/user')
const Result = require('../model/result.js')
const Tool = require('../tool/tool')
const path = require('path')
const fs = require('fs')
const Link = require('../model/link')
const Check = require('../tool/check')
const DB = require('../sqlhelp/mysql')
const Sort = require('../model/articleSort')
const Dynamic = require('../model/dynamic')

module.exports = {
    //管理用户
    'GET /api/manage/user/:mId/:token/:index/:size': async (ctx, next) => {
        let tokenResult = await Check.checkManageToken(ctx)
        if(tokenResult.code != 0){
            ctx.rest(tokenResult)
            return
        }
        let pageResult = Check.checkPage(ctx)
        if(pageResult){
            ctx.rest(pageResult)
            return
        }
       let index = parseInt(ctx.params.index)
       let size = parseInt(ctx.params.size)
       let sqlUser = 'select user_id,user_name,user_isValidate,user_register_time from user limit ?,?'
       let res = await DB.exec(sqlUser,[index * size,size])
       ctx.rest(res)
     },

    'GET /api/manage/userinfo/:userId/:mId/:token': async (ctx, next) => {
        let tokenResult = await Check.checkManageToken(ctx)
        if(tokenResult.code != 0){
            ctx.rest(tokenResult)
            return
        }
        let paraCheckResult = Check.checkNum(ctx.params,'userId')
        if(paraCheckResult){
            ctx.rest(paraCheckResult)
            return
        }
        let userId = parseInt(ctx.params.userId)
        
        let sqlUser = 'select a.* ,b.* from  user a join user_info b on a.user_id = b.user_id where a.user_id = ?'
        let res = await DB.exec(sqlUser,[userId])
        if(res.code == 0){
            if(res.data.length > 0){
                res.data = res.data[0]
            }
            else{
                res = Result.create(8)
            }
        }
        ctx.rest(res)
     },

    'POST /api/login': async (ctx, next) => {
       var
            t = ctx.request.body,
            m;
        if (!t.userName || !t.userName.trim()) {
            ctx.rest(Result.create(10,{msg:'miss userName'})) 
            return
        }
        if (!t.password || !t.password.trim()) {
            ctx.rest(Result.create(10,{msg:'miss password'})) 
            return
        }
        m = {
            userName: t.userName.trim(),
            password: t.password.trim()
        }
        // this a bug which can make the password is not the same from register
       let res =  await User.checkLogin(m.userName)
       if(res.code != 0){
           ctx.rest(res)
           return
       }
       if(res.data.length <= 0){
           ctx.rest(Result.create(500))
           return
       }
       let user = res.data[0]
       
       let pass = user.user_password    
       let mdPass = Tool.md5(m.password)
       if(pass != mdPass){
           ctx.rest(Result.create(501))
           return
       }
       if(user.user_isValidate != 1){
           ctx.rest(Result.create(503,{user_id:user.user_id}))
           return
       }
       let token = Tool.md5(Math.random().toString())
       await User.saveToken(token,user.user_id)
       let result = Result.create(0,{token:token,user_id:user.user_id})
       ctx.rest(result)
      },

    'POST /api/register': async (ctx, next) => {
        let  t = ctx.request.body
        if (!t.nickname || !t.nickname.trim()) {
            ctx.rest(Result.create(10,{msg:'miss nickName'})) 
            return
        }
        if (!t.password || !t.password.trim()) {
            ctx.rest(Result.create(10,{msg:'miss password'})) 
            return
        }
        if (!t.email || !t.email.trim()) {
            ctx.rest(Result.create(10,{msg:'miss email'})) 
            return
        }
        
       let m = {
            nickName: t.nickname.trim(),
            password: t.password.trim(),
            email:t.email.trim()
        }
        if(Check.regexCheck(m.email,'email')){
            ctx.rest(Result.create(11,{msg:'email format wrong'})) 
            return 
        }
        let activityCode = (Math.random() * 100000000).toFixed(0)
        let user = new User(m.email,m.password)
        user.user_register_time = (new Date()).getTime()
        user.user_register_ip = ctx.request.ip
        user.token = Tool.md5(activityCode)
        let res = await User.save(user)
        if(res.code != 0){
            ctx.rest(res)
            return
        }
        let id = res.data.id
        let sql = 'insert into user_info (user_id,user_real_name,user_email) values (?,?,?)'
        res = await DB.exec(sql,[id,m.nickName,m.email])
        //todo. switch the domain
        let mailResult = await Tool.sendEmail(m.nickName,m.email,"http://localhost:8088/#/active/"+id+"/" + activityCode)
        ctx.rest(Result.create(0))
      },
    
   //todo active route need change add the user id to tell the active is need or not
    'GET /api/active/:code': async (ctx, next) => {
        let code = ctx.params.code
        let sql = `select user_id from user where user_token = ?`
        let res = await DB.exec(sql,[Tool.md5(code)])
        if(res.code != 0){
            ctx.rest(res)
            return
        }
        if(res.data.length <= 0){
            ctx.rest(Result.create(101))
            return
        }
        //如果没错
        let user_id = res.data[0].user_id
        sql = "update  user set user_isValidate = 1, user_token = '' where user_id = ?"
        DB.exec(sql,[user_id])
        ctx.rest(Result.create(0))
      },

    'POST /api/checkemail': async (ctx, next) => {
        var  t = ctx.request.body
        if (!t.email || !t.email.trim()) {
            ctx.rest(Result.create(10,{msg:'miss email'})) 
            return
        }

        if(Check.regexCheck(t.email,'email')){
            ctx.rest(Result.create(11,{msg:'email format wrong'})) 
            return 
        }
        let sql = 'select user_id from user_info where user_email = ? ' 
        let res =await DB.exec(sql,[t.email])
        if(res.code != 0){
            ctx.rest(res)
            return
        }
        if(res.data.length == 0){
            ctx.rest(Result.create(0))
            return
        }
        else{
            ctx.rest(Result.create(502))
            return
        }

      },

    'POST /api/checkusername': async (ctx, next) => {
        var  t = ctx.request.body
        if (!t.user_name || !t.user_name.trim()) {
            ctx.rest(Result.create(10,{msg:'miss userName'})) 
            return
        }

        let sql = 'select user_id from user where user_name = ? ' 
        let res =await DB.exec(sql,[t.user_name])
        if(res.code != 0){
            ctx.rest(res)
            return
        }
        if(res.data.length == 0){
            ctx.rest(Result.create(0))
            return
        }
        else{
            ctx.rest(Result.create(504))
            return
        }

      },
     //重新发邮件
    'GET /api/resendemail/:userid': async (ctx, next) => {
        let userid = ctx.params.userid
        let activityCode = (Math.random() * 100000000).toFixed(0)
        let sql = 'update user set user_token = ? where user_id = ?' 
        let res = await DB.exec(sql,[Tool.md5(activityCode),userid])
        sql = 'select user_real_name,user_email from user_detail where user_id = ?'
        res = await DB.exec(sql,[userid])
        let user = res.data[0]
        //DOTO switch the inner net to outer

        await Tool.sendEmail(user.user_real_name,user.user_email,"http://localhost:8088/#/active/"+userid+"/" + activityCode)
        ctx.rest(Result.create(0))
     },
     //上传用户头像
    'POST /api/user/uploadHead/:userId/:token': async (ctx, next) => {
       let result0 = await Check.checkToken(ctx)
        if(result0.code != 0){
            ctx.rest(result0)
            return
        }
       let id = ctx.params.userId
       let token = ctx.params.token
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
       let userInsert = {
           user_id:id,
           user_image_url:urlPath
       }
       let res = await User.updateUserHead(userInsert)
       res.data = {url:urlPath}
       ctx.rest(res)
     },
    
    'GET /api/user/:userId': async (ctx, next) => {
       let id = ctx.params.userId
       //获取个人信息
       let res = await User.userInfoById(id)
       if(res.code != 0){
          ctx.rest(res)
          return
       }
       let userInfo = res.data[0]
       res = await Link.userLinks(id)
       if(res.code != 0){
          ctx.rest(res)
          return
       }
       userInfo.links = res.data
       let sql = `select article_id,article_name,article_create_time,article_brief,article_main_img,article_click,article_status,(select sort_article_name from article_sort where  article_sort.sort_article_id = article.article_sort_id) 
                 as article_sort_name , (select count(comment_id) from user_comment where user_comment.comment_target_id =
                 article.article_id) as comment_count from article where user_id = ?  order by article_create_time desc limit 10`
       res = await DB.exec(sql,[id])
       if(res.code != 0){
          ctx.rest(res)
          return
       }
       userInfo.articles = res.data
       res = await Sort.sorts(id)
       if(res.code != 0){
          ctx.rest(res)
          return
       }
       userInfo.sorts = res.data
       ctx.rest(Result.create(0,userInfo))
     },
    
    'GET /api/userdynamic/:userId': async (ctx, next) => {
       let id = ctx.params.userId
       let res = await Dynamic.userDynamic(id)
       if(res.code != 0){
         ctx.rest(res)
         return
       }
       let dynamics = res.data
       
       let sqlSubCommendIds = dynamics.map(s=>{
           if(s.dynamic_type_id == 7){
               return s.dynamic_target_id
           }
           return 0
       })
       let sqlMainCommendIds = dynamics.map(s=>{
           if(s.dynamic_type_id == 4){
               return s.dynamic_target_id
           }
           if(s.dynamic_type_id == 7){
               return s.dynamic_target_belong_id
           }
           return 0
       })
       let sqlArticlesIds =  dynamics.map(s=>{
           if(s.dynamic_type_id == 4){
               return s.dynamic_target_belong_id
           }
           if(s.dynamic_type_id == 1){
               return s.dynamic_target_id
           }
           return 0
       })
       let sql = ``
       if(sqlSubCommendIds.length > 0){
            sql =  `select comment_id,comment_target_user_id,comment_target_id,comment_content,commenter_user_id,
                   comment_time,comment_type,comment_scope FROM user_sub_comment where comment_id in (` + sqlSubCommendIds.join(',') + `)`
            res = await DB.exec(sql)
            if(res.code != 0){
                ctx.rest(res)
                return
            }
            for(var day of dynamics){
                let com = res.data.find(s=>{
                    return s.commend_id == day.dynamic_target_id && day.dynamic_type_id == 7
                })
                if(com){
                    day.selfObject = com
                }
                else{
                    day.selfObject = {}
                }
            }
       }

       if(sqlMainCommendIds.length > 0){
            sql =  `select comment_id,comment_target_user_id,comment_target_id,comment_content,commenter_user_id,
                    comment_time FROM user_comment where comment_id in (` + sqlMainCommendIds.join(',') + `)`
            res = await DB.exec(sql)
            if(res.code != 0){
                ctx.rest(res)
                return
            }
            for(var day of dynamics){
                if(day.dynamic_type_id == 7){
                    let com = res.data.find(s=>{
                       return s.comment_id == day.dynamic_target_belong_id
                    })
                    if(com){
                        day.targetObject = com
                    }
                    else{
                        day.targetObject = {}
                    }
                }
                if(day.dynamic_type_id == 4){
                    let  com  =  res.data.find(s=>{
                       return s.comment_id == day.dynamic_target_id
                    })
                    if(com){
                        day.selfObject = com
                    }
                    else{
                        day.selfObject = {}
                    }
                }
            }
       }
       
       if(sqlArticlesIds.length > 0){
            sql = `select article_id,article_name,article_create_time,article_brief,article_main_img,article_click,article_status,(select sort_article_name from article_sort where  article_sort.sort_article_id = article.article_sort_id) 
                 as article_sort_name ,(select user_real_name from user_info where user_info.user_id = article.user_id) as user_real_name, (select count(comment_id) from user_comment where user_comment.comment_target_id =
                 article.article_id) as comment_count from article where article_id in (  ` + sqlArticlesIds.join(',') + `)`
            res = await DB.exec(sql)
            if(res.code != 0){
                ctx.rest(res)
                return
            }
            for(var day of dynamics){
                if(day.dynamic_type_id == 4){
                    let art = res.data.find(s=>{
                        return s.article_id == day.dynamic_target_belong_id && day.dynamic_type_id == 4
                    })
                    if(art){
                        day.targetObject = art
                    }
                    else{
                        day.targetObject = {}
                    }
                }
                if(day.dynamic_type_id == 1){
                    let art =  res.data.find(s=>{
                        return s.article_id == day.dynamic_target_id && day.dynamic_type_id == 1
                    })
                    if(art){
                        day.selfObject = art
                    }
                    else{
                        day.selfObject = {}
                    }
                }
                
            }
       }


       ctx.rest(Result.create(0,dynamics))
     },


    'GET /api/usercomment/:userId': async (ctx, next) => {
       let id = ctx.params.userId
       let sql = 'select * from user_comments where commenter_user_id = ' + id + ' order by comment_time desc limit 10'
       let res = await DB.exec(sql)
       if(res.code != 0){
           ctx.rest(res)
           return
       }
       let comments = res.data
       let articleIds = comments.map(s=>{
           if(s.comment_scope == 0){
               return s.comment_target_id
           }
           else{
               return 0
           }
       })
       if(articleIds.length > 0){
           sql = `select article_id,article_name,article_create_time,article_release_time,article_ip,article_click,article_sort_id,
           user_id,article_type_id,article_type,article_brief,article_main_img,(select user_real_name from user_info where user_info.user_id = article.user_id) as user_real_name, (select count(comment_id) from user_comment where user_comment.comment_target_id =
                 article.article_id) as comment_count from article where article_id in (` + articleIds.join(',') + `)`
           res = await DB.exec(sql)
           if(res.code != 0){
               ctx.rest(res)
               return
           }
           for(let com of comments){
               let art = res.data.find(s=>{
                   return s.article_id == com.comment_target_id
               })
               com.target = art
           }
       }
       let subIds =  comments.map(s=>{
           if( s.comment_scope > 0)
                return s.comment_target_id
            else
                return 0
       })
       for(let com of comments){
            let bigCom = comments.find(s=>{
                return s.comment_scope == com.comment_id
            })
            if(!com.target){
                com.target = bigCom
            }
       }
       ctx.rest(Result.create(0,comments))
     },



  
  
    'POST /api/user/updatebasic': async (ctx, next) => {
        var  t = ctx.request.body
        let userIdResult = Check.checkNum(t,'user_id')
        if(userIdResult){
            ctx.rest(userIdResult)
        }
        let userRealNameResult = Check.checkString(t,'user_real_name')
        if(userRealNameResult){
            ctx.rest(userRealNameResult)
        }
        let conditionPhone = ''
        if(t.user_phone){
            if(Check.regexCheck(t.user_phone,'cellphone')){
                ctx.rest(Result.create(11,{msg:'email format wrong'})) 
                return 
            } 
            conditionPhone = ', user_phone = "' +  t.user_phone + '"'
        }
        let conditionQQ = ''
        if(t.user_qq){
            if(Check.regexCheck(t.user_qq,'qq')){
                ctx.rest(Result.create(11,{msg:'email format wrong'})) 
                return 
            }
            conditionQQ = ' , user_qq =  "' + t.user_qq  + '"'
        }
        let conditionAddress = ''
        if(t.user_address){
            conditionAddress = ', user_address =  "' + t.user_address + '"'
        } 
        let user_id = t.user_id
        let user_real_name = t.user_real_name
        let sql = ''
        let res = {}
        //need check the user_name is valid
        if(t.user_name){
            sql = 'update user set user_name = ? where user_id = ?'
            res = await DB.exec(sql,[t.user_name,user_id])
            if(res.code != 0){
                ctx.rest(res)
            }
        }
        sql = 'update user_info set user_real_name = ? ' + conditionAddress + conditionPhone + conditionQQ + ' where user_id = ?'
        res = await DB.exec(sql,[user_real_name,user_id]) 
        ctx.rest(res)
       },


    'POST /api/user/updateindividual': async (ctx, next) => {
        var  t = ctx.request.body
        let userIdResult = Check.checkNum(t,'user_id')
        if(userIdResult){
            ctx.rest(userIdResult)
            return
        }
        let userGenderResult = Check.checkString(t,'user_gender')
        if(userGenderResult){
            ctx.rest(userGenderResult)
            return
        }
        let conditionBirthday = ''
        if(t.user_birthday){
            let userBirthdayResult = Check.checkNum(t,'user_birthday')
            if(userBirthdayResult){
                ctx.rest(userBirthdayResult) 
                return 
            } 
            conditionBirthday = ', user_birthday = ' +  t.user_birthday
        }
        


        let user_id = t.user_id
        let user_real_name = t.user_real_name
        let sql = ''
        let res = {}
        //need check the user_name is valid
        sql = 'update user_info set user_gender = ? ' + conditionBirthday + ' where user_id = ?'
        res = await DB.exec(sql,[t.user_gender,user_id]) 
        if(res.code != 0){
            ctx.rest(res)
            return
        }
         console.log(t.user_description)
        if(t.user_description){
           
            sql = 'update user_info set user_description = ? where user_id = ?'
            res = await DB.exec(sql,[t.user_description,user_id]) 
            if(res.code != 0){
                ctx.rest(res)
                return
            }
        }

        if(t.user_says){
             sql = 'update user_info set user_says = ? where user_id = ?'
            res = await DB.exec(sql,[t.user_says,user_id]) 
            if(res.code != 0){
                ctx.rest(res)
                return
            }
        }
        ctx.rest(Result.create(0))
      },


    'POST /api/user/updatepassword': async (ctx, next) => {
        var  t = ctx.request.body
        let userIdResult = Check.checkNum(t,'user_id')
        if(userIdResult){
            ctx.rest(userIdResult)
            return
        }
        let userOldPassResult = Check.checkString(t,'old_password')
        if(userOldPassResult){
            ctx.rest(userOldPassResult)
            return
        }
        let userNewPassResult = Check.checkString(t,'new_password')
        if(userNewPassResult){
            ctx.rest(userNewPassResult)
            return
        }
        


        let user_id = t.user_id
        let old_password = t.old_password
        let new_password = t.new_password
        if(old_password == new_password){
            ctx.rest(Result.create(505))
            return
        }
        let sql = 'select user_id,user_password from user where user_id = ?'
        let res = await DB.exec(sql,[user_id])
        if(Tool.md5(old_password) != res.data[0].user_password){
            ctx.rest(Result.create(501))
            return
        }
        sql = 'update user set user_password = ? where user_id = ?'
        res = await DB.exec(sql,[Tool.md5(new_password),user_id])
        ctx.rest(res)
      },
}



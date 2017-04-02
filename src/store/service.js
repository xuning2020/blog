import axios from 'axios'
import {getUrl} from  '../tool/urlTool'
import qs from 'qs'
import {tool} from '../tool/tool'
import {baseUrl} from '../config/env'
import {setpromisePost,setpromiseGet,setpromiseDelete,setpromisePut} from './conf'
const HostName = baseUrl







 export const uploadImgUrl =  function(){
     let userId = 0
     if (getStore('token')){
         userId =  userId
     }
    return HostName +  'uploadImg/' + userId  + '/' + createToken()
 }

export const login = function(userName,password){
    const url =  HostName + 'login'
    return setpromisePost(url,{userName:userName,password:password})
}

export const getUserInfo = function(){
    const url = HostName +  'user/' + userId + '/' + createToken()
    return setpromiseGet(url)
}

export const getTags = function(){
    const url = HostName +  'tag/' + userId + '/' + createToken()
    return setpromiseGet(url)
}

export const addTag = function(tag){
    const url = HostName +  'tag/' + userId + '/' + createToken()
    return setpromisePost(url,{tag:tag})
}

export const deleteTag = function(tag){
    const url = HostName +  'tag/' + tag.tag_id + '/' + userId + '/' + createToken() 
    return setpromiseDelete(url)
}

export const getSorts = function(){
    const url = HostName + 'sort/' + userId + '/' + createToken()
    return setpromiseGet(url)
}


export const addSort = function(sort){
    const url = HostName +  'sort/' + userId + '/' + createToken()
    return setpromisePost(url,{sort:sort})
}

export const deleteSort = function(sort){
    const url = HostName +  'sort/'  + sort.sort_article_id + '/' + userId + '/' + createToken() 
    return setpromiseDelete(url)
}

export const saveArticle = function(article){
    if(article.articleId > 0){
        const url = HostName +  'article/'+ article.articleId + '/'+ userId + '/' + createToken()
        return setpromisePut(url,article)
    }
    else{
        const url = HostName +  'article/' + userId + '/' + createToken()
        return setpromisePost(url,article)
    }
    
}



export const deleteAticle = function(article){
     const url = HostName +  'article/'  + article.article_id + '/' + userId + '/' + createToken()
     return setpromiseDelete(url)
}

export const articleList = function(index,size){
    const url = HostName +  'article/' + userId + '/' + createToken() + '/' + index + '/' + size
    return setpromiseGet(url)
}

export const articleById = function(article_id){
    const url = HostName +  'article/' + article_id + '/' + userId + '/' + createToken()
    return setpromiseGet(url)
}

export const saveTempArticle = function(article){
    const url = HostName +  'autosavearticle/' + userId + '/' + createToken()
    return setpromisePost(url,article)
 }
export const tempArticle = function(){
    const url = HostName +  'temparticle/' +  userId + '/' + createToken()
    return setpromiseGet(url)
}

export const indexArticle = function(){
    const url = HostName +  'article/'  + userId
    return setpromiseGet(url)
}

// 
export const releaseArticle = function(status,ids){
    const url = HostName +  'releaseArticle/' +  userId + '/' + createToken()
    return setpromisePost(url,{releaseIds:ids,setType:status})
}

export const getSysytemInfo = function(){
    const url = HostName +  'system/' + userId + '/' + createToken()
    return setpromiseGet(url)
}
export const uploadSysytemInfo = function(system){
    const url = HostName +  'system/' + userId + '/' + createToken()
    return setpromisePost(url,system)
}

export const getUserLinks = function(){
    const url = HostName +  'link/' + userId + '/' + createToken()
    return setpromiseGet(url)
}

export const updateUserLinks = function(links){
    const url = HostName +  'link/' + userId + '/' + createToken()
    return setpromisePost(url,links)
}

export const updateFriendLinks = function(link){
    const url = HostName +  'link/'+ link.link_id +'/' + userId + '/' + createToken()
    return setpromisePost(url,link)
}
export const deleteLink = function(link_id){
    const url = HostName +  'link/'+ link_id +'/' + userId + '/' + createToken()
    return setpromiseDelete(url)
}

export const submitComment = (comment)=>{
    let url = HostName +  'comment'
    if(getStore('token')){
        url = HostName +  'comment/'+ userId + '/' + createToken()
    }
    return setpromisePost(url,comment)
}

export const getComment =(commentId)=>{
    let url = HostName +  'comment/'+ commentId 
    if(getStore('token')){
        url = HostName +  'comment/'+ commentId  +'/'+ userId + '/' + createToken()
    }
    return setpromiseGet(url)
}



export const getStoredFiles = ()=>{
    let url = HostName +  'file' 
    if(getStore('token')){
        url = HostName +  'file/'+ userId + '/' + createToken()
    }
    return setpromiseGet(url)
}


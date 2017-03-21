

const demo = r => require.ensure([], () => r(require('../page/demo')), 'demo')
const menu = r => require.ensure([], () => r(require('../page/menu')), 'menu')



const index = r => require.ensure([], () => r(require('../page/blog/index')), 'index')





const manageLogin = r => require.ensure([], () => r(require('../page/backstage/login')), 'manageLogin')
const manage = r => require.ensure([], () => r(require('../page/backstage/com/home')), 'manage')
const blogSummary  = r => require.ensure([], () => r(require('../page/backstage/summary')), 'blogSummary')

const editArticle  = r => require.ensure([], () => r(require('../page/backstage/editArticle')), 'editArticle')
 
const manageArticle =  r => require.ensure([], () => r(require('../page/backstage/manageArticle')), 'manageArticle')

const manageArticleDetail =  r => require.ensure([], () => r(require('../page/backstage/detailArticle')), 'manageArticleDetail')

const manageTag =  r => require.ensure([], () => r(require('../page/backstage/manageTag')), 'manageTag')

export default [
    {
        path: '/',
        component: index, //顶层路由，对应index.html
      
    },



    
    {
        path: '/manage/login',
        component: manageLogin,
        name:'manageLogin'
    },
     {
        path: '/manage',
        component: manage,
        children:[
            {
                path:'/',
                component:blogSummary
            },
            {
                path:'summary',
                component:blogSummary
            },
            {
                path:'editArticle/:id',
                component:editArticle
            },
            {
                path:'manageArticle',
                component:manageArticle
            },
            {
                path:'article/:id',
                component:manageArticleDetail
            },
            {
                path:'tag',
                component:manageTag
            }
        ]
    },



    {
        path: '/demo',
        component: demo,
        name:'demo'
    },
    {
        path: '/menu',
        component: menu,
        name:'menu'
    },

]
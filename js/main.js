function createElemWithText (paraInput = "p", newTextInput = "", className = "") {
    const para = document.createElement(paraInput);
    para.textContent = newTextInput;
    para.className = className;
    return para;
}

function createSelectOptions (users) {
    if (!users) return;   
    const options = users.map((data) => {
        const option = document.createElement("option");
        option.value = data.id;
        option.textContent = data.name;
        return option;
    });
    return options;
}


function toggleCommentSection (postId) {
    if (!postId) return;
    const sectionId = document.querySelector(`section[data-post-id='${postId}']`);    
    if(sectionId === null){
        return null;
    }
    else{
        sectionId.classList.toggle('hide');
    }  
    return sectionId;
}



function toggleCommentButton (postId) {
    if (!postId) return;
    const buttonID = document.querySelector(`button[data-post-id='${postId}']`);    
    if(buttonID === null){
        return null;
    }
    else if(buttonID.textContent === 'Show Comments'){
        buttonID.textContent = 'Hide Comments';
    }
    else {
        buttonID.textContent = 'Show Comments';
    } 
    return buttonID;
}

function deleteChildElements (parentElement) {
    if (!parentElement?.tagName) return;
    let child = parentElement.lastElementChild;
    while (child != null){
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
    return parentElement;
}

function addButtonListeners() {
    const buttons = document.querySelectorAll("main button");
    buttons.forEach(button => {
        let postId = button.dataset.postId
        button.addEventListener("click", function(e) {toggleComments(e, postId)}, false);
        return button;
    })
    return buttons;
}

function removeButtonListeners () {
    const buttons = document.querySelectorAll("main button");
    buttons.forEach(button => {
        let postId = button.dataset.postId
        button.removeEventListener("click", function(e) {toggleComments(e, postId)}, false);
        return button;
    })
    return buttons;
}

function createComments (comments) {
    if (!comments) return;
    var fragment = document.createDocumentFragment();
    comments.map((comment) => {
        let article = document.createElement('article');
        let h3 = createElemWithText('h3', comment.name);
        let para1 = createElemWithText('p', comment.body);
        let para2 = createElemWithText('p', `From: ${comment.email}`);
        article.append(h3, para1, para2);  
        fragment.append(article);
        return fragment;
    });
    return fragment;
}

function populateSelectMenu (users) {
    if(!users) return;
    const user = document.getElementById('selectMenu')
    const userJson = createSelectOptions(users);
    userJson.forEach((data) => {
        user.append(data)
        return user;
    });
    return user;
    
}

const err = ('No JSON data found');

const getUsers = async () => {
    try{
    const users = await fetch(`https://jsonplaceholder.typicode.com/users`);
    return await users.json();
    } catch(err){
        console.error(err)
    }
}

const getUserPosts = async (userId) => {
    if(!userId) return;
    try{
    const userPost = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
    return await userPost.json();
    } catch(err){
        console.error(err)
    }
}

const getUser = async (userId) => {
    if(!userId) return;
    try{
    const user = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    return await user.json();
    } catch(err){
        console.error(err)
    }
}

const getPostComments = async (postId) => {
    if(!postId) return;
    try{
    const post = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
    return await post.json();
    } catch(err){
        console.error(err)
    }
}

const displayComments = async (postId) => {
    if(!postId) return;
    const section = document.createElement('section');
    section.dataset.postId = postId;
    section.classList.add('comments', 'hide');
    const comments = await getPostComments(postId);
    const fragment = createComments(comments);
    section.append(fragment);
    return section;
}

const createPosts = async (posts) => {
    if(!posts) return;
    const fragElem = document.createDocumentFragment();
    for (const post of posts){
        const article = document.createElement('article');
        const h2 = createElemWithText('h2', post.title);
        const para = createElemWithText('p', post.body);
        const paraId = createElemWithText('p', `Post ID: ${post.id}`);
        const author = await getUser(post.userId)
        const paraText = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        const paraCatchPhrase = createElemWithText('p', `${author.company.catchPhrase}`)
        const button = createElemWithText('button', 'Show Comments')
        button.dataset.postId = post.id;
        article.append(h2, para, paraId, paraText, paraCatchPhrase, button);
        let section = await displayComments(post.id);
        article.append(section);    
        fragElem.append(article);
    }
    return fragElem;
}

const displayPosts = async (posts) => {
    let select = document.querySelector("main");
    let element = (posts?.length) ? await createPosts(posts) : createElemWithText('p', "Select an Employee to display their posts.", "default-text");
    select.append(element);
    return element;
}

function toggleComments (e, postId) {
    if(!e) return;
    if(!postId) return;
    e.target.listener = true;
    let section = toggleCommentSection(postId);
    let button = toggleCommentButton(postId);
    return [section, button];
}

const refreshPosts = async (posts) => {
    if (!posts) return;
    const removeButtons = removeButtonListeners();
    let main = deleteChildElements(document.querySelector("main"));
    let fragment =  await displayPosts(posts);
    let addButtons = addButtonListeners();
    return [removeButtons, main, fragment, addButtons];
}

const selectMenuChangeEventHandler = async (e) => {
    let userId = e?.target?.value || 1;
    let posts = await getUserPosts(userId);
    let refreshPostsArray = await refreshPosts(posts);
    return [userId, posts, refreshPostsArray];
}

const initPage = async () => {
    let users = await getUsers();
    let select = populateSelectMenu(users);
    return [users, select];
}

function initApp () {
    initPage();
    let selectMenu = document.getElementById("selectMenu");
    selectMenu.addEventListener('change', function (e) {selectMenuChangeEventHandler(e)});
}

document.addEventListener("DOMContentLoaded", initApp);
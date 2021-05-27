
window.onload=function(){
    let arr=[];
let btn=document.getElementsByTagName("button")[0];
btn.onclick=function(){
let input=document.querySelector("#inp").value;

    arr.push(input);
    console.log(arr);
}
}
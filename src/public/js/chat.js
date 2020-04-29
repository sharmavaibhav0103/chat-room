const socket = io()
const form = document.querySelector('form');
const shareLocationBtn = document.querySelector('#share-location-btn');
const $messages = document.querySelector('#messages');
const $messageTemplate = document.getElementById('message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-template').innerHTML;
const siderbarTemplate = document.querySelector('#sidebar-template').innerHTML;

window.addEventListener('load', () => {form.children[0].focus();});
//Message Submition
form.addEventListener('submit',function(e){
    e.preventDefault();
    let globalMsg = e.target.elements[0].value;

    socket.emit('message', globalMsg);

    e.target.elements[0].value = '';
})
const autoscroll = () => {
    // New message element
    $messages.lastElementChild.scrollIntoView(true);
}
//Join
const { userName, room }  = Qs.parse(window.location.search, { ignoreQueryPrefix: true });
console.log(userName, room);
socket.emit('join', { userName, room }, (error) => {
    if(error){
        alert('Username is already in use.!');
        location.href = '/';
    }
})

//Sharing Location
shareLocationBtn.addEventListener('click',function(){
    navigator.geolocation.getCurrentPosition(success, error);

    function success(pos){
        socket.emit('coords',{
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        })
    }
    function error(e){
        console.log(e);
         alert('Your browser doesn\'t support geo-location.')
    }

})
    //gMapsURL
    socket.on('gMapsURL',(url) => {
        console.log(url)
        const locationHTML = Mustache.render($locationTemplate,{
            locations: url.text,
            createdAt: moment(url.createdAt).format('hh:mm a')
        });
        $messages.insertAdjacentHTML('beforeend',locationHTML);
        autoscroll()
    });

//Receiving the Global message and rendering 
socket.on('msgToAll',(msg) => {
    const html = Mustache.render($messageTemplate,{
        userName: msg.userName,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    $messages.scrollIntoView(true);
    autoscroll()
});

//rendering user list
socket.on('roomData',({ room,users }) => {
    const html = Mustache.render(siderbarTemplate, {
        room, users
    });
    console.log(html)
    document.querySelector('#chat-sidebar').innerHTML = html
})